#!/bin/bash
# Kim's CareerOS 服务器部署脚本（v2 — 带错误检查和验证）
# 在阿里云 Workbench 终端中执行（先 sudo -i）
# 用法: chmod +x server-deploy.sh && ./server-deploy.sh

set -e  # 任何命令失败立即停止

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
check() { echo -e "${GREEN}[OK]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo "==== Kim's CareerOS 部署 v1.1 ===="

# —— 0. 检查 git 状态 & 清理冲突 ——
cd /opt/hr-platform
echo "[0] 清理本地修改..."
git checkout -- . 2>/dev/null || true
git clean -fd 2>/dev/null || true

# —— 1. 拉代码 ——
echo "[1] 拉取最新代码..."
EXPECTED_SHA=$(git rev-parse HEAD)
git pull origin main || fail "git pull 失败，检查网络或 GitHub 访问"
ACTUAL_SHA=$(git rev-parse HEAD)

echo "  前: $EXPECTED_SHA"
echo "  后: $ACTUAL_SHA"

if [ "$EXPECTED_SHA" = "$ACTUAL_SHA" ]; then
    echo "  代码已是最新，跳过后续步骤"
    exit 0
fi
check "代码已更新到 $(git log -1 --oneline)"

# —— 2. 环境 ——
echo "[2] 检查 .env..."
[ -f .env ] || fail ".env 文件不存在"
grep -q "DEEPSEEK_API_KEY=sk-" .env || fail ".env 缺少有效 DEEPSEEK_API_KEY（AI 功能会静默返回空响应）"
grep -q "JWT_SECRET=" .env || fail ".env 缺少 JWT_SECRET"
grep -q "TAVILY_API_KEY=tvly-" .env || echo "  [警告] 未配置 TAVILY_API_KEY，联网搜索走 DuckDuckGo，国内服务器基本不可用"
check ".env 存在且关键配置完整"

# —— 3. 安装依赖 ——
echo "[3] npm install..."
npm install || fail "npm install 失败"
check "依赖安装完成"

# —— 4. 数据库同步（必须在最新代码后） ——
echo "[4] Prisma db push..."
npx prisma db push || fail "prisma db push 失败"
check "数据库 schema 同步完成"

# —— 4.5. 种子数据（幂等：INSERT ON CONFLICT 自动跳过已有数据） ——
echo "[4.5] 种子数据..."
if [ -f scripts/seed-quotes.js ]; then
  node scripts/seed-quotes.js || echo "  [警告] 种子脚本执行失败，继续部署"
  check "种子数据检查完成"
else
  echo "  跳过（无种子脚本）"
fi

# —— 5. 构建 ——
echo "[5] npm run build..."
npm run build || fail "构建失败（可能是内存不足，先加 swap 再试）"
check "构建成功"

# —— 6. PM2 启动 ——
echo "[6] PM2 启动..."
pm2 delete hr-platform 2>/dev/null || true
pm2 start npm --name "hr-platform" -- start
pm2 save

# 确保下次重启自动恢复
pm2 startup systemd -u root 2>/dev/null || true

sleep 3
pm2 status | grep hr-platform | grep -q online || fail "PM2 进程未正常启动"
check "PM2 进程 online"

# —— 7. Nginx 检查 ——
echo "[7] Nginx 检查..."
nginx -t || fail "Nginx 配置语法错误"
systemctl restart nginx
check "Nginx 已重启"

# —— 8. 验证 ——
echo "[8] 验证..."
LOCAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.kimstar.cn -L)

echo "  localhost:3000 → HTTP $LOCAL_CODE"
echo "  www.kimstar.cn → HTTP $HTTPS_CODE"

if [ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "307" ]; then
    check "外部访问正常"
else
    fail "外部访问异常 (HTTP $HTTPS_CODE)"
fi

echo ""
echo -e "${GREEN}===== 部署完成! =====${NC}"
echo "  https://www.kimstar.cn"
pm2 status
