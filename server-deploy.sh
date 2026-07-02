#!/bin/bash
# Kim's CareerOS 服务器部署脚本
# 在阿里云 Workbench 终端中逐段执行（先 sudo -i）

set -e

echo "========== 1. 检查环境 =========="
node -v
npm -v
nginx -v 2>&1 || echo "nginx 未安装"
pm2 -v 2>/dev/null || echo "pm2 未安装，将安装..."
psql --version 2>/dev/null || echo "psql 未安装，将安装..."

echo "========== 2. 克隆代码 =========="
cd /opt
# 先删旧的（如果有）
rm -rf /opt/hr-platform
# 用镜像克隆（国内快）
git clone https://ghproxy.cc/https://github.com/Kim5613/kims-careeros-.git hr-platform 2>/dev/null || \
git clone https://github.com/Kim5613/kims-careeros-.git hr-platform

cd /opt/hr-platform

echo "========== 3. 配置环境变量 =========="
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://hr_user:Kim2026Secure@localhost:5432/hr_platform"
PRISMA_ENGINES_MIRROR="https://cdn.npmmirror.com/binaries/prisma"
UPLOAD_DIR="/data/careeros-uploads"
ACCESS_PASSWORD="111"
JWT_SECRET="careeros-jwt-secret-change-in-production"
ENVEOF

echo "========== 4. 创建上传目录 =========="
mkdir -p /data/careeros-uploads

echo "========== 5. 设置 PostgreSQL（如果还没启动）=========="
# 检查 PostgreSQL 是否在运行
if ! systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "启动 PostgreSQL..."
    systemctl start postgresql || service postgresql start
fi

# 检查数据库是否存在，不存在就创建
su - postgres -c "psql -c \"SELECT 1 FROM pg_roles WHERE rolname='hr_user'\"" 2>/dev/null | grep -q 1 || {
    echo "创建数据库用户..."
    su - postgres -c "psql -c \"CREATE USER hr_user WITH PASSWORD 'Kim2026Secure';\"" 2>/dev/null
    su - postgres -c "psql -c \"CREATE DATABASE hr_platform OWNER hr_user;\"" 2>/dev/null
    su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE hr_platform TO hr_user;\"" 2>/dev/null
}

echo "========== 6. 安装依赖 =========="
npm install

echo "========== 7. 数据库建表 =========="
npx prisma db push

echo "========== 8. 构建 =========="
npm run build

echo "========== 9. 停止旧进程 + 启动 =========="
pm2 delete hr-platform 2>/dev/null || true
pm2 start npm --name "hr-platform" -- start
pm2 save
pm2 startup 2>/dev/null || true

echo "========== 10. 配置 Nginx =========="
cat > /etc/nginx/sites-available/hr-platform << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/hr-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "========== 部署完成! =========="
echo "访问 http://139.196.159.68 查看"
pm2 status
