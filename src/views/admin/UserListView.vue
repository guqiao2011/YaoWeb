<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
}

const users = ref<User[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: '启用' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', status: '启用' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '访客', status: '禁用' },
])

function toggleStatus(user: User) {
  user.status = user.status === '启用' ? '禁用' : '启用'
}
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h1>用户管理</h1>
      <button class="btn-primary">新增用户</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span class="tag" :class="user.status === '启用' ? 'enabled' : 'disabled'">
                {{ user.status }}
              </span>
            </td>
            <td>
              <button class="btn-text" @click="toggleStatus(user)">
                {{ user.status === '启用' ? '禁用' : '启用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.user-list .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.user-list h1 {
  font-size: 1.5rem;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

th {
  color: #6b7280;
  font-weight: 600;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.tag.enabled {
  background: #d1fae5;
  color: #065f46;
}

.tag.disabled {
  background: #fee2e2;
  color: #991b1b;
}
</style>
