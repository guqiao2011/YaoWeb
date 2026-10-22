<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { databases } from '../../api/appwrite'
import { Query } from 'appwrite'

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  status: string
}

// 未配置 Appwrite 数据库时使用的本地演示数据
const MOCK_USERS: UserItem[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  name: ['张三', '李四', '王五', '赵六', '孙七'][i % 5] + (i + 1),
  email: `user${i + 1}@example.com`,
  role: ['管理员', '编辑', '访客'][i % 3],
  status: i % 4 === 3 ? '禁用' : '启用',
}))

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || ''
const collectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || ''
const useAppwrite = !!(databaseId && collectionId)

const users = ref<UserItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const error = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

// 生成页码（最多显示 7 个，带省略号）
const pageNumbers = computed<(number | '...')[]>(() => {
  const pages: (number | '...')[] = []
  const tp = totalPages.value
  const cur = page.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
    return pages
  }
  pages.push(1)
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(tp - 1, cur + 1); i++) pages.push(i)
  if (cur < tp - 2) pages.push('...')
  pages.push(tp)
  return pages
})

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    if (useAppwrite) {
      const res = await databases.listDocuments(databaseId, collectionId, [
        Query.limit(pageSize.value),
        Query.offset((page.value - 1) * pageSize.value),
      ])
      total.value = res.total
      users.value = res.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name || '-',
        email: doc.email || '-',
        role: doc.role || '-',
        status: doc.status || '启用',
      }))
    } else {
      // 本地演示数据分页
      total.value = MOCK_USERS.length
      const start = (page.value - 1) * pageSize.value
      users.value = MOCK_USERS.slice(start, start + pageSize.value)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '查询失败'
    users.value = []
  } finally {
    loading.value = false
  }
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  fetchUsers()
}

function changePageSize() {
  page.value = 1
  fetchUsers()
}

function toggleStatus(user: UserItem) {
  user.status = user.status === '启用' ? '禁用' : '启用'
}

onMounted(fetchUsers)
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h1>用户管理</h1>
      <button class="btn-primary">新增用户</button>
    </div>

    <div class="card">
      <div v-if="error" class="error-bar">{{ error }}</div>

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
          <tr v-if="loading">
            <td colspan="6" class="empty">加载中...</td>
          </tr>
          <tr v-else-if="!users.length">
            <td colspan="6" class="empty">暂无数据</td>
          </tr>
          <tr v-for="user in users" v-else :key="user.id">
            <td class="id-cell" :title="user.id">{{ user.id }}</td>
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

      <div class="pagination">
        <span class="total">共 {{ total }} 条</span>
        <select v-model.number="pageSize" class="page-size" @change="changePageSize">
          <option :value="5">5 条/页</option>
          <option :value="10">10 条/页</option>
          <option :value="20">20 条/页</option>
        </select>
        <button class="page-btn" :disabled="page <= 1" @click="goToPage(page - 1)">上一页</button>
        <template v-for="(p, i) in pageNumbers" :key="i">
          <span v-if="p === '...'" class="ellipsis">...</span>
          <button
            v-else
            class="page-btn"
            :class="{ active: p === page }"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
        </template>
        <button class="page-btn" :disabled="page >= totalPages" @click="goToPage(page + 1)">
          下一页
        </button>
      </div>
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

.error-bar {
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 0.875rem;
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

.id-cell {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 0;
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

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.total {
  color: #6b7280;
  font-size: 0.875rem;
}

.page-size {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #374151;
  background: #fff;
}

.page-btn {
  min-width: 2rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: #42b883;
  color: #42b883;
}

.page-btn.active {
  background: #42b883;
  border-color: #42b883;
  color: #fff;
}

.page-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.ellipsis {
  color: #9ca3af;
  padding: 0 0.25rem;
}
</style>
