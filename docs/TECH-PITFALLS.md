# 技术盲点清单 — 新增功能前必读

> 来源：v1.2 上线事故（2026-07-22 AI 全哑）+ 二轮迭代修复 + v1.3 上线前深审（2026-07-30）的真实教训。
> **每一条都踩过，不是理论。** 新增任何功能前对照检查一遍。

---

## 一、AI 接口类（ai SDK v7）

### 1. `streamText` 挂工具必须显式 `stopWhen`
- v7 默认 `stepCountIs(1)`：模型第一步调工具后循环即终止，**永远走不到生成文字的第二步** → 200 空响应
- 正确姿势（参考 `src/app/api/chat/route.ts`）：
  ```ts
  import { streamText, isStepCount } from 'ai';
  streamText({ ..., tools, stopWhen: isStepCount(8) })
  ```

### 2. 流式响应会静默吞掉错误
- `textStream` / `toTextStreamResponse()` 会忽略 error 分片：key 缺失、401、余额不足，前端看到的都是"200 空响应"，不报错
- 必须加 `onError: ({ error }) => console.error(...)` 把真实错误打进 pm2 日志
- **排查口诀：AI 接口"200 但空"，第一反应查服务器 env 和模型 key，别查前端**

### 3. 前后端流式协议必须成对
- 后端返回一次性 JSON、前端按 `getReader()` 流式渲染 → 整串 JSON 被当 markdown 显示，不报错但全错
- 非流式长生成还会撞 Nginx 默认 60s `proxy_read_timeout`
- **改一端必须查另一端**，验收标准是"真跑一次完整流程"，不是"接口返回 200"

---

## 二、鉴权类（middleware）

### 4. 花钱的 API 永远不进免登录白名单
- `src/middleware.ts` 的 `SKIP_PREFIXES` 里放过 `/api/ai/` → 陌生人 curl 裸调刷 DeepSeek 额度（已实测证实）
- 无登录态的客户端（桌宠）：路由内校验专属 token（`PET_TOKEN` 请求头），不靠 middleware 放行

### 5. middleware 307 重定向会被 fetch 自动跟随
- 未登录 API 请求被 307 到 `/login` → fetch 跟随拿到 **200 + 登录页 HTML**，前端会把 HTML 当数据渲染
- 前端调任何受保护接口后必须拦：
  ```ts
  if ((res.headers.get('content-type') || '').includes('text/html')) throw new Error('登录已过期');
  ```

---

## 三、缓存类（Next.js App Router）

### 6. GET 路由默认可能被静态缓存
- 无 `force-dynamic` 的 GET API 会被 build 成 ○ 静态预渲染，handler 只执行一次（电影台词不更新、桌宠设置读旧值，两次踩同一坑）
- **铁律：凡返回动态数据的 GET 路由，先写 `export const dynamic = 'force-dynamic'` 再写业务**
- build 后看路由表：动态路由应是 `ƒ`，出现 `○` 的 API 就是隐患

---

## 四、存储与部署类

### 7. 用户数据永远不写代码目录
- `server-deploy.sh` 第 0 步 `git checkout -- . && git clean -fd` 会重置/删除代码目录下一切未提交内容
- 用户数据只能写：`/data/careeros-uploads/`（部署脚本已创建）或数据库
- 参考实现：`src/lib/pet-settings.ts`（生产写 /data，本地自动回退）

### 8. .env 不进 git，部署脚本必须校验内容
- 服务器 `.env` 是首次部署手工创建的，后续新增的环境变量**永远不会自动同步**
- `server-deploy.sh` 已强制校验 `DEEPSEEK_API_KEY`/`JWT_SECRET`——**新增必需 env 时，同步加校验 + 更新 .env.example**
- 当前服务器需配：`DEEPSEEK_API_KEY`（必需）、`TAVILY_API_KEY`（联网搜索）、`PET_TOKEN`（桌宠接口防刷）

### 9. 新文件不 `git add` 等于没写
- 桌宠整套文件未追踪 → 线上 `/api/chat` 404
- **交付前反查 `git status --porcelain`，`??` 开头的逐一确认**（已写进个人 delivery-checklist）

### 10. DuckDuckGo 在国内服务器不可用
- 默认搜索源 DDG 被墙，每次白等 5s 超时且无结果
- 联网功能上线必须配 `TAVILY_API_KEY`，或换国内可用搜索源

---

## 五、前端体验类

### 11. 长等待必须给用户预期
- "先搜索再生成"有 5-20s 死寂期，用户会以为卡死 → 等待文案写明阶段和耗时（参考诊断页）

### 12. 对话历史：持久化 + 截断发送
- 不持久化 → 刷新即丢；全量重发 → token 线性膨胀
- 参考 `AISkillPanel`：localStorage 存 50 条，每次请求只带最近 20 条

---

## 六、静默失效类（v1.3 深审新增 — 构建全绿但功能是坏的）

> 这一类的共同特征：**不报错、构建通过、类型检查通过**，只有真用功能才会发现。
> 防御手段只有一个：功能写完后真点一遍/真跑一次，不能只看构建绿。

### 13. JSX 块注释未闭合会吞掉整段组件
- `{/* ════ 标题` 忘了写收尾的 `════ */}`，注释一路延伸吃掉后面几十行——整个 Modal 从渲染树消失，语法合法、构建通过、功能完全失效
- 踩点：identity 页「个人信息编辑」弹窗，点编辑毫无反应（2026-07-30）
- **防御：改 JSX 注释区后，对应功能必须真点一遍；长装饰性注释首尾成对写**

### 14. 正则工具函数：字面量与模式不可混用
- `extractSection(heading)` 内部对 heading 做 `escapeRegex`，调用方却传 `'缘由.*'` 这类模式 → 全部被转义成字面量，**解析结果永远为空**，不报错
- 同理：行级解析里 `\s*` 会匹配换行，字段留空时吞掉换行把下一行当值 → 后面所有字段错一行
- 行内匹配用 `[ \t]*`、值用 `[^\n]*`；函数契约要写清"按正则处理"还是"按字面处理"
- **防御：解析器/转换器写完必须拿真实输入跑一次看输出，别只看类型对**

### 15. mapXxx 转换函数必须透传后端返回的全部字段
- `mapApp` 没拷 `resumeId` → 编辑弹窗回填永远 null → 保存时把已关联的简历**静默置空**（数据丢失，用户无感知）
- **防御：后端响应加字段时，全局搜它的 map/转换函数同步加；编辑回写场景重点查**

### 16. POST 解构出字段却忘了落库
- `const { skills, ...rest } = body` 把 skills 摘出来后没用 → 新建项目丢全部技能；PATCH 有对应落库逻辑，POST 没有 → 行为不对称
- **防御：POST/PATCH 同资源的行为要对称审查；解构出来的每个变量都要有用处**

### 17. hooks 的竞态与静默降级
- 无序号守卫的 refetch：快速切换筛选（如简历 A→B），慢的旧响应后到达覆盖新数据 → 显示的和写入的不一致
- 修复模式：`const id = ++reqIdRef.current`，setData 前判断 `id === reqIdRef.current`
- 静默本地降级（Mock fallback）冒充成功：数据没入库但提示"已保存"，刷新即丢 → **降级路径必须 message.warning 告知「未同步到服务器」**
- 已有真实数据时 refetch 失败不能再拿 mock 覆盖（仅首次加载允许降级）

---

## 验收清单（新增功能上线前逐项打勾）

- [ ] AI 接口：有 `stopWhen`、有 `onError` 日志、前后端流式协议一致
- [ ] 鉴权：新 API 不在 `SKIP_PREFIXES`（或有 token 校验）；前端拦 text/html
- [ ] 缓存：动态 GET 路由有 `force-dynamic`；build 路由表确认是 `ƒ`
- [ ] 存储：用户数据不在代码目录
- [ ] 环境：新 env 加了 deploy 脚本校验 + .env.example
- [ ] git：`git status` 无遗漏的 `??` 文件
- [ ] 体验：长等待有进度文案；对话类有持久化+截断
- [ ] 静默失效：新功能真点一遍（不只是构建绿）；解析器拿真实输入跑一次
- [ ] 数据完整：map 转换函数透传新字段；POST/PATCH 落库字段对称
- [ ] hooks：切筛选会 refetch 的有竞态守卫；本地降级有「未同步」提示
- [ ] 上线后：用 curl 真调一次，看到真实内容（不是 200 就完事）
