import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { account } from '../api/appwrite'

interface User {
  id: string
  email: string
  name: string
}

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
  const user = ref<User | null>(getStoredUser())
  const isAuthenticated = computed(() => !!user.value)
  const isReady = ref(false)

  function setUser(newUser: User) {
    user.value = newUser
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  function clearUser() {
    user.value = null
    localStorage.removeItem(USER_KEY)
  }

  async function checkSession() {
    try {
      const current = await account.get()
      setUser({
        id: current.$id,
        email: current.email,
        name: current.name,
      })
    } catch {
      clearUser()
    } finally {
      isReady.value = true
    }
  }

  async function login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('邮箱和密码不能为空')
    }

    try {
      await account.createEmailPasswordSession(email, password)
      const current = await account.get()
      setUser({
        id: current.$id,
        email: current.email,
        name: current.name,
      })
      return user.value
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      throw new Error(message)
    }
  }

  async function logout() {
    try {
      await account.deleteSession('current')
    } finally {
      clearUser()
    }
  }

  return {
    user,
    isAuthenticated,
    isReady,
    login,
    logout,
    checkSession,
    setUser,
    clearUser,
  }
})
