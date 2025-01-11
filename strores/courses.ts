import {defineStore} from 'pinia'
import {z} from 'zod'
import {useAxios, useMockApi} from '~/composables/useAxios'

const courseSchema = z.object({
    id: z.number(),
    title: z.string().min(3),
    capacity: z.number().min(1),
    enrolled: z.number(),
    lecturer: z.string(),
    schedule: z.string(),
    description: z.string().optional(),
})

export type Course = z.infer<typeof courseSchema>

interface CourseState {
    courses: Course[]
    loading: boolean
    selectedCourse: Course | null
}

export const useCourseStore = defineStore('courses', {
    state: (): CourseState => ({
        courses: [],
        loading: false,
        selectedCourse: null,
    }),

    getters: {
        availableCourses: (state) =>
            state.courses.filter(course => course.enrolled < course.capacity),

        courseById: (state) => (id: number) =>
            state.courses.find(course => course.id === id),

        hasAvailableSpots: (state) => (id: number) => {
            const course = state.courses.find(c => c.id === id)
            return course ? course.enrolled < course.capacity : false
        },
    },

    actions: {
        async fetchCourses() {
            this.loading = true
            try {
                // Use mock API in development
                if (process.env.NODE_ENV === 'development') {
                    const mockApi = useMockApi()
                    this.courses = await mockApi.get<Course[]>('/api/courses')
                    return
                }

                // Use real API in production
                const axios = useAxios()
                const {data} = await axios.get<Course[]>('/api/courses')
                this.courses = data
            } catch (error) {
                console.error('Error fetching courses:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async enrollInCourse(courseId: number) {
            try {
                if (!this.hasAvailableSpots(courseId)) {
                    throw new Error('Course is full')
                }

                if (process.env.NODE_ENV === 'development') {
                    // Mock enrollment
                    const course = this.courses.find(c => c.id === courseId)
                    if (course) {
                        course.enrolled++
                    }
                    return
                }

                const axios = useAxios()
                await axios.post(`/api/courses/${courseId}/enroll`)
                await this.fetchCourses() // Refresh courses after enrollment
            } catch (error) {
                console.error('Error enrolling in course:', error)
                throw error
            }
        },

        setSelectedCourse(course: Course | null) {
            this.selectedCourse = course
        },
    },
})