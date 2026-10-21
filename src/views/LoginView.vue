<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const captchaInput = ref('')
const error = ref('')
const loading = ref(false)
const captchaCode = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCaptcha() {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = code
  drawCaptcha(code)
}

function drawCaptcha(code: string) {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  ctx.fillStyle = '#f9fafb'
  ctx.fillRect(0, 0, width, height)

  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  const fontSize = 28
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textBaseline = 'middle'

  for (let i = 0; i < code.length; i++) {
    const x = 16 + i * 32
    const y = height / 2 + Math.random() * 8 - 4
    const angle = (Math.random() - 0.5) * 0.6

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillStyle = `rgb(${50 + Math.random() * 100}, ${50 + Math.random() * 100}, ${50 + Math.random() * 100})`
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
}

async function handleLogin() {
  error.value = ''

  if (!captchaInput.value || captchaInput.value.toUpperCase() !== captchaCode.value) {
    error.value = '验证码错误'
    generateCaptcha()
    captchaInput.value = ''
    return
  }

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.replace('/admin/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
    generateCaptcha()
    captchaInput.value = ''
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  generateCaptcha()
})
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h1 class="title">管理系统登录</h1>
      <form class="form" @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="admin123"
            autocomplete="current-password"
          />
        </div>
        <div class="field">
          <label for="captcha">验证码</label>
          <div class="captcha-row">
            <input
              id="captcha"
              v-model="captchaInput"
              type="text"
              placeholder="请输入验证码"
              maxlength="4"
              autocomplete="off"
            />
            <canvas
              ref="canvasRef"
              width="140"
              height="44"
              class="captcha-canvas"
              @click="generateCaptcha"
              title="点击刷新验证码"
            />
          </div>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.login-box {
  width: 360px;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  margin: 0 0 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  color: #111827;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.field input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.field input:focus {
  border-color: #42b883;
}

.captcha-row {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 0.75rem;
  align-items: center;
}

.captcha-row input {
  width: 100%;
}

.captcha-canvas {
  width: 140px;
  height: 44px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  cursor: pointer;
  background: #f9fafb;
  box-sizing: border-box;
}

.error {
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 0.875rem;
}

.submit {
  padding: 0.75rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.submit:hover:not(:disabled) {
  background: #369870;
}

.submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
