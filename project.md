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

---

## 后续变更约定

每次对项目功能、配置或结构进行改动时，需在本文件末尾按时间顺序追加记录，内容至少包括：

- 变更日期
- 变更背景 / 原始需求
- 具体改动说明
- 涉及文件
- 提交记录（commit message）
