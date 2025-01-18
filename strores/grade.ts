import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {useAxios} from '~/composables/useAxios'

interface GradeItem {
    id: number
    courseId: number
    studentId: number
    type: 'quiz' | 'assignment' | 'midterm' | 'final' | 'project'
    score: number
    maxScore: number
    weight: number
    comment?: string
    date: string
}

interface CourseGrade {
    id: number
    courseId: number
    courseName: string
    lecturer: string
    student: {
        id: number
        name: string
    }
    items: GradeItem[]
    finalGrade?: number
    status: 'draft' | 'published'
    lastUpdated: string
}

export const useGradesStore = defineStore('grades', () => {
    // State
    const grades = ref<CourseGrade[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const publishedGrades = computed(() =>
        grades.value.filter(grade => grade.status === 'published')
    )

    const draftGrades = computed(() =>
        grades.value.filter(grade => grade.status === 'draft')
    )

    const getGradeByCourse = computed(() => (courseId: number) =>
        grades.value.find(grade => grade.courseId === courseId)
    )

    // Calculate final grade based on weighted items
    const calculateFinalGrade = (items: GradeItem[]) => {
        const totalWeightedScore = items.reduce((acc, item) => {
            const percentage = (item.score / item.maxScore) * 100
            return acc + (percentage * (item.weight / 100))
        }, 0)
        return Math.round(totalWeightedScore * 100) / 100
    }

    // Actions
    async function fetchGrades() {
        loading.value = true
        error.value = null

        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000))
                grades.value = [
                    {
                        id: 1,
                        courseId: 1,
                        courseName: 'Web Development',
                        lecturer: 'Dr. Smith',
                        student: {
                            id: 1,
                            name: 'John Doe'
                        },
                        items: [
                            {
                                id: 1,
                                courseId: 1,
                                studentId: 1,
                                type: 'assignment',
                                score: 85,
                                maxScore: 100,
                                weight: 30,
                                date: '2024-01-15'
                            },
                            {
                                id: 2,
                                courseId: 1,
                                studentId: 1,
                                type: 'midterm',
                                score: 78,
                                maxScore: 100,
                                weight: 30,
                                date: '2024-01-20'
                            }
                        ],
                        status: 'published',
                        lastUpdated: '2024-01-20'
                    }
                    // Add more mock data as needed
                ]
                return
            }

            const axios = useAxios()
            const {data} = await axios.get('/api/grades')
            grades.value = data
        } catch (err) {
            console.error('Error fetching grades:', err)
            error.value = 'Failed to load grades'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function addGradeItem(courseId: number, gradeData: Omit<GradeItem, 'id'>) {
        saving.value = true
        error.value = null

        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const grade = grades.value.find(g => g.courseId === courseId)
                if (grade) {
                    const newItem = {
                        id: Date.now(),
                        ...gradeData
                    }
                    grade.items.push(newItem)
                    grade.finalGrade = calculateFinalGrade(grade.items)
                    grade.lastUpdated = new Date().toISOString()
                }
                return
            }

            const axios = useAxios()
            const {data} = await axios.post(`/api/grades/${courseId}/items`, gradeData)
            await fetchGrades()
        } catch (err) {
            console.error('Error adding grade item:', err)
            error.value = 'Failed to add grade'
            throw err
        } finally {
            saving.value = false
        }
    }

    async function updateGradeItem(courseId: number, itemId: number, updates: Partial<GradeItem>) {
        saving.value = true
        error.value = null

        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const grade = grades.value.find(g => g.courseId === courseId)
                if (grade) {
                    const item = grade.items.find(i => i.id === itemId)
                    if (item) {
                        Object.assign(item, updates)
                        grade.finalGrade = calculateFinalGrade(grade.items)
                        grade.lastUpdated = new Date().toISOString()
                    }
                }
                return
            }

            const axios = useAxios()
            await axios.put(`/api/grades/${courseId}/items/${itemId}`, updates)
            await fetchGrades()
        } catch (err) {
            console.error('Error updating grade item:', err)
            error.value = 'Failed to update grade'
            throw err
        } finally {
            saving.value = false
        }
    }

    async function publishGrades(courseId: number) {
        saving.value = true
        error.value = null

        try {
            if (process.env.NODE_ENV === 'development') {
                await new Promise(resolve => setTimeout(resolve, 1000))
                const grade = grades.value.find(g => g.courseId === courseId)
                if (grade) {
                    grade.status = 'published'
                    grade.lastUpdated = new Date().toISOString()
                }
                return
            }

            const axios = useAxios()
            await axios.post(`/api/grades/${courseId}/publish`)
            await fetchGrades()
        } catch (err) {
            console.error('Error publishing grades:', err)
            error.value = 'Failed to publish grades'
            throw err
        } finally {
            saving.value = false
        }
    }

    return {
        // State
        grades,
        loading,
        saving,
        error,

        // Getters
        publishedGrades,
        draftGrades,
        getGradeByCourse,

        // Actions
        fetchGrades,
        addGradeItem,
        updateGradeItem,
        publishGrades,
        calculateFinalGrade
    }
})