import axios from 'axios'
import type {AxiosInstance, AxiosError} from 'axios'
import {useAuthStore} from "~/strores/auth";

export const useAxios = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    const axiosInstance: AxiosInstance = axios.create({
        baseURL: config.public.apiBase,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    axiosInstance.interceptors.request.use(
        (config: any) => {
            const token = authStore.token
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error: any) => {
            return Promise.reject(error)
        }
    )

    axiosInstance.interceptors.response.use(
        (response: any) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                authStore.logout()
                navigateTo('/login')
            }

            const errorMessage = error.response?.data || 'An error occurred'
            console.log(errorMessage)

            return Promise.reject(error)
        }
    )

    return axiosInstance
}

export const useMockApi = () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    return {
        async get<T>(url: string): Promise<T> {
            await delay(500)
            switch (url) {
                case '/api/courses':
                    return mockCourses as T
                case '/api/grades':
                    return mockGrades as T
                default:
                    throw new Error('Mock not implemented')
            }
        },
    }
}

const mockCourses = [
    {
        id: 1,
        title: 'Introduction to Programming',
        capacity: 30,
        enrolled: 25,
        lecturer: 'Dr. Smith',
        schedule: 'Mon, Wed 10:00 AM',
    },
]

const mockGrades = [
    {
        courseId: 1,
        courseName: 'Introduction to Programming',
        grade: 85,
        status: 'Published',
    },
]