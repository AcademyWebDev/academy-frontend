// stores/course.ts
import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {z} from 'zod'
import {useAxios, useMockApi} from '~/composables/useAxios'
import type {Course} from "~/types/grades";

const config = useRuntimeConfig()

const courseSchema = z.object({
    id: z.number(),
    title: z.string().min(3),
    description: z.string().optional(),
    capacity: z.number().min(1),
    enrolled: z.number(),
    lecturer: z.string(),
    status: z.enum(['active', 'upcoming', 'completed']).default('active'),
    rating: z.number().min(0).max(5).optional(),
    thumbnail: z.string().optional(),
})

export const useCourseStore = defineStore('courses', () => {
    const courses = ref<Course[]>([])
    const selectedCourse = ref<Course | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const availableCourses = computed(() =>
        courses.value.filter(course => course.enrolled < course.capacity)
    )

    const courseById = computed(() => (id: number) =>
        courses.value.find(course => course.id === id)
    )

    const hasAvailableSpots = computed(() => (id: number) => {
        const course = courses.value.find(c => c.id === id)
        return course ? course.enrolled < course.capacity : false
    })

    const activeCourses = computed(() =>
        courses.value.filter(course => course.status === 'active')
    )

    const upcomingCourses = computed(() =>
        courses.value.filter(course => course.status === 'upcoming')
    )

    async function fetchCourses() {
        loading.value = true
        error.value = null

        try {
            if (config.public.isDev) {
                const mockApi = useMockApi()
                courses.value = await mockApi.get<Course[]>('/api/courses')
                return
            }

            const axios = useAxios()
            const {data} = await axios.get<Course[]>('/api/courses')
            courses.value = data
        } catch (err) {
            error.value = 'Failed to fetch courses'
            console.error('Error fetching courses:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    async function enrollInCourse(courseId: number) {
        if (!hasAvailableSpots.value(courseId)) {
            throw new Error('Course is full')
        }

        try {
            if (config.public.isDev) {
                const course = courses.value.find(c => c.id === courseId)
                if (course) {
                    course.enrolled++
                }
                return
            }

            const axios = useAxios()
            await axios.post(`/api/courses/${courseId}/enroll`)
            await fetchCourses() // Refresh courses after enrollment
        } catch (err) {
            error.value = 'Failed to enroll in course'
            console.error('Error enrolling in course:', err)
            throw err
        }
    }

    async function createCourse(courseData: Omit<Course, 'id'>) {
        loading.value = true
        error.value = null

        try {
            if (config.public.isDev) {
                const mockCourse = {
                    id: courses.value.length + 1,
                    ...courseData,
                    enrolled: 0,
                }
                courses.value.push(mockCourse)
                return mockCourse
            }

            const axios = useAxios()
            const {data} = await axios.post<Course>('/api/courses', courseData)
            await fetchCourses()
            return data
        } catch (err) {
            error.value = 'Failed to create course'
            console.error('Error creating course:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateCourse(courseId: number, updates: Partial<Course>) {
        loading.value = true
        error.value = null

        try {
            if (config.public.isDev) {
                const index = courses.value.findIndex(c => c.id === courseId)
                if (index !== -1) {
                    courses.value[index] = {...courses.value[index], ...updates}
                    return courses.value[index]
                }
                throw new Error('Course not found')
            }

            const axios = useAxios()
            const {data} = await axios.put<Course>(`/api/courses/${courseId}`, updates)
            await fetchCourses()
            return data
        } catch (err) {
            error.value = 'Failed to update course'
            console.error('Error updating course:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    function setSelectedCourse(course: Course | null) {
        selectedCourse.value = course
    }

    function clearSelectedCourse() {
        selectedCourse.value = null
    }

    return {
        courses,
        selectedCourse,
        loading,
        error,

        availableCourses,
        courseById,
        hasAvailableSpots,
        activeCourses,
        upcomingCourses,

        fetchCourses,
        enrollInCourse,
        createCourse,
        updateCourse,
        setSelectedCourse,
        clearSelectedCourse
    }
})