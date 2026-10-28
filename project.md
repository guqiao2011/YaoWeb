# YaoWeb 项目变更记录

## 项目简介

YaoWeb 是一个基于 Vue 3 + TypeScript + Vite 构建的管理系统前端项目。

---

## 原始需求

1. 解决直接访问 `https://yaoshare.sites.deploybase.eu/admin/dashboard` 提示 page not found 的问题，但从首页点击跳转正常。
2. 默认进入登录页，登录成功后进入管理系统主页。

---

## 变更记录

### 2026-10-20

#### 1. 修复直接访问管理后台 404 的问题

- **问题原因**：项目使用 Vue Router 的 History 模式（`createWebHistory`），直接访问子路由时服务器没有对应物理文件，返回 404。
- **解决方案**：将路由模式切换为 Hash 模式（`createWebHashHistory`）。
- **涉及文件**：
  - `src/router/index.ts`
- **提交记录**：
  - `fix: switch router to hash mode to prevent 404 on direct admin access`

#### 2. 新增登录页与认证守卫

- **需求**：默认进入登录页，登录成功后跳转管理系统主页；未登录时禁止访问管理后台。
- **实现内容**：
  - 新增 `src/views/LoginView.vue` 登录页面。
  - 新增 `src/stores/auth.ts` Pinia 认证状态管理，token 与用户信息持久化到 `localStorage`。
  - 更新 `src/router/index.ts`：
    - `/` 重定向到 `/login`
    - 新增 `/login` 公开路由
    - `/admin` 及其子路由添加认证守卫
    - 已登录用户访问登录页自动跳转 `/admin/dashboard`
  - 更新 `src/layouts/AdminLayout.vue`：右上角显示当前用户名，新增「退出登录」按钮。
  - 更新 `src/api/request.ts`：请求拦截器自动附加 `Authorization: Bearer <token>`。
  - 简化 `src/App.vue`：移除顶部公共导航，由登录页和管理后台布局自行控制页面结构。
- **测试账号**：
  - 用户名：`admin`
  - 密码：`admin123`
- **涉及文件**：
  - `src/views/LoginView.vue`（新增）
  - `src/stores/auth.ts`（新增）
  - `src/router/index.ts`
  - `src/layouts/AdminLayout.vue`
  - `src/api/request.ts`
  - `src/App.vue`
- **提交记录**：
  - `feat: add login page and auth guard for admin routes`

#### 3. 修复登录页和管理后台未全屏显示的问题

- **问题原因**：默认 Vite/Vue 模板在 `src/style.css` 中将 `#app` 设置为固定宽度 `1126px` 并居中，导致登录页和管理后台无法铺满屏幕。
- **解决方案**：移除 `#app` 的固定宽度、居中和边框样式，保留最小高度和 flex 布局。
- **涉及文件**：
  - `src/style.css`

#### 4. 接入 Appwrite 作为后端认证

- **需求**：使用 Appwrite 替代本地 mock 登录，实现真实的邮箱/密码登录、会话保持和退出功能。
- **实现内容**：
  - 安装 `appwrite` SDK。
  - 新增 `src/api/appwrite.ts`：创建 Appwrite Client 和 Account 实例。
  - 更新 `.env` 与 `.env.development`：新增 `VITE_APPWRITE_ENDPOINT` 和 `VITE_APPWRITE_PROJECT_ID` 环境变量占位符。
  - 重写 `src/stores/auth.ts`：
    - `login(email, password)` 调用 `account.createEmailPasswordSession` 创建会话。
    - `logout()` 调用 `account.deleteSession('current')` 销毁会话。
    - `checkSession()` 调用 `account.get()` 校验当前会话是否有效。
    - 用户信息（id、email、name）缓存到 `localStorage`。
  - 更新 `src/router/index.ts`：路由守卫改为异步，先校验 Appwrite 会话再决定是否放行。
  - 更新 `src/views/LoginView.vue`：登录表单从「用户名/密码」改为「邮箱/密码」。
  - 更新 `src/layouts/AdminLayout.vue`：显示 Appwrite 用户 name/email，退出改为异步调用。
  - 更新 `src/api/request.ts`：移除手动附加 token 的逻辑，Appwrite 通过 session cookie 自动完成认证。
- **环境变量**：
  - `VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1`
  - `VITE_APPWRITE_PROJECT_ID=697980d100114c8bbe3b`
- **涉及文件**：
  - `package.json`
  - `package-lock.json`
  - `.env`
  - `.env.development`
  - `src/api/appwrite.ts`（新增）
  - `src/stores/auth.ts`
  - `src/router/index.ts`
  - `src/views/LoginView.vue`
  - `src/layouts/AdminLayout.vue`
  - `src/api/request.ts`

#### 5. 登录页增加图形验证码

- **需求**：在登录表单中增加图形验证码，防止简单机器人暴力登录。
- **实现内容**：
  - 更新 `src/views/LoginView.vue`：
    - 使用 Canvas 绘制 4 位字符（字母+数字）的图形验证码。
    - 验证码包含随机干扰线和字符旋转偏移。
    - 增加验证码输入框，点击验证码图片可刷新。
    - 提交登录时先校验验证码（不区分大小写），验证失败时刷新验证码并清空输入。
- **涉及文件**：
  - `src/views/LoginView.vue`

#### 6. 修复登录页验证码对齐问题

- **问题原因**：验证码图片使用 flex 布局，未统一 `box-sizing`，导致图片右侧与上方输入框右侧未对齐。
- **解决方案**：
  - 将验证码行改为 `grid` 布局，`grid-template-columns: 1fr 140px`。
  - 为输入框和验证码图片统一添加 `box-sizing: border-box` 和 `width: 100%`。
- **涉及文件**：
  - `src/views/LoginView.vue`

#### 7. 登录页添加美观背景

- **需求**：为登录页增加一个好看的背景，提升视觉效果。
- **实现内容**：
  - 更新 `src/views/LoginView.vue`：
    - 背景改为蓝绿紫三色渐变。
    - 添加 3 个模糊浮动光斑，使用 `radial-gradient` 和 `filter: blur`。
    - 光斑带有缓慢的浮动动画。
    - 登录卡片改为半透明白底、圆角、阴影和轻微毛玻璃效果。
- **涉及文件**：
  - `src/views/LoginView.vue`

#### 8. 用户管理页实现分页查询

- **需求**：登录成功后，在后台实现分页查询功能。
- **实现内容**：
  - 重写 `src/views/admin/UserListView.vue`：
    - 用户列表改为分页查询，分页条包含总条数、每页条数切换（5/10/20）、上一页/下一页、页码导航（超过 7 页自动显示省略号）。
    - 增加加载中、暂无数据、查询失败错误提示等状态。
    - 数据源：配置了 `VITE_APPWRITE_DATABASE_ID` 和 `VITE_APPWRITE_USERS_COLLECTION_ID` 时，通过 Appwrite `databases.listDocuments` + `Query.limit/offset` 查询；未配置时使用 23 条本地演示数据做客户端分页。
  - 更新 `src/api/appwrite.ts`：导出 `databases` 实例。
  - 更新 `.env`：新增 `VITE_APPWRITE_DATABASE_ID`、`VITE_APPWRITE_USERS_COLLECTION_ID` 配置项（默认为空）。
- **涉及文件**：
  - `src/views/admin/UserListView.vue`
  - `src/api/appwrite.ts`
  - `.env`

#### 9. 资源管理接入 Appwrite 并实现 CRUD

- **需求**：尝试先访问一张表，方便后台进行增删改查（分页）。
- **提供信息**：
  - Database ID：`697981170031052d0067`
  - Collection ID：`69ad8daa00363c1463ee`
  - 字段：`desc`（String）、`source`（String）、`url`（String）、`group_url`（String）
  - 权限：guest 可 Create/Read/Update，特定账号有删除权限。
- **实现内容**：
  - 新增 `src/views/admin/ResourceListView.vue`：
    - 表格显示 `name`、`desc`、`url`、`group_url`、`source`、`$createdAt`。
    - 名称使用 `name` 字段，未填写时回退显示 `$id`。
    - 创建时间使用 `$createdAt` 并格式化为中文日期时间。
    - 支持分页查询、新增、编辑、删除。
  - 更新 `src/router/index.ts`：添加 `/admin/resources` 路由。
  - 更新 `src/layouts/AdminLayout.vue`：侧边栏增加「资源管理」入口。
  - 更新 `src/api/appwrite.ts`：导出 `databases` 实例。
  - 更新 `.env`：配置资源管理使用的 Database ID 和 Collection ID。

#### 10. 用户管理恢复为本地 mock 数据

- **需求**：用户管理的数据暂时不要接入 Appwrite。
- **实现内容**：
  - 修改 `src/views/admin/UserListView.vue`：移除 Appwrite 相关代码，完全使用本地 23 条 mock 数据做分页展示。
  - 简化 `.env` 注释，明确当前 Collection 只给资源管理使用。
- **涉及文件**：
  - `src/views/admin/UserListView.vue`
  - `.env`

#### 11. Proxy 管理接入 Appwrite

- **需求**：继续对接 Proxy 表。
- **提供信息**：
  - Database ID：`697981170031052d0067`
  - Collection ID：`69b3d63c001bb1b768db`
  - 字段：`subscription`（String）、`$createdAt`
- **实现内容**：
  - 新增 `src/views/admin/ProxyListView.vue`：
    - 表格显示 `ID`、`订阅信息`、`创建时间`、`操作`。
    - 支持分页查询、新增、编辑、删除。
    - 订阅信息使用 `textarea` 输入框，方便粘贴长文本。
  - 更新 `src/router/index.ts`：添加 `/admin/proxy` 路由。
  - 更新 `src/layouts/AdminLayout.vue`：侧边栏增加「Proxy 管理」入口。
  - 更新 `.env`：添加 `VITE_APPWRITE_PROXY_COLLECTION_ID`。
- **涉及文件**：
  - `src/views/admin/ProxyListView.vue`
  - `src/router/index.ts`
  - `src/layouts/AdminLayout.vue`
  - `.env`

#### 12. 网盘分享接入 Appwrite

- **需求**：创建一张网盘分享表，用于分享网盘资源。
- **最终确定字段**：
  - `title`（String）
  - `share_url`（String）
  - `$createdAt`（内置）
- **提供信息**：
  - Database ID：`697981170031052d0067`
  - Collection ID：`6adf66a4001f946c9435`
- **实现内容**：
  - 新增 `src/views/admin/ShareListView.vue`：
    - 表格显示 `标题`、`分享链接`、`创建时间`、`操作`。
    - 支持分页查询、新增、编辑、删除。
  - 更新 `src/router/index.ts`：添加 `/admin/shares` 路由。
  - 更新 `src/layouts/AdminLayout.vue`：侧边栏增加「网盘分享」入口。
  - 更新 `.env`：添加 `VITE_APPWRITE_SHARE_COLLECTION_ID`。
- **涉及文件**：
  - `src/views/admin/ShareListView.vue`
  - `src/router/index.ts`
  - `src/layouts/AdminLayout.vue`
  - `.env`

---

## 后续变更约定

每次对项目功能、配置或结构进行改动时，需在本文件末尾按时间顺序追加记录，内容至少包括：

- 变更日期
- 变更背景 / 原始需求
- 具体改动说明
- 涉及文件
- 提交记录（commit message）
