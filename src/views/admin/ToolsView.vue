<script setup lang="ts">
import { ref } from 'vue'
import { functions } from '../../api/appwrite'
import { ExecutionMethod } from 'appwrite'

interface CheckResult {
  url: string
  valid: boolean
  reason: string
  title: string
}

const inputText = ref('')
const loading = ref(false)
const error = ref('')
const results = ref<CheckResult[]>([])
const functionId = import.meta.env.VITE_APPWRITE_FUNCTION_ID || ''

function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s<>"'，。；、！？：（）【】《》]+/g
  const trim = '.,;:!?)]}>"\''
  const found: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    let u = m[0].trimEnd()
    while (trim.includes(u[u.length - 1])) u = u.slice(0, -1)
    if (u) found.push(u)
  }
  return [...new Set(found)]
}

async function handleCheck() {
  error.value = ''
  results.value = []

  if (!functionId) {
    error.value = '未配置 VITE_APPWRITE_FUNCTION_ID，请在 .env 中设置'
    return
  }

  const urls = extractUrls(inputText.value)
  if (!urls.length) {
    error.value = '未检测到任何链接'
    return
  }

  loading.value = true
  try {
    const execution = await functions.createExecution(
      functionId,
      JSON.stringify({ urls }),
      false,
      '/',
      ExecutionMethod.POST,
      { 'Content-Type': 'application/json' },
    )

    const body = execution.responseBody
    const data = typeof body === 'string' ? JSON.parse(body || '{}') : body

    if (data.error) {
      throw new Error(data.error)
    }
    results.value = data.results || []
  } catch (e) {
    error.value = e instanceof Error ? e.message : '检测失败'
  } finally {
    loading.value = false
  }
}

function clearAll() {
  inputText.value = ''
  results.value = []
  error.value = ''
}
</script>

<template>
  <div class="tools">
    <h1>工具集</h1>

    <div class="card quark-checker">
      <h2>夸克网盘链接有效性检测</h2>
      <p class="tip">粘贴包含链接的文本，或每行一个链接。检测逻辑由 Appwrite Function 执行。</p>

      <textarea
        v-model="inputText"
        class="url-input"
        rows="8"
        placeholder="请粘贴需要检测的内容..."
      ></textarea>

      <div class="actions">
        <button class="btn-primary" :disabled="loading" @click="handleCheck">
          {{ loading ? '检测中...' : '开始检测' }}
        </button>
        <button class="btn-secondary" @click="clearAll">清空</button>
      </div>

      <div v-if="error" class="error-bar">{{ error }}</div>

      <div v-if="results.length" class="results">
        <div class="result-summary">
          共 {{ results.length }} 条，有效 {{ results.filter((r) => r.valid).length }} 条，失效 {{ results.filter((r) => !r.valid).length }} 条
        </div>
        <table>
          <thead>
            <tr>
              <th>状态</th>
              <th>链接</th>
              <th>名称</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in results" :key="item.url">
              <td>
                <span class="tag" :class="item.valid ? 'valid' : 'invalid'">
                  {{ item.valid ? '有效' : '失效' }}
                </span>
              </td>
              <td class="url-cell" :title="item.url">{{ item.url }}</td>
              <td>{{ item.title || '-' }}</td>
              <td>{{ item.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tools h1 {
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.quark-checker h2 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.tip {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.url-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9375rem;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
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

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.error-bar {
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 0.875rem;
}

.results {
  margin-top: 1.5rem;
}

.result-summary {
  margin-bottom: 0.75rem;
  color: #374151;
  font-weight: 500;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 0.625rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

th {
  color: #6b7280;
  font-weight: 600;
}

.url-cell {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.tag.valid {
  background: #d1fae5;
  color: #065f46;
}

.tag.invalid {
  background: #fee2e2;
  color: #991b1b;
}
</style>
