#!/bin/bash
# Kim's CareerOS 部署脚本（国内环境优化版）
# 适用于阿里云 Ubuntu 服务器

set -e

echo "========================================="
echo "  Kim's CareerOS 部署脚本"
echo "  国内环境优化版"
echo "========================================="

# 1. 配置 npm 淘宝镜像
echo "[1/9] 配置 npm 国内镜像..."
npm config set registry https://registry.npmmirror.com

# 2. 配置 Prisma 引擎国内镜像
echo "[2/9] 配置 Prisma 引擎国内镜像..."
export PRISMA_ENGINES_MIRROR="https://cdn.npmmirror.com/binaries/prisma"

# 3. 安装 PostgreSQL（直接安装，不用 Docker）
echo "[3/9] 安装 PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 创建数据库和用户
echo "[4/9] 创建数据库和用户..."
sudo -u postgres psql -c "CREATE USER hr_user WITH PASSWORD 'Kim2026Secure';" 2>/dev/null || echo "用户已存在"
sudo -u postgres psql -c "CREATE DATABASE hr_platform OWNER hr_user;" 2>/dev/null || echo "数据库已存在"

# 4. 创建项目目录
echo "[5/9] 准备项目目录..."
mkdir -p /opt/hr-platform
cd /opt/hr-platform

# 5. 安装依赖（使用国内镜像）
echo "[6/9] 安装项目依赖（使用淘宝镜像，可能需要几分钟）..."
export PRISMA_ENGINES_MIRROR="https://cdn.npmmirror.com/binaries/prisma"
npm install

# 6. 初始化数据库
echo "[7/9] 初始化数据库表结构..."
npx prisma db push

# 7. 创建文件上传目录
echo "[8/9] 创建文件上传目录..."
mkdir -p /data/careeros-uploads/candidates
mkdir -p /data/careeros-uploads/resumes
mkdir -p /data/careeros-uploads/tesseract-cache
chmod -R 755 /data/careeros-uploads

# 8. 构建项目
echo "[9/9] 构建项目..."
npm run build

# 8. 用 PM2 启动
pm2 delete hr-platform 2>/dev/null || true
pm2 start npm --name "hr-platform" -- start
pm2 save
pm2 startup 2>/dev/null || true

# 9. 配置 Nginx
echo ""
echo "配置 Nginx 反向代理..."
cat > /etc/nginx/sites-available/hr-platform << 'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/hr-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo "========================================="
echo "  部署完成！"
echo "  访问地址: http://你的服务器IP"
echo "========================================="
