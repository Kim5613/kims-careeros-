# HR 个人职业中台 - 阿里云部署指南

## 项目概述

这是一套面向 HR 从业者的个人职业管理平台，包含「我的职业发展」和「HR 工作台」两大板块。

技术栈：Next.js 14 + Ant Design + Prisma + PostgreSQL

## 本地开发

### 环境要求
- Node.js 18+
- PostgreSQL 14+

### 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 配置数据库连接
# 编辑 .env 文件，修改 DATABASE_URL
# 格式: postgresql://用户名:密码@主机:端口/数据库名

# 3. 初始化数据库
npx prisma db push

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

### 本地开发（无 PostgreSQL）

项目页面内置了 Mock 数据，即使不连接数据库也可以预览界面和交互。
直接运行 `npm run dev` 即可，API 接口会自动降级。

如需本地快速启动 PostgreSQL，可以使用 Docker：

```bash
docker run -d --name hr-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=hr_platform \
  -p 5432:5432 \
  postgres:16
```

## 阿里云部署

### 第一步：购买轻量应用服务器

1. 登录阿里云控制台：https://www.aliyun.com/product/swas
2. 选择「轻量应用服务器」
3. 推荐配置：2核2G，系统选择 Ubuntu 22.04
4. 新用户活动价约 60-99 元/年

### 第二步：服务器初始化

SSH 登录服务器后执行：

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 Docker（用于运行 PostgreSQL）
curl -fsSL https://get.docker.com | sh

# 安装 Nginx
apt install -y nginx

# 安装 PM2（进程管理）
npm install -g pm2
```

### 第三步：部署 PostgreSQL

```bash
# 启动 PostgreSQL 容器
docker run -d --name hr-postgres \
  --restart=always \
  -e POSTGRES_USER=hr_user \
  -e POSTGRES_PASSWORD=设置一个强密码 \
  -e POSTGRES_DB=hr_platform \
  -v /data/postgres:/var/lib/postgresql/data \
  -p 127.0.0.1:5432:5432 \
  postgres:16

# 验证运行状态
docker ps | grep hr-postgres
```

### 第四步：部署应用

```bash
# 在服务器上创建项目目录
mkdir -p /opt/hr-platform

# 方式一：通过 Git 部署（推荐）
# 先将代码推送到 GitHub/Gitee
cd /opt/hr-platform
git clone https://github.com/你的用户名/hr-platform.git .

# 方式二：通过 scp 上传
# 在本地执行：scp -r ./hr-platform/* root@你的服务器IP:/opt/hr-platform/

# 安装依赖
cd /opt/hr-platform
npm install --production=false

# 配置环境变量
cat > .env << 'EOF'
DATABASE_URL="postgresql://hr_user:你设置的密码@localhost:5432/hr_platform"
NODE_ENV=production
EOF

# 初始化数据库
npx prisma db push

# 构建
npm run build

# 使用 PM2 启动
pm2 start npm --name "hr-platform" -- start
pm2 save
pm2 startup
```

### 第五步：配置 Nginx 反向代理

```bash
cat > /etc/nginx/sites-available/hr-platform << 'EOF'
server {
    listen 80;
    server_name 你的域名或IP;

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
EOF

ln -s /etc/nginx/sites-available/hr-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### 第六步：配置 HTTPS（可选但推荐）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（需要已绑定域名）
certbot --nginx -d 你的域名
```

### 第七步：配置防火墙

```bash
# 阿里云控制台 → 轻量应用服务器 → 防火墙规则
# 开放端口：80 (HTTP), 443 (HTTPS)
# 关闭端口：3000 (不需要直接暴露)
# 关闭端口：5432 (PostgreSQL 仅本地访问)
```

## 数据库备份

建议设置自动备份：

```bash
# 创建备份脚本
cat > /opt/hr-platform/backup.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR="/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker exec hr-postgres pg_dump -U hr_user hr_platform | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
SCRIPT

chmod +x /opt/hr-platform/backup.sh

# 添加定时任务（每天凌晨2点备份）
crontab -e
0 2 * * * /opt/hr-platform/backup.sh
```

## 更新应用

```bash
cd /opt/hr-platform
git pull
npm install
npx prisma db push   # 如果数据库模型有变更
npm run build
pm2 restart hr-platform
```

## 项目结构

```
hr-platform/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 全局布局
│   │   ├── page.tsx           # 数据看板（首页）
│   │   ├── job-seeking/       # 求职管理
│   │   ├── salary-growth/     # 薪酬与晋升
│   │   ├── growth/            # 成长档案
│   │   ├── resumes/           # 简历与求职信
│   │   ├── candidates/        # 候选人库
│   │   ├── knowledge/         # 招聘知识库
│   │   ├── market/            # 市场洞察
│   │   ├── companies/         # 公司库
│   │   ├── contacts/          # 人脉库
│   │   └── api/               # 后端 API 接口
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx    # 侧边导航
│   └── lib/
│       └── prisma.ts          # 数据库客户端
├── .env                       # 环境变量
├── package.json
└── next.config.js
```

## 常见问题

**Q: 数据库连接失败？**
检查 `.env` 中的 `DATABASE_URL` 是否正确，确认 PostgreSQL 容器正在运行。

**Q: 页面显示正常但数据为空？**
这是正常的，所有页面内置了 Mock 数据用于预览。连接数据库后，Mock 数据会被真实数据替代。首次使用需要先通过页面录入数据。

**Q: 如何修改端口？**
修改 Nginx 配置中的 `proxy_pass` 和 Next.js 启动端口（通过 `PORT` 环境变量）。
