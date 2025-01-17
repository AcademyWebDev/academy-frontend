// stores/auth.ts
import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {z} from 'zod'
import {useAxios} from '~/composables/useAxios'

const userSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['student', 'lecturer', 'admin']),
    avatar: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'student' | 'lecturer'
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)
    const loading = ref(false)

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const userRole = computed(() => user.value?.role)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isLecturer = computed(() => user.value?.role === 'lecturer')
    const isStudent = computed(() => user.value?.role === 'student')

    async function login(email: string, password: string) {
        loading.value = true
        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const mockUser: User = {
                    id: 1,
                    email,
                    name: 'John Doe',
                    role: 'lecturer',
                    avatar: '/default-avatar.jpg'
                }
                setUser(mockUser)
                setToken('mock-token')
                return
            }

            const axios = useAxios()
            const {data} = await axios.post('/api/auth/login', {
                email,
                password
            })

            setUser(data.user)
            setToken(data.token)
        } catch (error) {
            console.error('Login error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    async function register(data: RegisterData) {
        loading.value = true
        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const mockUser = {
                    id: 1,
                    email: data.email,
                    name: `${data.firstName} ${data.lastName}`,
                    role: data.role,
                    avatar: '/default-avatar.jpg'
                }
                setUser(mockUser)
                setToken('mock-token')
                return
            }

            const axios = useAxios()
            const response = await axios.post('/api/auth/register', data)

            setUser(response.data.user)
            setToken(response.data.token)
        } catch (error) {
            console.error('Registration error:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        try {
            if (process.env.NODE_ENV !== 'development') {
                const axios = useAxios()
                await axios.post('/api/auth/logout')
            }
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            clearAuth()
        }
    }

    async function checkAuth() {
        if (!token.value) return false

        try {
            if (process.env.NODE_ENV === 'development') {
                return true
            }

            const axios = useAxios()
            const {data} = await axios.get('/api/auth/me')
            setUser(data.user)
            return true
        } catch (error) {
            clearAuth()
            return false
        }
    }

    function setUser(userData: User) {
        user.value = userData
    }

    function setToken(tokenValue: string) {
        token.value = tokenValue
    }

    function clearAuth() {
        user.value = null
        token.value = null
    }

    return {
        user,
        token,
        loading,
        isAuthenticated,
        userRole,
        isAdmin,
        isLecturer,
        isStudent,
        login,
        register,
        logout,
        checkAuth,
        setUser,
        setToken,
        clearAuth
    }
}, {
    persist: {
        key: 'auth',
        storage: piniaPluginPersistedstate.localStorage(),
        pick: ['user', 'token'],
    }
})