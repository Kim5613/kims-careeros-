# Kim's CareerOS 部署进度存档

日期：2026年6月21日

## 今晚完成的工作

### 1. 项目搭建（已完成）
- Next.js 14 + Ant Design + Prisma + PostgreSQL 全栈项目
- 10个页面 + 15个API接口 + 完整数据库模型
- 本地运行正常：`D:\AI\hr-platform`，`npm run dev` 可预览

### 2. 系统模块（已完成）
- 我的职业发展：求职管理、薪酬晋升、成长档案、简历求职信
- HR工作台：候选人库、招聘知识库、市场洞察
- 基础数据层：公司库、人脉库
- 数据看板首页

### 3. Git 仓库（已完成）
- 本地 Git 已初始化并提交
- GitHub 仓库：https://github.com/Kim5613/kims-careerros-
- 代码已通过网页上传到 GitHub（但 GitHub Desktop 推送还有问题待修复）

### 4. 域名（进行中）
- 已购买：kimstar.cn
- 已提交 ICP 备案，等待审批（约1-2周）

### 5. 阿里云服务器（已购买，环境部分完成）
- 服务器 IP：139.196.159.68
- 系统：Ubuntu 24.04
- 已安装：Node.js v18.19.1、Nginx 1.24.0、PM2 7.0.1、Docker 29.6.0、PostgreSQL
- 已创建数据库和用户：hr_platform / hr_user / 密码 Kim2026Secure

### 6. 国内环境优化（已完成）
- .npmrc 配置了淘宝镜像源
- Prisma 引擎配置了国内镜像
- 创建了 deploy.sh 一键部署脚本

## 明天继续：待办清单

### 第一步：把代码从 GitHub 克隆到服务器
今晚卡在这一步：从阿里云服务器 git clone GitHub 仓库超时。
解决方案（按优先级）：
1. 在服务器终端尝试用加速镜像克隆：
   ```
   git clone https://ghproxy.cc/https://github.com/Kim5613/kims-careerros-.git /opt/hr-platform
   ```
2. 如果镜像也不行，尝试配置 git 超时参数后直连：
   ```
   git config --global http.postBuffer 524288000
   git config --global http.lowSpeedLimit 0
   git config --global http.lowSpeedTime 999999
   git clone https://github.com/Kim5613/kims-careerros-.git /opt/hr-platform
   ```

### 第二步：在服务器上安装依赖并构建
```
cd /opt/hr-platform
npm install
npx prisma db push
npm run build
```
注意：npm install 和 prisma 都配好了国内镜像，应该没问题。

### 第三步：用 PM2 启动应用
```
pm2 start npm --name "hr-platform" -- start
pm2 save
pm2 startup
```

### 第四步：配置 Nginx 反向代理
```
cat > /etc/nginx/sites-available/hr-platform << 'NGINX'
server {
    listen 80;
    server_name _;
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
NGINX
ln -sf /etc/nginx/sites-available/hr-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### 第五步：验证
浏览器打开 http://139.196.159.68 看系统是否正常。

### 第六步（备案通过后）：绑定域名
- 在阿里云 DNS 里添加 A 记录：kimstar.cn → 139.196.159.68
- 配置 HTTPS（用 certbot）

## 服务器登录方式
- 阿里云控制台 → 轻量应用服务器 → 远程连接 → Workbench
- 登录后输入 `sudo -i` 切换到 root

## 关键信息备忘
- 服务器 IP：139.196.159.68
- 服务器 root 密码：（你自己设的那个）
- 数据库用户：hr_user
- 数据库密码：Kim2026Secure
- 数据库名：hr_platform
- GitHub 仓库：https://github.com/Kim5613/kims-careerros-
- 域名：kimstar.cn
