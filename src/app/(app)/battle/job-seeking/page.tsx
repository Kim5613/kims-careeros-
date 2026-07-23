'use client';

import React, { useState, useMemo } from 'react';
import { Typography, Tag, Button, Input, Form, Select, DatePicker, Row, Col, message, Progress, Checkbox } from 'antd';
import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { openAIPanel } from '@/components/AISkillPanel';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc); dayjs.extend(timezone);
const now = () => dayjs().tz('Asia/Shanghai');
const { Text } = Typography;
const { TextArea } = Input;

// ── 阶段定义 ──
const STAGES = [
  { key:'prep', label:'投前诊断', icon:'🔮', color:'#8b7cf0', hint:'JD + 简历 → AI 匹配度分析' },
  { key:'applied', label:'已投递', icon:'📬', color:'#fa8c16', hint:'追踪投递反馈 · 超时预警' },
  { key:'interview', label:'面试追踪', icon:'🎯', color:'#52c41a', hint:'多轮记录 · 能力覆盖 · 复盘' },
  { key:'offer', label:'Offer 对比', icon:'💰', color:'#eb2f96', hint:'薪资对比 · 总包计算 · 谈薪建议' },
  { key:'onboard', label:'入职准备', icon:'🚀', color:'#1890ff', hint:'倒计时 · 材料清单' },
] as const;

const SOURCES = ['内推','猎头','官网','Boss直聘','脉脉','猎聘','其他'];
const INTERVIEW_TYPES = ['视频','现场','电话'];
const INTERVIEW_ROLES = ['HRBP','业务负责人','技术总监','HRD','VP','CEO','其他'];

// ── 类型 ──
interface JobApp {
  id:string; companyName:string; positionName:string; salaryMin:number|null; salaryMax:number|null;
  stage:string; source:string|null; appliedDate:string|null; notes:string|null;
  resumeVersion:string|null; jdText:string|null;
  diagnosis:any|null;
  interviews:any[]; offer:any|null; checklist:any[];
  createdAt:string;
}

// ── Mock 数据 ──
const MOCK: JobApp[] = [
  { id:'1',companyName:'字节跳动',positionName:'高级前端工程师',salaryMin:40000,salaryMax:60000,stage:'interview',source:'内推',appliedDate:'2026-07-15',notes:null,resumeVersion:'v3',jdText:'负责抖音电商前端架构…',diagnosis:{score:78,level:'green',abilities:[{name:'React/TS 深度架构',match:'high'},{name:'跨端 RN/Flutter',match:'high'},{name:'B端复杂系统 >3年',match:'partial'},{name:'性能优化 100w+ DAU',match:'partial'},{name:'团队管理 5人+',match:'gap'},{name:'开源项目维护',match:'gap'}],research:'业务增长期，HC 真实。技术氛围好，加班较多。',summary:'技术栈高度匹配，面试重点攻管理和开源',sources:['公众号: 字节跳动技术团队','小红书: 3帖','财报: Q1']},interviews:[{round:'一面',date:'2026-07-18',type:'视频',interviewer:'李技术',role:'技术总监',abilityTags:['React/TS 深度架构','跨端 RN/Flutter'],questions:'1. 100w DAU 前端架构设计\n2. 跨端方案选型\n3. 微前端在电商场景的应用',feeling:'面试官技术很深，追问到位',result:'通过',reviewNotes:'架构题答得好，微前端经验可以再准备深入案例'},{round:'二面',date:'2026-07-21',type:'视频',interviewer:'张总监',role:'业务负责人',abilityTags:['B端复杂系统 >3年'],questions:'1. B端复杂表单方案\n2. 跨部门协作最大挑战',feeling:'偏管理和协作',result:'待反馈',reviewNotes:''}],offer:null,checklist:[],createdAt:'2026-07-15'},
  { id:'2',companyName:'美团',positionName:'HRBP',salaryMin:30000,salaryMax:45000,stage:'interview',source:'猎头',appliedDate:'2026-07-18',notes:null,resumeVersion:'v3',jdText:null,diagnosis:{score:65,level:'yellow',abilities:[{name:'HRBP 全盘',match:'high'},{name:'组织诊断',match:'partial'},{name:'业务理解力',match:'partial'},{name:'招聘体系搭建',match:'high'},{name:'员工关系',match:'gap'}],research:'业务稳定，HR 体系成熟。',summary:'能力基本匹配，需补强业务理解',sources:['公众号: 美团技术','脉脉: 2帖']},interviews:[{round:'一面',date:'2026-07-20',type:'现场',interviewer:'王HRD',role:'HRD',abilityTags:['HRBP 全盘','组织诊断'],questions:'1. 组织诊断案例\n2. 人员优化处理\n3. 对美团文化的理解',feeling:'氛围正式，重实操',result:'待反馈',reviewNotes:'组织诊断案例准备不够充分'}],offer:null,checklist:[],createdAt:'2026-07-18'},
  { id:'3',companyName:'阿里巴巴',positionName:'前端专家',salaryMin:50000,salaryMax:70000,stage:'applied',source:'官网',appliedDate:'2026-07-19',notes:null,resumeVersion:'v2',jdText:null,diagnosis:{score:70,level:'yellow',abilities:[{name:'React 深度',match:'high'},{name:'Node.js 全栈',match:'partial'},{name:'PaaS 平台经验',match:'gap'}],research:'业务稳定，技术品牌强。',summary:'技术能力达标，缺平台经验',sources:['官网','脉脉: 1帖']},interviews:[],offer:null,checklist:[],createdAt:'2026-07-19'},
  { id:'4',companyName:'腾讯',positionName:'招聘经理',salaryMin:35000,salaryMax:50000,stage:'prep',source:null,appliedDate:null,notes:'JD 匹配度不错，需了解团队具体情况',resumeVersion:null,jdText:'负责腾讯云招聘全流程…',diagnosis:{score:68,level:'yellow',abilities:[{name:'招聘全流程',match:'high'},{name:'雇主品牌',match:'partial'},{name:'数据分析',match:'gap'},{name:'校园招聘',match:'high'}],research:'腾讯云扩张期，HC 多。',summary:'整体匹配，数据分析是短板',sources:['公众号: 腾讯云','财报: Q1']},interviews:[],offer:null,checklist:[],createdAt:'2026-07-20'},
  { id:'5',companyName:'小红书',positionName:'HRBP Lead',salaryMin:40000,salaryMax:55000,stage:'offer',source:'内推',appliedDate:'2026-07-08',notes:null,resumeVersion:'v3',jdText:null,diagnosis:{score:85,level:'green',abilities:[{name:'HRBP 全盘',match:'high'},{name:'组织发展',match:'high'},{name:'招聘体系',match:'high'},{name:'文化建设',match:'partial'}],research:'快速增长期，年轻化文化。',summary:'高度匹配，文化契合度好',sources:['公众号: 小红书招聘','小红书: 5帖']},interviews:[{round:'一面',date:'2026-07-12',type:'视频',interviewer:'赵VP',role:'VP',abilityTags:['HRBP 全盘','组织发展'],questions:'1. OD 案例\n2. 搭建招聘体系',feeling:'VP 务实',result:'通过',reviewNotes:''},{round:'二面',date:'2026-07-16',type:'现场',interviewer:'陈CEO',role:'CEO',abilityTags:['文化建设'],questions:'1. 管理哲学\n2. 为什么选小红书',feeling:'聊得很好',result:'通过',reviewNotes:''}],offer:{monthlySalary:45000,annualBonus:3,stockOptions:'RSU 2000股/4年',totalPackage:630000,benefits:'六险一金+餐补+健身房',deadline:'2026-07-30',status:'谈薪中'},checklist:[],createdAt:'2026-07-08'},
  { id:'6',companyName:'拼多多',positionName:'高级前端',salaryMin:45000,salaryMax:65000,stage:'applied',source:'Boss直聘',appliedDate:'2026-07-20',notes:'HR 回复很快',resumeVersion:'v3',jdText:null,diagnosis:{score:72,level:'yellow',abilities:[{name:'React/Vue',match:'high'},{name:'电商经验',match:'partial'},{name:'性能优化',match:'high'}],research:'电商增长快，技术挑战大。加班文化明显。',summary:'匹配度尚可，加班需考虑',sources:['脉脉: 4帖']},interviews:[],offer:null,checklist:[],createdAt:'2026-07-20'},
  { id:'7',companyName:'快手',positionName:'资深前端',salaryMin:40000,salaryMax:55000,stage:'applied',source:'内推',appliedDate:'2026-07-17',notes:null,resumeVersion:'v2',jdText:null,diagnosis:{score:75,level:'green',abilities:[{name:'React 生态',match:'high'},{name:'直播/短视频',match:'partial'},{name:'大前端工程化',match:'high'}],research:'视频化转型，前端需求大。',summary:'匹配度好，可以推进',sources:['公众号: 快手技术']},interviews:[],offer:null,checklist:[],createdAt:'2026-07-17'},
  { id:'8',companyName:'网易',positionName:'HRBP 高级',salaryMin:35000,salaryMax:48000,stage:'prep',source:null,appliedDate:null,notes:null,resumeVersion:null,jdText:null,diagnosis:{score:80,level:'green',abilities:[{name:'HRBP 全盘',match:'high'},{name:'游戏行业理解',match:'partial'},{name:'组织发展',match:'high'}],research:'游戏业务增长，HR 体系完善。',summary:'高度匹配，游戏行业背景可补',sources:['官网']},interviews:[],offer:null,checklist:[],createdAt:'2026-07-19'},
  { id:'9',companyName:'滴滴',positionName:'招聘专家',salaryMin:30000,salaryMax:45000,stage:'prep',source:null,appliedDate:null,notes:null,resumeVersion:null,jdText:'负责滴滴出行招聘…',diagnosis:null,interviews:[],offer:null,checklist:[],createdAt:'2026-07-21'},
  { id:'10',companyName:'SHEIN',positionName:'HRD',salaryMin:50000,salaryMax:70000,stage:'offer',source:'猎头',appliedDate:'2026-07-05',notes:null,resumeVersion:'v3',jdText:null,diagnosis:{score:82,level:'green',abilities:[{name:'HR 全盘管理',match:'high'},{name:'跨境电商',match:'partial'},{name:'团队搭建',match:'high'}],research:'跨境电商增长快，HR 体系建设中。',summary:'管理岗匹配度高',sources:['公众号: SHEIN']},interviews:[{round:'一面',date:'2026-07-10',type:'视频',interviewer:'COO',role:'COO',abilityTags:['HR 全盘管理','团队搭建'],questions:'1. 快速扩张期如何搭建 HR 体系\n2. 跨文化团队管理',feeling:'COO 看重落地速度',result:'通过',reviewNotes:''},{round:'二面',date:'2026-07-15',type:'现场',interviewer:'CEO',role:'CEO',abilityTags:['跨境电商'],questions:'1. 对 SHEIN 模式的看法\n2. HR 如何驱动业务增长',feeling:'CEO 有战略眼光',result:'通过',reviewNotes:''}],offer:{monthlySalary:60000,annualBonus:4,stockOptions:'期权 5000股/4年',totalPackage:960000,benefits:'五险一金+补贴+弹性工作',deadline:'2026-07-28',status:'考虑中'},checklist:[],createdAt:'2026-07-05'},
];

function mapApp(item:any):JobApp {
  return {
    id:item.id,companyName:item.company?.name||item.companyName||'',
    positionName:item.positionName||'',salaryMin:item.salaryMin??null,salaryMax:item.salaryMax??null,
    stage:item.stage||'prep',source:item.source||null,appliedDate:item.appliedDate||null,
    notes:item.notes||null,resumeVersion:item.resumeVersion||null,jdText:item.jdText||null,
    diagnosis:item.diagnosis||item.diagnosisResult||null,
    interviews:(item.interviews||[]).map((iv:any)=>({
      round:iv.round||'',date:iv.interviewDate||iv.date||'',type:iv.interviewType||iv.type||'',
      interviewer:iv.interviewer||'',role:iv.role||'',abilityTags:iv.abilityTags||[],
      questions:iv.questions||iv.content||'',feeling:iv.feeling||'',result:iv.result||'',reviewNotes:iv.reviewNotes||'',
    })),
    offer:item.offer||item.offerDetail||null,
    checklist:item.checklist||item.onboardChecklist||[],createdAt:item.createdAt||'',
  };
}

export default function BattleJobSeekingPage() {
  const router = useRouter();
  const [data, setData] = useState<JobApp[]>(MOCK);
  const [hoverStage, setHoverStage] = useState<string|null>(null);
  const [activeStage, setActiveStage] = useState<string|null>(null);
  const [detail, setDetail] = useState<JobApp|null>(null);
  const [panel, setPanel] = useState<'detail'|'form'|null>(null);
  const [editApp, setEditApp] = useState<JobApp|null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagResult, setDiagResult] = useState<any>(null);
  const [resumes, setResumes] = useState<{version:string;label:string;content:string}[]>([
    {version:'v1',label:'通用版',content:'10年HR经验...'},
    {version:'v2',label:'前端方向',content:'React/TS/跨端...'},
    {version:'v3',label:'HR方向',content:'HRBP/组织发展/招聘体系...'},
  ]);
  const [selectedResume, setSelectedResume] = useState('v3');
  const [showNewResume, setShowNewResume] = useState(false);
  const [newResumeLabel, setNewResumeLabel] = useState('');
  const [newResumeContent, setNewResumeContent] = useState('');
  const [showIvForm, setShowIvForm] = useState(false);
  const [ivRound, setIvRound] = useState(''); const [ivDate, setIvDate] = useState('');
  const [ivType, setIvType] = useState('视频'); const [ivInterviewer, setIvInterviewer] = useState('');
  const [ivRole, setIvRole] = useState(''); const [ivTags, setIvTags] = useState<string[]>([]);
  const [ivQuestions, setIvQuestions] = useState(''); const [ivFeeling, setIvFeeling] = useState('');
  const [ivResult, setIvResult] = useState('待反馈'); const [ivReview, setIvReview] = useState('');

  const counts = useMemo(()=>{const c:Record<string,number>={};STAGES.forEach(s=>{c[s.key]=data.filter(a=>a.stage===s.key).length});return c;},[data]);
  const stageApps = (k:string)=>data.filter(a=>a.stage===k);
  const sc = (k:string)=>STAGES.find(s=>s.key===k)!;

  const api = {
    create:async(item:any)=>{const n={...item,id:'new-'+Date.now(),createdAt:new Date().toISOString(),interviews:[],offer:null,checklist:[]};setData(p=>[n as JobApp,...p]);return n;},
    update:async(id:string,changes:any)=>{setData(p=>p.map(a=>a.id===id?{...a,...changes}:a));return changes;},
    remove:async(id:string)=>{setData(p=>p.filter(a=>a.id!==id));return true;},
  };

  const openForm = (app?:JobApp, ps?:string)=>{
    setEditApp(app||null);
    if(app)form.setFieldsValue({companyName:app.companyName,positionName:app.positionName,salaryMin:app.salaryMin,salaryMax:app.salaryMax,stage:app.stage,source:app.source,appliedDate:app.appliedDate?dayjs(app.appliedDate):null,notes:app.notes});
    else{form.resetFields();form.setFieldsValue({stage:ps||activeStage||'prep'});}
    setPanel('form');
  };
  const save = async()=>{
    try{const v=await form.validateFields();setLoading(true);
      const p={companyName:v.companyName,positionName:v.positionName,salaryMin:v.salaryMin,salaryMax:v.salaryMax,stage:v.stage,source:v.source,appliedDate:v.appliedDate?v.appliedDate.toISOString():null,notes:v.notes};
      if(editApp)await api.update(editApp.id,p);else await api.create(p);
      message.success(editApp?'已更新':'已新增');setPanel(null);setEditApp(null);
    }catch{}finally{setLoading(false);}
  };
  const move = async(app:JobApp,to:string)=>{await api.update(app.id,{stage:to});message.success('已移至「'+sc(to).label+'」');setDetail(null);setPanel(null);};

  // ── 弹窗预览 ──
  const renderPopover = (s:typeof STAGES[number]) => {
    const items = stageApps(s.key);
    const c = counts[s.key];
    return (
      <div style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',zIndex:999,marginTop:8,width:300,animation:'popoverIn 0.15s ease'}} onClick={e=>e.stopPropagation()}>
        <div style={{background:'#fff',borderRadius:14,boxShadow:'0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1)',padding:'14px 16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:c>0?8:0}}>
            <Text strong style={{fontSize:12,color:'#666'}}>{s.icon} {s.label} ({c})</Text>
          </div>
          {c===0?<Text style={{fontSize:12,color:'#ddd',display:'block',textAlign:'center',padding:'8px 0'}}>暂无记录</Text>:
          items.slice(0,4).map(app=>{
            const days = app.appliedDate?now().diff(dayjs(app.appliedDate),'day'):null;
            return <div key={app.id} onClick={()=>{setDetail(app);setPanel('detail');setHoverStage(null);}}
              style={{cursor:'pointer',padding:'8px 10px',borderRadius:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}
              onMouseEnter={e2=>{e2.currentTarget.style.background='#f9f7f4'}} onMouseLeave={e2=>{e2.currentTarget.style.background='transparent'}}>
              <div style={{flex:1,minWidth:0}}>
                <Text style={{fontSize:12}}>{app.companyName}</Text>
                <Text style={{fontSize:12,color:'#bbb',marginLeft:6}}>{app.positionName}</Text>
              </div>
              {s.key==='prep'&&app.diagnosis&&<span style={{fontSize:14,flexShrink:0}}>{app.diagnosis.level==='green'?'🟢':app.diagnosis.level==='yellow'?'🟡':'🔴'}</span>}
              {s.key==='applied'&&days!==null&&<span style={{fontSize:12,color:days>5?'#fa8c16':'#999',flexShrink:0}}>{days}天</span>}
              {s.key==='interview'&&<span style={{fontSize:12,color:'#52c41a',flexShrink:0}}>{app.interviews.filter((iv:any)=>iv.result==='通过').length}/{app.interviews.length+1}轮</span>}
              {s.key==='offer'&&app.offer&&<span style={{fontSize:12,color:'#eb2f96',flexShrink:0}}>{((app.offer.totalPackage||0)/10000).toFixed(0)}万</span>}
              {s.key==='onboard'&&<span style={{fontSize:12,color:'#1890ff',flexShrink:0}}>待入职</span>}
            </div>;
          })}
        </div>
      </div>
    );
  };

  // ── 卡片 ──
  const renderCard = (app:JobApp)=>{
    const cfg = sc(app.stage);
    const days = app.appliedDate?now().diff(dayjs(app.appliedDate),'day'):null;
    const hoverShadow = (color:string)=>'0 0 0 1px '+color+'20, 0 2px 8px rgba(0,0,0,0.06)';
    const defShadow = '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)';
    const cardBase:React.CSSProperties = {cursor:'pointer',padding:'16px 18px',borderRadius:14,background:'#fff',boxShadow:defShadow,transition:'box-shadow 0.15s',display:'flex',flexDirection:'column',gap:10};

    // 投前诊断
    if(app.stage==='prep')return(
      <div key={app.id} onClick={()=>{setDetail(app);setPanel('detail');}} style={cardBase}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=hoverShadow(cfg.color)}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=defShadow}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{flex:1,minWidth:0}}>
            <Text strong style={{fontSize:14}}>{app.positionName}</Text>
            <Text style={{fontSize:13,color:'#888',marginLeft:4}}>· {app.companyName}</Text>
            {(app.salaryMin||app.salaryMax)&&<Text style={{fontSize:12,color:'#bbb',marginLeft:6}}>{app.salaryMin?app.salaryMin+'K':'?'}-{app.salaryMax?app.salaryMax+'K':'?'}</Text>}
          </div>
          {app.diagnosis?<span style={{fontSize:20,flexShrink:0}}>{app.diagnosis.level==='green'?'🟢':app.diagnosis.level==='yellow'?'🟡':'🔴'}</span>:<Tag style={{borderRadius:8,flexShrink:0}}>待诊断</Tag>}
        </div>
        {app.diagnosis?<>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
            <Text style={{fontSize:13,fontWeight:500,color:app.diagnosis.level==='green'?'#389e0d':app.diagnosis.level==='yellow'?'#e08830':'#e05858'}}>{app.diagnosis.score}分</Text>
            <Text style={{fontSize:12,color:'#888',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>💡 {app.diagnosis.summary}</Text>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{display:'flex',gap:3,flexWrap:'wrap',flex:1}}>{app.diagnosis.abilities?.slice(0,4).map((ab:any,i:number)=>
              <span key={i} style={{fontSize:12,padding:'1px 6px',borderRadius:6,background:ab.match==='high'?'#e6f7e6':ab.match==='partial'?'#fff7e6':'#ffe6e6',color:'#555'}}>{ab.name}</span>
            )}</div>
            <Button size="small" style={{borderRadius:8,flexShrink:0}} onClick={e=>{e.stopPropagation();openForm(app);}}>重诊</Button>
            <Button size="small" type="primary" style={{borderRadius:8,flexShrink:0}} onClick={e=>{e.stopPropagation();move(app,'applied');}}>投了</Button>
          </div>
        </>:<Button size="small" type="primary" ghost style={{borderRadius:8,alignSelf:'flex-start'}} onClick={e=>{e.stopPropagation();openForm(app);}}>诊断</Button>}
      </div>
    );

    // 已投递
    if(app.stage==='applied')return(
      <div key={app.id} onClick={()=>{setDetail(app);setPanel('detail');}} style={cardBase}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=hoverShadow(cfg.color)}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=defShadow}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{flex:1,minWidth:0}}>
            <Text strong style={{fontSize:14}}>{app.positionName}</Text>
            <Text style={{fontSize:13,color:'#888',marginLeft:4}}>· {app.companyName}</Text>
            {(app.salaryMin||app.salaryMax)&&<Text style={{fontSize:12,color:'#bbb',marginLeft:6}}>{app.salaryMin?app.salaryMin+'K':'?'}-{app.salaryMax?app.salaryMax+'K':'?'}</Text>}
          </div>
          {days!==null&&<span style={{fontSize:12,padding:'2px 8px',borderRadius:8,background:days>5?'#fff7e6':'#f5f5f5',color:days>5?'#fa8c16':'#999',flexShrink:0}}>{days}天</span>}
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{app.source&&<Tag color="blue" style={{borderRadius:8,margin:0,fontSize:12}}>{app.source}</Tag>}{app.resumeVersion&&<Tag color="purple" style={{borderRadius:8,margin:0,fontSize:12}}>{app.resumeVersion}</Tag>}{days!==null&&days>5&&<Text style={{fontSize:12,color:'#fa8c16'}}>⚠️ 超 5 天无反馈</Text>}</div>
        {app.diagnosis?.abilities&&<div style={{display:'flex',gap:3,flexWrap:'wrap'}}>{app.diagnosis.abilities.slice(0,4).map((ab:any,i:number)=><span key={i} style={{fontSize:12,padding:'1px 6px',borderRadius:6,background:ab.match==='high'?'#e6f7e6':ab.match==='partial'?'#fff7e6':'#ffe6e6',color:'#555'}}>{ab.name}</span>)}</div>}
        <div style={{display:'flex',justifyContent:'flex-end'}}><Button size="small" type="primary" style={{borderRadius:8}} onClick={e=>{e.stopPropagation();move(app,'interview');}}>收到面试</Button></div>
      </div>
    );

    // 面试追踪
    if(app.stage==='interview'){
      const done=app.interviews.filter((iv:any)=>iv.result==='通过').length;
      return(
        <div key={app.id} onClick={()=>{setDetail(app);setPanel('detail');}} style={cardBase}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow=hoverShadow(cfg.color)}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=defShadow}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{flex:1,minWidth:0}}>
              <Text strong style={{fontSize:14}}>{app.positionName}</Text>
              <Text style={{fontSize:13,color:'#888',marginLeft:4}}>· {app.companyName}</Text>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <span style={{fontSize:12,color:'#52c41a',fontWeight:500}}>{done}/{app.interviews.length+1}轮</span>
              <Button size="small" type="primary" style={{borderRadius:8}} onClick={e=>{e.stopPropagation();move(app,'offer');}}>Offer</Button>
            </div>
          </div>
          <div style={{display:'flex',gap:3}}>
            {app.interviews.map((iv:any,i:number)=><span key={i} style={{width:18,height:18,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,background:iv.result==='通过'?'#e6f7e6':iv.result==='不通过'?'#ffe6e6':'#f5f5f5',color:iv.result==='通过'?'#389e0d':iv.result==='不通过'?'#cf1322':'#999'}}>{iv.result==='通过'?'✓':iv.result==='不通过'?'✗':'·'}</span>)}
            <span style={{width:18,height:18,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,background:'#fafafa',color:'#ddd',border:'1px dashed #e8e8e8'}}>·</span>
          </div>
          {app.diagnosis?.abilities&&<div style={{display:'flex',gap:3,flexWrap:'wrap'}}>{app.diagnosis.abilities.map((ab:any,i:number)=>{const t=app.interviews.some((iv:any)=>iv.abilityTags?.includes(ab.name));return<span key={i} style={{fontSize:12,padding:'1px 6px',borderRadius:6,background:t?'#e6f7e6':'#f5f5f5',color:t?'#389e0d':'#ccc'}}>{t?'✓':'○'} {ab.name}</span>;})}</div>}
          {app.interviews.length>0&&<Text style={{fontSize:12,color:'#999'}}>最近：{app.interviews[app.interviews.length-1].date} · {app.interviews[app.interviews.length-1].round} · {app.interviews[app.interviews.length-1].result}</Text>}
        </div>
      );
    }

    // Offer
    if(app.stage==='offer')return(
      <div key={app.id} onClick={()=>{setDetail(app);setPanel('detail');}} style={cardBase}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=hoverShadow(cfg.color)}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=defShadow}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{flex:1,minWidth:0}}>
            <Text strong style={{fontSize:14}}>{app.positionName}</Text>
            <Text style={{fontSize:13,color:'#888',marginLeft:4}}>· {app.companyName}</Text>
          </div>
          {app.offer&&<Tag color="orange" style={{borderRadius:8,margin:0,flexShrink:0}}>{app.offer.status}</Tag>}
        </div>
        {app.offer&&<div style={{display:'flex',gap:8,alignItems:'baseline'}}><Text style={{fontSize:22,fontWeight:500,color:'#eb2f96'}}>{((app.offer.totalPackage||0)/10000).toFixed(0)}万</Text><Text style={{fontSize:12,color:'#aaa'}}>/年</Text></div>}
        {app.offer&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}><Tag style={{borderRadius:8,margin:0,fontSize:12}}>月{app.offer.monthlySalary}K</Tag><Tag style={{borderRadius:8,margin:0,fontSize:12}}>年终{app.offer.annualBonus}月</Tag>{app.offer.stockOptions&&<Tag color="purple" style={{borderRadius:8,margin:0,fontSize:12}}>期权</Tag>}{app.offer.deadline&&<Tag color="red" style={{borderRadius:8,margin:0,fontSize:12}}>{app.offer.deadline}截止</Tag>}</div>}
        {app.diagnosis?.abilities&&<div style={{display:'flex',gap:3,flexWrap:'wrap'}}>{app.diagnosis.abilities.slice(0,4).map((ab:any,i:number)=><span key={i} style={{fontSize:12,padding:'1px 6px',borderRadius:6,background:'#f5f5f5',color:'#888'}}>{ab.name}</span>)}</div>}
        <div style={{display:'flex',justifyContent:'flex-end'}}><Button size="small" type="primary" style={{borderRadius:8}} onClick={e=>{e.stopPropagation();move(app,'onboard');}}>接受 Offer</Button></div>
      </div>
    );

    // 入职
    if(app.stage==='onboard'){
      const done=app.checklist?.filter((i:any)=>i.done).length||0;const total=app.checklist?.length||1;
      return(
        <div key={app.id} onClick={()=>{setDetail(app);setPanel('detail');}} style={cardBase}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow=hoverShadow(cfg.color)}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=defShadow}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{flex:1,minWidth:0}}>
              <Text strong style={{fontSize:14}}>{app.positionName}</Text>
              <Text style={{fontSize:13,color:'#888',marginLeft:4}}>· {app.companyName}</Text>
            </div>
          </div>
          {app.diagnosis?.abilities&&<div style={{display:'flex',gap:3,flexWrap:'wrap'}}>{app.diagnosis.abilities.slice(0,4).map((ab:any,i:number)=><span key={i} style={{fontSize:12,padding:'1px 6px',borderRadius:6,background:'#f5f5f5',color:'#888'}}>{ab.name}</span>)}</div>}
          <div><div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><Text style={{fontSize:12,color:'#bbb'}}>准备进度</Text><Text style={{fontSize:12,color:'#1890ff'}}>{done}/{total}</Text></div><Progress percent={Math.round((done/total)*100)} size="small" showInfo={false} strokeColor="#1890ff"/></div>
        </div>
      );
    }
    return null;
  };

  // ── 模拟诊断 ──
  const runDiag = async()=>{
    const jd = form.getFieldValue('jdText')||'';
    const company = form.getFieldValue('companyName')||'';
    if(!jd){message.warning('请先粘贴 JD 内容');return;}
    setDiagnosing(true);setDiagResult(null);
    try {
      const resume = resumes.find(rv=>rv.version===selectedResume);
      const res = await fetch('/api/ai/job-diagnosis/report',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({company:company||'待定',jd,resume:resume?.content||'',focus:'',depth:'standard'})
      });
      if(!res.ok){throw new Error('API error '+res.status)}
      const json = await res.json();
      const fullText = json.report || '';
      // 从报告中提取分数和灯色
      const scoreMatch = fullText.match(/综合.*?(\d{1,3})/);
      const score = scoreMatch?parseInt(scoreMatch[1]):70;
      const lv = score>=75?'green':score>=60?'yellow':'red';
      const abMatch = fullText.match(/JD 四分类[\s\S]*?(?=##)/);
      const researchMatch = fullText.match(/公司.*?基本面[\s\S]*?(?=##)/);
      const summaryMatch = fullText.match(/一句话裁决[\s\S]*?\n([^\n]+)/);
      const result = {
        score,level:lv,
        abilities:[
          {name:'综合匹配',match:score>=75?'high':score>=60?'partial':'gap'},
          {name:'技能重合',match:score>=70?'high':score>=55?'partial':'gap'},
          {name:'年限匹配',match:score>=65?'high':score>=50?'partial':'gap'},
          {name:'文化契合',match:score>=60?'high':score>=45?'partial':'gap'},
          {name:'成长潜力',match:score>=70?'high':score>=55?'partial':'gap'},
        ],
        research:researchMatch?researchMatch[0].slice(0,200):'公司调研详见完整报告',
        summary:summaryMatch?summaryMatch[1].trim():'详见完整诊断报告',
        sources:['AI 诊断 · 联网调研'],
        companyName:company||'待定',
        positionName:form.getFieldValue('positionName')||'待定',
        salaryMin:parseInt(form.getFieldValue('salaryMin'))||null,
        salaryMax:parseInt(form.getFieldValue('salaryMax'))||null,
        resumeVersion:selectedResume,
        htmlReport:'<html><head><meta charset="utf-8"><style>body{font-family:-apple-system,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#333;line-height:1.8;white-space:pre-wrap}h1{font-size:24px;color:#8b7cf0}h2{font-size:16px;margin-top:24px;border-bottom:1px solid #eee;padding-bottom:8px}h3{font-size:14px}strong{color:#444}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #e8e8e8;padding:6px 12px;font-size:13px}th{background:#fafafa}</style></head><body><pre style="white-space:pre-wrap;font-family:-apple-system,sans-serif;font-size:14px">'+fullText.replace(/</g,'&lt;')+'</pre></body></html>'
      };
      setDiagResult(result);
    } catch(e:any) {
      console.error('runDiag failed:', e);
      message.error('诊断失败: '+e.message, 5);
    }
    setDiagnosing(false);
  };

  // ── 详情面板 ──
  const renderPanel = ()=>{
    if(panel==='form')return(
      <div style={{padding:'28px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><Text strong style={{fontSize:17}}>{editApp?'编辑':'岗位诊断'}</Text><span onClick={()=>{setPanel(null);setEditApp(null);setDiagResult(null);}} style={{fontSize:20,color:'#bbb',cursor:'pointer'}}>×</span></div>
        {/* 简历选择 */}
        {!editApp&&<div style={{marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
          <Text style={{fontSize:13,color:'#666',flexShrink:0}}>匹配简历：</Text>
          <Select value={selectedResume} onChange={setSelectedResume} size="small" style={{width:160,borderRadius:8}}
            options={resumes.map(rv=>({label:`${rv.label} (${rv.version})`,value:rv.version}))}/>
          {!showNewResume?<Button size="small" type="dashed" onClick={()=>setShowNewResume(true)} style={{borderRadius:8}}>+ 新建</Button>:
          <div style={{display:'flex',gap:6}}>
            <Input size="small" value={newResumeLabel} onChange={e=>setNewResumeLabel(e.target.value)} placeholder="版本名" style={{width:100,borderRadius:8}}/>
            <Button size="small" onClick={()=>{if(newResumeLabel){setResumes([...resumes,{version:'v'+(resumes.length+1),label:newResumeLabel,content:''}]);setSelectedResume('v'+(resumes.length+1));setShowNewResume(false);setNewResumeLabel('');}}} style={{borderRadius:8}}>确定</Button>
          </div>}
        </div>}
        <Form form={form} layout="vertical" initialValues={{stage:'prep'}}>
          {/* JD 粘贴 + 诊断 */}
          <Form.Item name="jdText" label="JD 内容"><TextArea rows={5} placeholder="粘贴 JD 正文，AI 将自动提取公司、职位、薪资、能力要求..."/></Form.Item>
          <div style={{marginBottom:16}}>
            <Button type="primary" ghost onClick={runDiag} loading={diagnosing} block style={{borderRadius:8,height:42}}>
              {diagResult?'🔄 重新诊断（简历: '+resumes.find(rv=>rv.version===selectedResume)?.label+'）':diagnosing?'🔍 AI 分析中...':'🔍 开始岗位匹配度诊断（简历: '+resumes.find(rv=>rv.version===selectedResume)?.label+'）'}
            </Button>
          </div>
          {/* 诊断结果 */}
          {diagResult&&(
            <div style={{marginBottom:16,padding:'14px 16px',borderRadius:12,background:'#fafafa',border:'1px solid #f0ece8'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>{diagResult.level==='green'?'🟢':diagResult.level==='yellow'?'🟡':'🔴'}</span>
                <Text strong style={{fontSize:14}}>{diagResult.level==='green'?'推荐投递':diagResult.level==='yellow'?'可观望':'不建议'} · {diagResult.score}分 · 简历 {diagResult.resumeVersion}</Text>
              </div>
              <div style={{display:'flex',gap:3,flexWrap:'wrap',marginBottom:8}}>
                {diagResult.abilities?.map((ab:any,i:number)=>(
                  <span key={i} style={{fontSize:12,padding:'2px 8px',borderRadius:8,background:ab.match==='high'?'#e6f7e6':ab.match==='partial'?'#fff7e6':'#ffe6e6',color:'#555'}}>{ab.match==='high'?'✅':ab.match==='partial'?'⚠️':'❌'} {ab.name}</span>
                ))}
              </div>
              <Text style={{fontSize:12,color:'#888',display:'block'}}>💡 {diagResult.summary}</Text>
            </div>
          )}
          <Row gutter={12}>
            <Col span={8}><Form.Item name="companyName" label="公司" rules={[{required:true}]}><Input placeholder="公司名称"/></Form.Item></Col>
            <Col span={8}><Form.Item name="positionName" label="职位" rules={[{required:true}]}><Input placeholder="职位名称"/></Form.Item></Col>
            <Col span={4}><Form.Item name="salaryMin" label="最低(K)"><Input placeholder="40"/></Form.Item></Col>
            <Col span={4}><Form.Item name="salaryMax" label="最高(K)"><Input placeholder="60"/></Form.Item></Col>
          </Row>
          <Form.Item name="stage" label="阶段"><Select options={STAGES.map(s=>({label:s.icon+' '+s.label,value:s.key}))}/></Form.Item>
          <Form.Item name="source" label="渠道"><Select placeholder="选填" allowClear options={SOURCES.map(v=>({label:v,value:v}))}/></Form.Item>
          <Form.Item name="appliedDate" label="投递日期"><DatePicker style={{width:'100%'}}/></Form.Item>
          <Form.Item name="notes" label="备注"><TextArea rows={2}/></Form.Item>
        </Form>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}><Button onClick={()=>{setPanel(null);setEditApp(null);setDiagResult(null);}}>取消</Button><Button type="primary" onClick={async()=>{try{const v=await form.validateFields();const payload={companyName:v.companyName,positionName:v.positionName,salaryMin:v.salaryMin,salaryMax:v.salaryMax,stage:v.stage,source:v.source,appliedDate:v.appliedDate?v.appliedDate.toISOString():null,notes:v.notes,diagnosis:diagResult};setLoading(true);if(editApp)await api.update(editApp.id,payload);else await api.create(payload);message.success(editApp?'已更新':'已新增');setPanel(null);setEditApp(null);setDiagResult(null);}catch{}finally{setLoading(false);}}} loading={loading}>{editApp?'保存':'保存并开始追踪'}</Button></div>
      </div>
    );
    if(!detail)return null;
    const app=detail;const cfg=sc(app.stage);
    return(
      <div style={{padding:'28px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div><Text strong style={{fontSize:18}}>{app.companyName}</Text><Text style={{fontSize:14,color:'#888',display:'block',marginTop:2}}>{app.positionName}</Text></div>
          <span onClick={()=>{setPanel(null);setDetail(null);}} style={{fontSize:20,color:'#bbb',cursor:'pointer'}}>×</span>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
          <Tag color="purple">{cfg.icon} {cfg.label}</Tag>
          {(app.salaryMin||app.salaryMax)&&<Tag>{app.salaryMin?app.salaryMin+'K':'?'}-{app.salaryMax?app.salaryMax+'K':'?'}</Tag>}
          {app.source&&<Tag color="blue">{app.source}</Tag>}{app.appliedDate&&<Tag>{app.appliedDate}</Tag>}
        </div>
        {/* 诊断结果(投前/面试阶段展示) */}
        {app.diagnosis&&(
          <div style={{marginBottom:20,padding:'18px 20px',borderRadius:14,background:'#f9f7fc',border:'1px solid #e8e4f0',borderLeft:'4px solid #8b7cf0'}}>
            <Text style={{fontSize:12,fontWeight:500,color:'#8b7cf0',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:10,cursor:'pointer',textDecoration:'underline'}}
              onClick={(e)=>{e.stopPropagation();
                if(app.diagnosis.htmlReport){
                  const w = window.open('','_blank'); if(w){w.document.write(app.diagnosis.htmlReport);w.document.close();}
                } else {
                  const html = '<html><head><meta charset="utf-8"><style>body{font-family:-apple-system,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#333;line-height:1.8}h1{font-size:24px;color:#8b7cf0}h2{font-size:16px;margin-top:24px;border-bottom:1px solid #eee;padding-bottom:8px}.score{font-size:48px;font-weight:300}.tag{display:inline-block;padding:2px 10px;border-radius:8px;font-size:12px;margin:2px}.high{background:#e6f7e6;color:#389e0d}.partial{background:#fff7e6;color:#d48806}.gap{background:#ffe6e6;color:#cf1322}.section{background:#fafafa;padding:14px 18px;border-radius:10px;margin:12px 0}</style></head><body><h1>'+app.positionName+' · '+app.companyName+'</h1><div class="score">'+app.diagnosis.score+'<span style="font-size:16px;color:#888"> 分</span></div><p style="font-size:18px">'+(app.diagnosis.level==="green"?"🟢 推荐投递":app.diagnosis.level==="yellow"?"🟡 可观望":"🔴 不建议")+'</p><h2>能力匹配</h2>'+app.diagnosis.abilities.map((a:any)=>'<div class="tag '+a.match+'">'+(a.match==="high"?"✅":a.match==="partial"?"⚠️":"❌")+' '+a.name+'</div>').join(' ')+'<h2>结论</h2><div class="section">💡 '+app.diagnosis.summary+'</div></body></html>';
                  const w = window.open('','_blank'); if(w){w.document.write(html);w.document.close();}
                }
              }}>查看完整报告</Text>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <span style={{fontSize:22}}>{app.diagnosis.level==='green'?'🟢':app.diagnosis.level==='yellow'?'🟡':'🔴'}</span>
              <div>
                <Text strong style={{fontSize:15,display:'block'}}>{app.diagnosis.level==='green'?'推荐投递':app.diagnosis.level==='yellow'?'可观望':'不建议'} · 匹配度 {app.diagnosis.score}分</Text>
                {app.diagnosis.resumeVersion&&<Text style={{fontSize:12,color:'#bbb'}}>匹配简历：{app.diagnosis.resumeVersion}</Text>}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:12}}>
              {app.diagnosis.abilities?.map((ab:any,i:number)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:13}}>
                  <span>{ab.match==='high'?'✅':ab.match==='partial'?'⚠️':'❌'}</span>
                  <Text style={{color:'#555'}}>{ab.name}</Text>
                  <Tag color={ab.match==='high'?'green':ab.match==='partial'?'orange':'red'} style={{fontSize:12,margin:0}}>{ab.match==='high'?'强匹配':ab.match==='partial'?'部分匹配':'缺口'}</Tag>
                </div>
              ))}
            </div>
            {app.diagnosis.research&&<div style={{padding:'10px 12px',borderRadius:8,background:'#fff',marginBottom:8}}><Text style={{fontSize:12,color:'#666'}}>🏢 公司调研：{app.diagnosis.research}</Text></div>}
            {app.diagnosis.sources&&<Text style={{fontSize:12,color:'#bbb',display:'block',marginBottom:6}}>📎 信源：{app.diagnosis.sources.join(' · ')}</Text>}
            <div style={{padding:'10px 12px',borderRadius:8,background:'#fff'}}><Text style={{fontSize:13,color:'#444',fontStyle:'italic'}}>💡 {app.diagnosis.summary}</Text></div>
          </div>
        )}
        {/* 面试记录 */}
        {app.interviews.length>0&&(
          <div style={{marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <Text strong style={{fontSize:13,color:'#666'}}>面试追踪 · {app.interviews.filter((iv:any)=>iv.result==='通过').length}/{app.interviews.length}轮通过</Text>
              <div style={{display:'flex',gap:6}}>
                <Button size="small" type="text" onClick={()=>openAIPanel()} style={{fontSize:12,color:'#8b7cf0'}}>问大师</Button>
                <Button size="small" type="primary" onClick={()=>setShowIvForm(!showIvForm)} style={{borderRadius:8}}>{showIvForm?'取消':'+ 新增轮次'}</Button>
              </div>
            </div>
            {app.diagnosis?.abilities&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
              <Text style={{fontSize:12,color:'#bbb',width:'100%'}}>能力覆盖</Text>
              {app.diagnosis.abilities.map((ab:any,i:number)=>{const t=app.interviews.some((iv:any)=>iv.abilityTags?.includes(ab.name));return<span key={i} style={{fontSize:12,padding:'2px 8px',borderRadius:10,background:t?'#e6f7e6':'#f5f5f5',color:t?'#389e0d':'#ccc'}}>{t?'✓':'○'} {ab.name}</span>;})}
            </div>}
            {showIvForm&&<div style={{marginBottom:12,padding:'14px 16px',borderRadius:12,background:'#fafafa',border:'1px solid #f0ece8'}}>
              <Text style={{fontSize:13,fontWeight:500,color:'#666',display:'block',marginBottom:10}}>新增面试轮次</Text>
              <Row gutter={[10,8]}>
                <Col span={8}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>轮次</Text><Select value={ivRound} onChange={setIvRound} size="small" style={{width:'100%',borderRadius:8}} options={[{label:'一面',value:'一面'},{label:'二面',value:'二面'},{label:'三面',value:'三面'},{label:'终面',value:'终面'},{label:'HR面',value:'HR面'}]}/></Col>
                <Col span={8}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>日期</Text><Input size="small" value={ivDate} onChange={e=>setIvDate(e.target.value)} placeholder="2026-07-21" style={{borderRadius:8}}/></Col>
                <Col span={8}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>形式</Text><Select value={ivType} onChange={setIvType} size="small" style={{width:'100%',borderRadius:8}} options={['视频','现场','电话'].map(v=>({label:v,value:v}))}/></Col>
                <Col span={8}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>面试官</Text><Input size="small" value={ivInterviewer} onChange={e=>setIvInterviewer(e.target.value)} placeholder="姓名" style={{borderRadius:8}}/></Col>
                <Col span={8}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>角色</Text><Select value={ivRole} onChange={setIvRole} size="small" style={{width:'100%',borderRadius:8}} options={INTERVIEW_ROLES.map(v=>({label:v,value:v}))}/></Col>
                <Col span={8}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>结果</Text><Select value={ivResult} onChange={setIvResult} size="small" style={{width:'100%',borderRadius:8}} options={[{label:'通过',value:'通过'},{label:'不通过',value:'不通过'},{label:'待反馈',value:'待反馈'}]}/></Col>
              </Row>
              {app.diagnosis?.abilities&&<div style={{marginTop:8}}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>考察的能力标签</Text><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{app.diagnosis.abilities.map((ab:any,i:number)=><span key={i} onClick={()=>setIvTags(ivTags.includes(ab.name)?ivTags.filter(t=>t!==ab.name):[...ivTags,ab.name])} style={{fontSize:12,padding:'2px 8px',borderRadius:8,cursor:'pointer',background:ivTags.includes(ab.name)?'#e6f7e6':'#f5f5f5',color:ivTags.includes(ab.name)?'#389e0d':'#999',border:ivTags.includes(ab.name)?'1px solid #b7eb8f':'1px solid #e8e8e8'}}>{ivTags.includes(ab.name)?'✓':''} {ab.name}</span>)}</div></div>}
              <div style={{marginTop:8}}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>关键问题</Text><TextArea value={ivQuestions} onChange={e=>setIvQuestions(e.target.value)} rows={3} placeholder="面试官问了哪些关键问题？"/></div>
              <div style={{marginTop:8}}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>我的感受</Text><Input value={ivFeeling} onChange={e=>setIvFeeling(e.target.value)} placeholder="聊得怎么样？面试官风格？团队印象？" style={{borderRadius:8}}/></div>
              <div style={{marginTop:8}}><Text style={{fontSize:12,color:'#888',display:'block',marginBottom:4}}>复盘笔记</Text><TextArea value={ivReview} onChange={e=>setIvReview(e.target.value)} rows={2} placeholder="哪里答得好？哪里需要改进？"/></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:10}}>
                <Button size="small" onClick={()=>setShowIvForm(false)}>取消</Button>
                <Button size="small" type="primary" onClick={()=>{const newIv={round:ivRound||'未指定',date:ivDate||now().format('YYYY-MM-DD'),type:ivType,interviewer:ivInterviewer,role:ivRole,abilityTags:ivTags,questions:ivQuestions,feeling:ivFeeling,result:ivResult,reviewNotes:ivReview};api.update(app.id,{interviews:[...app.interviews,newIv]});setShowIvForm(false);setIvRound('');setIvDate('');setIvInterviewer('');setIvRole('');setIvTags([]);setIvQuestions('');setIvFeeling('');setIvReview('');setIvResult('待反馈');message.success('面试轮次已添加');}} style={{borderRadius:8}}>添加轮次</Button>
              </div>
            </div>}
            {app.interviews.map((iv:any,i:number)=>(
              <div key={i} style={{padding:'12px 14px',marginBottom:8,borderRadius:10,background:'#fafafa'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><div style={{display:'flex',gap:6}}><Tag color="blue" style={{margin:0}}>{iv.round}</Tag><Text style={{fontSize:12,color:'#888'}}>{iv.date} · {iv.type}</Text></div><Tag color={iv.result==='通过'?'green':iv.result==='不通过'?'red':'default'} style={{margin:0}}>{iv.result}</Tag></div>
                <Text style={{fontSize:12,color:'#888',display:'block'}}>面试官：{iv.interviewer} · {iv.role}</Text>
                {iv.abilityTags?.length>0&&<div style={{display:'flex',gap:3,flexWrap:'wrap',marginTop:4}}>{iv.abilityTags.map((t:string,j:number)=><Tag key={j} style={{fontSize:12,margin:0}}>{t}</Tag>)}</div>}
                {iv.questions&&<Text style={{fontSize:12,color:'#666',display:'block',marginTop:4}}>关键问题：{iv.questions}</Text>}
                {iv.feeling&&<Text style={{fontSize:12,color:'#888',display:'block',marginTop:4}}>感受：{iv.feeling}</Text>}
                {iv.reviewNotes&&<div style={{marginTop:6,padding:'6px 10px',borderRadius:6,background:'#fffbe6'}}><Text style={{fontSize:12,color:'#b8860b'}}>复盘：{iv.reviewNotes}</Text></div>}
              </div>
            ))}
          </div>
        )}
        {/* Offer 详情 */}
        {app.offer&&(
          <div style={{marginBottom:20,padding:'14px 16px',borderRadius:12,background:'#f6ffed'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <Text strong style={{fontSize:13,color:'#389e0d'}}>Offer 详情</Text>
              <Button size="small" type="text" onClick={()=>openAIPanel()} style={{fontSize:12,color:'#8b7cf0'}}>问大师谈薪 →</Button>
            </div>
            <div style={{fontSize:12,lineHeight:2}}>
              <div>月薪：{app.offer.monthlySalary}K · 年终：{app.offer.annualBonus}个月</div>
              {app.offer.stockOptions&&<div>期权：{app.offer.stockOptions}</div>}
              <div>总包：约 {((app.offer.totalPackage||0)/10000).toFixed(1)} 万/年</div>
              {app.offer.benefits&&<div>福利：{app.offer.benefits}</div>}
              {app.offer.deadline&&<div>截止：{app.offer.deadline}</div>}
            </div><Tag color="orange" style={{marginTop:6}}>{app.offer.status}</Tag>
          </div>
        )}
        {/* 操作 */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',borderTop:'1px solid #f0ece8',paddingTop:14}}>
          <Button size="small" onClick={()=>{setPanel(null);openForm(app);}}>编辑</Button>
          {app.stage==='prep'&&app.diagnosis&&<Button size="small" type="primary" onClick={()=>move(app,'applied')}>投了！→ 已投递</Button>}
          {app.stage==='applied'&&<Button size="small" type="primary" onClick={()=>move(app,'interview')}>收到面试 → 面试追踪</Button>}
          {app.stage==='interview'&&<Button size="small" type="primary" onClick={()=>move(app,'offer')}>收到 Offer → Offer对比</Button>}
          {app.stage==='offer'&&<Button size="small" type="primary" onClick={()=>move(app,'onboard')}>接受 → 入职准备</Button>}
          <Button size="small" danger onClick={()=>{api.remove(app.id);message.success('已删除');setPanel(null);setDetail(null);}}>删除</Button>
        </div>
      </div>
    );
  };

  return (
    <div style={{display:'flex',height:'100vh',background:'#faf8f6',position:'relative'}}>
      <div style={{flex:1,padding:'40px 48px 24px',overflow:'visible'}}>
        <div style={{marginBottom:28}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
            <h1 style={{margin:0,fontSize:28,fontWeight:500,color:'#1a1a1a',letterSpacing:'-0.02em'}}>求职战役</h1>
            <Text style={{fontSize:14,color:'#bbb'}}>{now().format('M月D日 dddd')}</Text>
          </div>
        </div>

        {/* 阶段导航 */}
        <div style={{display:'flex',gap:10,position:'relative',overflow:'visible',zIndex:10}}>
          {STAGES.map(s=>{
            const count=counts[s.key];const isActive=activeStage===s.key;
            return (
              <div key={s.key} onClick={()=>setActiveStage(activeStage===s.key?null:s.key)} style={{position:'relative',flex:1}}>
                <div onMouseEnter={()=>setHoverStage(s.key)} onMouseLeave={()=>setHoverStage(null)}
                  style={{cursor:'pointer',textAlign:'center',padding:'16px 10px 12px',borderRadius:14,position:'relative',
                    background:isActive?`${s.color}10`:hoverStage===s.key?'#f9f7f4':'transparent',
                    boxShadow:isActive?`0 0 0 1px ${s.color}30`:hoverStage===s.key?'0 0 0 1px rgba(0,0,0,0.04)':'none',transition:'all 0.15s'}}>
                  <div style={{fontSize:22,marginBottom:2}}>{s.icon}</div>
                  <div style={{fontSize:13,fontWeight:500,color:isActive?s.color:'#555'}}>{s.label}</div>
                  <div style={{fontSize:22,fontWeight:400,color:isActive?s.color:'#bbb',marginTop:2}}>{count}</div>
                  {(isActive || hoverStage === s.key) && (
                    <div style={{position:'absolute',bottom:-4,left:'50%',transform:'translateX(-50%)',width:24,height:3,borderRadius:2,background:s.color,transition:'all 0.15s'}} />
                  )}
                </div>
                {hoverStage===s.key&&renderPopover(s)}
              </div>
            );
          })}
        </div>

        {/* 阶段内容 */}
        {activeStage&&(
          <div style={{marginTop:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:18}}>{sc(activeStage).icon}</span>
                <Text strong style={{fontSize:16,color:'#333'}}>{sc(activeStage).label}</Text>
                <Text style={{fontSize:12,color:'#bbb'}}>({counts[activeStage]})</Text>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <Text style={{fontSize:12,color:'#ccc'}}>{sc(activeStage).hint}</Text>
                <Button size="small" icon={<PlusOutlined/>} onClick={()=>openForm(undefined,activeStage)} style={{borderRadius:8}}>新增</Button>
              </div>
            </div>
            {stageApps(activeStage).length===0?(
              <div style={{textAlign:'center',padding:'48px 0',background:'#fff',borderRadius:14,boxShadow:'0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)'}}>
                <Text style={{fontSize:14,color:'#ddd',display:'block',marginBottom:8}}>暂无记录</Text>
              </div>
            ):(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:12}}>
                {stageApps(activeStage).map(app=>renderCard(app))}
              </div>
            )}
          </div>
        )}
        {/* 默认视图 */}
        {!activeStage&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:24}}>
            <div onClick={()=>openAIPanel()} style={{cursor:'pointer',padding:'22px 20px',borderRadius:14,background:'#fff',boxShadow:'0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',display:'flex',alignItems:'center',gap:12,transition:'box-shadow 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)';}}>
              <span style={{fontSize:26}}>🏛️</span><div><div style={{fontSize:14,fontWeight:500}}>大师智囊团</div><div style={{fontSize:12,color:'#aaa'}}>六位 HR 大师会诊 · 面试策略 · 谈薪建议</div></div><RightOutlined style={{marginLeft:'auto',color:'#ddd',fontSize:12}}/>
            </div>
            <div onClick={()=>router.push('/knowledge')} style={{cursor:'pointer',padding:'22px 20px',borderRadius:14,background:'#fff',boxShadow:'0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',display:'flex',alignItems:'center',gap:12,transition:'box-shadow 0.15s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 0 0 1px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)';}}>
              <span style={{fontSize:26}}>📚</span><div><div style={{fontSize:14,fontWeight:500}}>知识库</div><div style={{fontSize:12,color:'#aaa'}}>面试方法 · 行业认知 · HR 沉淀</div></div><RightOutlined style={{marginLeft:'auto',color:'#ddd',fontSize:12}}/>
            </div>
          </div>
        )}
      </div>

      {/* 右侧面板 — 覆盖层模式 */}
      {panel&&(<>
        <div onClick={()=>{setPanel(null);setDetail(null);setEditApp(null);}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.12)',zIndex:50}} />
        <div style={{position:'fixed',top:0,right:0,bottom:0,width:440,background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.08)',overflow:'auto',zIndex:51,animation:'panelSlideIn 0.2s ease'}}>
          {renderPanel()}
        </div>
        <style>{`@keyframes panelSlideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      </>)}
    </div>
  );
}
