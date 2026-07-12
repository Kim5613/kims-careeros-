/**
 * 从 OB 项目复盘目录读取笔记 → 生成 src/data/domain-tracks.ts
 * 用法: node scripts/sync-ob-tracks.js
 */

const fs = require('fs');
const path = require('path');

const OB_DIR = 'D:\\ob\\个人\\项目复盘';
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'domain-tracks.ts');

// Parse skill line: "- 技能名: 等级 | 分类 | 描述 | 目标 等级"
function parseSkillLine(line) {
  const match = line.match(/^\s*-\s*(.+?):\s*(\d)\s*\|\s*(hard|soft|domain|tool)\s*\|?\s*(.*)$/);
  if (!match) return null;
  const [, name, level, category, rest] = match;
  const skill = {
    name: name.trim(),
    category,
    currentLevel: parseInt(level),
    description: '',
    targetLevel: undefined,
  };
  const targetMatch = rest.match(/^(.*?)\|\s*目标\s*(\d)\s*$/);
  if (targetMatch) {
    skill.description = targetMatch[1].trim();
    skill.targetLevel = parseInt(targetMatch[2]);
  } else {
    skill.description = rest.trim();
  }
  return skill;
}

// Parse a single project file
function parseProjectFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let domain = '';
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const dMatch = fmMatch[1].match(/domain:\s*(.+)/);
    if (dMatch) domain = dMatch[1].trim();
  }

  const tracks = [];
  let currentTrack = null;
  let currentCompany = '';
  let skillId = 0;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match && !line.includes('公司')) {
      if (currentTrack) tracks.push(currentTrack);
      var rawName = h2Match[1].trim();
      // Strip English subtitle in parentheses
      rawName = rawName.replace(/\s*\([^)]*\)\s*/g, '').trim();
      currentTrack = { name: rawName, skills: [] };
      skillId = 0;
    }

    const h3Match = line.match(/^###\s+公司:\s*(.+)/);
    if (h3Match) currentCompany = h3Match[1].trim();

    if (currentTrack && line.match(/^\s*-\s*.+?:\s*\d\s*\|\s*(hard|soft|domain|tool)/)) {
      const skill = parseSkillLine(line);
      if (skill) {
        skillId++;
        currentTrack.skills.push({
          ...skill,
          id: `${currentTrack.name.toLowerCase()}-${skillId}`,
        });
      }
    }
  }
  if (currentTrack) tracks.push(currentTrack);
  return { domain, tracks };
}

// Scan all .md files recursively (exclude templates)
function scanFiles(dir) {
  const files = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.isDirectory()) { walk(path.join(d, entry.name)); continue; }
      if (entry.name.endsWith('.md') && !entry.name.includes('模板')) {
        files.push(path.join(d, entry.name));
      }
    }
  }
  walk(dir);
  return files;
}

// ── Main ──

if (!fs.existsSync(OB_DIR)) {
  console.log('OB directory not found (' + OB_DIR + ') — skipping sync (this is expected on server)');
  process.exit(0);
}

const files = scanFiles(OB_DIR);
console.log('Found ' + files.length + ' project file(s)');

const domainMap = {};

for (const file of files) {
  console.log(`  Parsing: ${path.relative(OB_DIR, file)}`);
  const { domain, tracks } = parseProjectFile(file);
  if (!domain || tracks.length === 0) {
    console.log(`    -> skipped (no domain or tracks)`);
    continue;
  }

  if (!domainMap[domain]) domainMap[domain] = {};

  for (const track of tracks) {
    if (!domainMap[domain][track.name]) {
      domainMap[domain][track.name] = { skills: [] };
    }
    const existing = domainMap[domain][track.name];
    for (const skill of track.skills) {
      const idx = existing.skills.findIndex(function(s) { return s.name === skill.name; });
      if (idx >= 0) existing.skills[idx] = skill;
      else existing.skills.push(skill);
    }
  }
}

// Generate TypeScript
const DOMAIN_COLORS = {
  HR: '#8b7cf0', 行政: '#597ef7', 产品: '#13c2c2', 开发: '#52c41a',
  设计: '#fa8c16', 市场: '#eb2f96', 销售: '#ff6b6b', 财务: '#722ed1',
  法务: '#2f54eb', 运营: '#faad14',
};

const TRACK_COLORS = ['#8b7cf0', '#597ef7', '#13c2c2', '#52c41a', '#fa8c16', '#eb2f96', '#ff6b6b', '#722ed1', '#2f54eb', '#faad14'];

var ts = '// Auto-generated from OB project reviews. DO NOT EDIT MANUALLY.\n';
ts += '// Run: node scripts/sync-ob-tracks.js\n';
ts += '// Generated: ' + new Date().toISOString() + '\n\n';
ts += 'export type SkillCategory = "hard" | "soft" | "domain" | "tool";\n';
ts += 'export type SkillLevel = 1 | 2 | 3 | 4;\n\n';
ts += 'export interface Skill {\n';
ts += '  id: string;\n  name: string;\n  category: SkillCategory;\n  currentLevel: SkillLevel;\n  targetLevel?: SkillLevel;\n  description?: string;\n}\n\n';
ts += 'export interface Track {\n';
ts += '  id: string;\n  name: string;\n  subtitle: string;\n  emoji: string;\n  color: string;\n  description: string;\n  skills: Skill[];\n}\n\n';
ts += 'export interface DomainData {\n  id: string;\n  label: string;\n  description: string;\n  tracks: Track[];\n}\n\n';

var domains = [];
var trackColorIdx = 0;

var domainNames = Object.keys(domainMap);
for (var di = 0; di < domainNames.length; di++) {
  var domainName = domainNames[di];
  var trackMap = domainMap[domainName];
  var domainId = domainName.toLowerCase();
  var domainColor = DOMAIN_COLORS[domainName] || '#8b7cf0';

  ts += '// ── ' + domainName + ' ──\n';
  ts += 'const ' + domainId + 'Tracks: Track[] = [\n';

  var trackNames = Object.keys(trackMap);
  for (var ti = 0; ti < trackNames.length; ti++) {
    var trackName = trackNames[ti];
    var data = trackMap[trackName];
    var trackId = trackName.toLowerCase().replace(/\s+/g, '-');
    var color = TRACK_COLORS[trackColorIdx % TRACK_COLORS.length];
    trackColorIdx++;

    var descriptions = [];
    for (var si = 0; si < data.skills.length; si++) {
      if (data.skills[si].description && descriptions.indexOf(data.skills[si].description) === -1) {
        descriptions.push(data.skills[si].description);
      }
    }
    var desc = descriptions.length > 0 ? descriptions[0] : trackName;

    var skillLines = [];
    for (var si = 0; si < data.skills.length; si++) {
      var s = data.skills[si];
      var line = '    { id: "' + trackId + (si + 1) + '", name: "' + s.name + '", category: "' + s.category + '", currentLevel: ' + s.currentLevel;
      if (s.targetLevel) line += ', targetLevel: ' + s.targetLevel;
      if (s.description) line += ', description: "' + s.description.replace(/"/g, '\\"') + '"';
      line += ' }';
      skillLines.push(line);
    }

    if (ti > 0) ts += ',\n';
    ts += '  {\n';
    ts += '    id: "' + trackId + '",\n';
    ts += '    name: "' + trackName + '",\n';
    ts += '    subtitle: "",\n';
    ts += '    emoji: "",\n';
    ts += '    color: "' + color + '",\n';
    ts += '    description: "' + desc.replace(/"/g, '\\"') + '",\n';
    ts += '    skills: [\n';
    ts += skillLines.join(',\n') + '\n';
    ts += '    ],\n';
    ts += '  }';
  }

  ts += '\n];\n\n';
  domains.push({ id: domainId, name: domainName, varName: domainId + 'Tracks' });
}

// Registry
ts += 'export const DOMAIN_REGISTRY: Record<string, DomainData> = {\n';
for (var di = 0; di < domains.length; di++) {
  var d = domains[di];
  ts += '  "' + d.id + '": { id: "' + d.id + '", label: "' + d.name + '", description: "", tracks: ' + d.varName + ' },\n';
}
ts += '};\n\n';

// All domains (always include all 10 base domains, availability from OB)
var ALL_BASE = [
  { id: 'hr', label: 'HR', color: '#8b7cf0' },
  { id: 'admin', label: '行政', color: '#597ef7' },
  { id: 'product', label: '产品', color: '#13c2c2' },
  { id: 'dev', label: '开发', color: '#52c41a' },
  { id: 'design', label: '设计', color: '#fa8c16' },
  { id: 'marketing', label: '市场', color: '#eb2f96' },
  { id: 'sales', label: '销售', color: '#ff6b6b' },
  { id: 'finance', label: '财务', color: '#722ed1' },
  { id: 'legal', label: '法务', color: '#2f54eb' },
  { id: 'ops', label: '运营', color: '#faad14' },
];
ts += 'export const ALL_DOMAINS = [\n';
for (var bi = 0; bi < ALL_BASE.length; bi++) {
  var b = ALL_BASE[bi];
  var hasData = domainMap[b.label] ? true : false;
  ts += '  { id: "' + b.id + '", label: "' + b.label + '", color: "' + b.color + '", available: ' + hasData + ' },\n';
}
ts += '];\n';

fs.writeFileSync(OUTPUT, ts, 'utf-8');
console.log('\nWritten ' + domains.length + ' domain(s) to domain-tracks.ts');
for (var di = 0; di < domains.length; di++) {
  var dn = domains[di].name;
  var tc = Object.keys(domainMap[dn]).length;
  var sc = 0;
  var tks = domainMap[dn];
  var tns = Object.keys(tks);
  for (var ti = 0; ti < tns.length; ti++) {
    sc += tks[tns[ti]].skills.length;
  }
  console.log('  ' + dn + ': ' + tc + ' tracks, ' + sc + ' skills');
}
