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
        code: "CS101",
        title: "Introduction to Computer Science",
        lecturer: {
            id: 1,
            name: "Dr. Alan Smith"
        },
        capacity: 150,
        enrolled: 142,
        status: "active",
        description: "A comprehensive introduction to computer science fundamentals, covering algorithms, data structures, and programming basics.",
        thumbnail: "/api/placeholder/800/600",
        rating: 4.5,
        students: [
            {
                id: 1,
                name: "John Doe",
                email: "john.doe@university.edu"
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane.smith@university.edu"
            }
        ],
        gradeItems: [
            {
                id: 1,
                name: "Midterm Exam",
                maxScore: 100,
                weight: 0.3
            },
            {
                id: 2,
                name: "Final Project",
                maxScore: 100,
                weight: 0.4
            },
            {
                id: 3,
                name: "Assignments",
                maxScore: 100,
                weight: 0.3
            }
        ]
    },
    {
        id: 2,
        code: "MATH201",
        title: "Linear Algebra",
        lecturer: {
            id: 2,
            name: "Prof. Sarah Johnson"
        },
        capacity: 100,
        enrolled: 87,
        status: "active",
        description: "Study of linear equations, matrices, vector spaces, and linear transformations.",
        thumbnail: "/api/placeholder/800/600",
        rating: 4.2,
        students: [
            {
                id: 3,
                name: "Michael Brown",
                email: "michael.b@university.edu"
            },
            {
                id: 4,
                name: "Emily Wilson",
                email: "e.wilson@university.edu"
            }
        ],
        gradeItems: [
            {
                id: 4,
                name: "Quiz 1",
                maxScore: 50,
                weight: 0.15
            },
            {
                id: 5,
                name: "Quiz 2",
                maxScore: 50,
                weight: 0.15
            },
            {
                id: 6,
                name: "Midterm",
                maxScore: 100,
                weight: 0.3
            },
            {
                id: 7,
                name: "Final Exam",
                maxScore: 100,
                weight: 0.4
            }
        ]
    },
    {
        id: 3,
        code: "BIO303",
        title: "Molecular Biology",
        lecturer: {
            id: 3,
            name: "Dr. Maria Garcia"
        },
        capacity: 75,
        enrolled: 75,
        status: "upcoming",
        description: "Advanced study of cellular processes and molecular genetics.",
        thumbnail: "/api/placeholder/800/600",
        students: [],
        gradeItems: [
            {
                id: 8,
                name: "Lab Reports",
                maxScore: 100,
                weight: 0.4
            },
            {
                id: 9,
                name: "Research Paper",
                maxScore: 100,
                weight: 0.3
            },
            {
                id: 10,
                name: "Final Exam",
                maxScore: 100,
                weight: 0.3
            }
        ]
    },
    {
        id: 4,
        code: "HIST105",
        title: "World History",
        lecturer: {
            id: 4,
            name: "Prof. James Anderson"
        },
        capacity: 200,
        enrolled: 189,
        status: "completed",
        description: "Survey of major historical events and developments across civilizations.",
        thumbnail: "/api/placeholder/800/600",
        rating: 4.8,
        students: [
            {
                id: 5,
                name: "David Lee",
                email: "d.lee@university.edu"
            },
            {
                id: 6,
                name: "Sarah Chen",
                email: "s.chen@university.edu"
            },
            {
                id: 7,
                name: "Robert Taylor",
                email: "r.taylor@university.edu"
            }
        ],
        gradeItems: [
            {
                id: 11,
                name: "Essay 1",
                maxScore: 100,
                weight: 0.25
            },
            {
                id: 12,
                name: "Essay 2",
                maxScore: 100,
                weight: 0.25
            },
            {
                id: 13,
                name: "Participation",
                maxScore: 100,
                weight: 0.2
            },
            {
                id: 14,
                name: "Final Paper",
                maxScore: 100,
                weight: 0.3
            }
        ]
    }
];

const mockGrades = [
    {
        courseId: 1,
        courseName: 'Introduction to Programming',
        grade: 85,
        status: 'Published',
    },
]