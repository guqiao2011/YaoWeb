import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface User {
  username: string
  nickname?: string
}

const TOKEN_KEY = 'yao_token'
const USER_KEY = 'yao_user'

function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(getStoredUser())
  const isAuthenticated = computed(() => !!token.value)

  function setAuth(newToken: string, newUser: User) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(username: string, password: string) {
    // 模拟登录校验，后续可替换为真实接口
    if (!username || !password) {
      throw new Error('用户名和密码不能为空')
    }
    if (username !== 'admin' || password !== 'admin123') {
      throw new Error('用户名或密码错误')
    }

    const fakeToken = `fake-token-${Date.now()}`
    setAuth(fakeToken, { username, nickname: '管理员' })
    return user.value
  }

  function logout() {
    clearAuth()
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    setAuth,
    clearAuth,
  }
})
