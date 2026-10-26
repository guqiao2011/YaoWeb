<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">后台管理</div>
      <nav class="menu">
        <RouterLink to="/admin/dashboard" class="menu-item">
          仪表盘
        </RouterLink>
        <RouterLink to="/admin/users" class="menu-item">
          用户管理
        </RouterLink>
        <RouterLink to="/admin/resources" class="menu-item">
          资源管理
        </RouterLink>
        <RouterLink to="/admin/proxy" class="menu-item">
          Proxy 管理
        </RouterLink>
        <RouterLink to="/admin/settings" class="menu-item">
          系统设置
        </RouterLink>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <span class="breadcrumb">管理系统</span>
        <div class="user-actions">
          <span class="user">{{ auth.user?.name || auth.user?.email || '管理员' }}</span>
          <button class="logout" @click="handleLogout">退出登录</button>
        </div>
      </header>
      <div class="content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #1f2937;
  color: #fff;
  flex-shrink: 0;
}

.logo {
  padding: 1.25rem;
  font-size: 1.25rem;
  font-weight: bold;
  border-bottom: 1px solid #374151;
}

.menu {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
}

.menu-item {
  padding: 0.875rem 1.25rem;
  color: #d1d5db;
  text-decoration: none;
  transition: background 0.2s;
}

.menu-item:hover,
.menu-item.router-link-active {
  background: #374151;
  color: #fff;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb {
  font-weight: 500;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user {
  color: #6b7280;
}

.logout {
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.logout:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}
</style>
