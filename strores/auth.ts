import { defineStore } from 'pinia'
import { z } from 'zod'
import { useAxios } from '~/composables/useAxios'

const userSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['student', 'lecturer', 'admin']),
    avatar: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

interface AuthState {
    user: User | null
    token: string | null
    loading: boolean
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: null,
        loading: false,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
        userRole: (state) => state.user?.role,
        isAdmin: (state) => state.user?.role === 'admin',
        isLecturer: (state) => state.user?.role === 'lecturer',
        isStudent: (state) => state.user?.role === 'student',
    },

    actions: {
        async login(email: string, password: string) {
            this.loading = true;
            try {
                if (process.env.NODE_ENV === 'development') {
                    // Mock login for development
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    const mockUser = {
                        id: 1,
                        email,
                        name: 'John Doe',
                        role: 'student',
                        avatar: '/default-avatar.png'
                    }
                    this.setUser(mockUser)
                    this.setToken('mock-token')
                    return
                }

                const axios = useAxios()
                const { data } = await axios.post('/api/auth/login', {
                    email,
                    password
                })

                this.setUser(data.user)
                this.setToken(data.token)
            } catch (error) {
                console.error('Login error:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async logout() {
            try {
                if (process.env.NODE_ENV !== 'development') {
                    const axios = useAxios()
                    await axios.post('/api/auth/logout')
                }
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                this.clearAuth()
            }
        },

        async checkAuth() {
            if (!this.token) return false

            try {
                if (process.env.NODE_ENV === 'development') {
                    return true
                }

                const axios = useAxios()
                const { data } = await axios.get('/api/auth/me')
                this.setUser(data.user)
                return true
            } catch (error) {
                this.clearAuth()
                return false
            }
        },

        setUser(user: User) {
            this.user = user
        },

        setToken(token: string) {
            this.token = token
            // Store token in localStorage for persistence
            localStorage.setItem('auth_token', token)
        },

        clearAuth() {
            this.user = null
            this.token = null
            localStorage.removeItem('auth_token')
        },

        initAuth() {
            const token = localStorage.getItem('auth_token')
            if (token) {
                this.token = token
                this.checkAuth()
            }
        }
    },
})