<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { databases } from '../../api/appwrite'
import { Query, ID } from 'appwrite'

interface Share {
  $id: string
  title: string
  share_url: string
  $createdAt: string
}

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || ''
const collectionId = import.meta.env.VITE_APPWRITE_SHARE_COLLECTION_ID || ''

const list = ref<Share[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const error = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

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

function formatDate(iso: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function fetchList() {
  if (!databaseId || !collectionId) {
    error.value = '网盘分享 Collection 未配置'
    list.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await databases.listDocuments(databaseId, collectionId, [
      Query.orderDesc('$createdAt'),
      Query.limit(pageSize.value),
      Query.offset((page.value - 1) * pageSize.value),
    ])
    total.value = res.total
    list.value = res.documents.map((doc) => ({
      $id: doc.$id,
      title: doc.title || '',
      share_url: doc.share_url || '',
      $createdAt: doc.$createdAt,
    })) as Share[]
  } catch (e) {
    error.value = e instanceof Error ? e.message : '查询失败'
    list.value = []
  } finally {
    loading.value = false
  }
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  fetchList()
}

function changePageSize() {
  page.value = 1
  fetchList()
}

const showModal = ref(false)
const isEdit = ref(false)
const form = reactive({
  $id: '',
  title: '',
  share_url: '',
})
const formLoading = ref(false)
const formError = ref('')

function openCreate() {
  isEdit.value = false
  form.$id = ''
  form.title = ''
  form.share_url = ''
  formError.value = ''
  showModal.value = true
}

function openEdit(item: Share) {
  isEdit.value = true
  form.$id = item.$id
  form.title = item.title || ''
  form.share_url = item.share_url || ''
  formError.value = ''
  showModal.value = true
}

async function save() {
  if (!form.title.trim() || !form.share_url.trim()) {
    formError.value = '标题和分享链接不能为空'
    return
  }
  formLoading.value = true
  formError.value = ''
  try {
    const payload = {
      title: form.title.trim(),
      share_url: form.share_url.trim(),
    }
    if (isEdit.value && form.$id) {
      await databases.updateDocument(databaseId, collectionId, form.$id, payload)
    } else {
      await databases.createDocument(databaseId, collectionId, ID.unique(), payload)
    }
    showModal.value = false
    await fetchList()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    formLoading.value = false
  }
}

const deleteId = ref('')
const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)
const deleteError = ref('')

function confirmDelete(item: Share) {
  deleteId.value = item.$id
  deleteError.value = ''
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deleteId.value) return
  deleteLoading.value = true
  deleteError.value = ''
  try {
    await databases.deleteDocument(databaseId, collectionId, deleteId.value)
    showDeleteConfirm.value = false
    if (list.value.length === 1 && page.value > 1) {
      page.value--
    }
    await fetchList()
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : '删除失败，可能没有权限'
  } finally {
    deleteLoading.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <div class="share-list">
    <div class="header">
      <h1>网盘分享</h1>
      <button class="btn-primary" @click="openCreate">新增分享</button>
    </div>

    <div class="card">
      <div v-if="error" class="error-bar">{{ error }}</div>

      <table>
        <thead>
          <tr>
            <th>标题</th>
            <th>分享链接</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="empty">加载中...</td>
          </tr>
          <tr v-else-if="!list.length">
            <td colspan="4" class="empty">暂无数据</td>
          </tr>
          <tr v-for="item in list" v-else :key="item.$id">
            <td class="title-cell" :title="item.title">{{ item.title || '-' }}</td>
            <td>
              <a
                v-if="item.share_url"
                :href="item.share_url"
                target="_blank"
                rel="noopener"
                class="link"
              >
                打开链接
              </a>
              <span v-else>-</span>
            </td>
            <td>{{ formatDate(item.$createdAt) }}</td>
            <td>
              <button class="btn-text" @click="openEdit(item)">编辑</button>
              <button class="btn-text danger" @click="confirmDelete(item)">删除</button>
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
          <button v-else class="page-btn" :class="{ active: p === page }" @click="goToPage(p)">
            {{ p }}
          </button>
        </template>
        <button class="page-btn" :disabled="page >= totalPages" @click="goToPage(page + 1)">
          下一页
        </button>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ isEdit ? '编辑分享' : '新增分享' }}</h2>
        <div v-if="formError" class="error-bar">{{ formError }}</div>
        <div class="form">
          <div class="field">
            <label>标题 <span class="required">*</span></label>
            <input v-model="form.title" type="text" placeholder="请输入资源标题" />
          </div>
          <div class="field">
            <label>分享链接 <span class="required">*</span></label>
            <input v-model="form.share_url" type="url" placeholder="https://..." />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showModal = false">取消</button>
          <button class="btn-primary" :disabled="formLoading" @click="save">
            {{ formLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal small">
        <h2>确认删除</h2>
        <div v-if="deleteError" class="error-bar">{{ deleteError }}</div>
        <p>删除后无法恢复，确定要删除吗？</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteConfirm = false">取消</button>
          <button class="btn-danger" :disabled="deleteLoading" @click="doDelete">
            {{ deleteLoading ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.share-list .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.share-list h1 {
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

.title-cell {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link {
  color: #3b82f6;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 0;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background: #42b883;
  color: #fff;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  margin-right: 0.75rem;
  font-size: 0.875rem;
}

.btn-text.danger {
  color: #ef4444;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal.small {
  max-width: 360px;
}

.modal h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.modal .form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field label {
  font-size: 0.875rem;
  color: #374151;
}

.required {
  color: #ef4444;
}

.field input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9375rem;
  outline: none;
  box-sizing: border-box;
}

.field input:focus {
  border-color: #42b883;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
