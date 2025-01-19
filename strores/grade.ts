import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import type {Course, StudentGrade, CourseWithGrades} from '~/types/grades'

export const useGradesStore = defineStore('grades', () => {
    // State
    const courses = ref<CourseWithGrades[]>([
        {
            id: 1,
            code: 'CS101',
            name: 'Introduction to Programming',
            lecturer: 'Dr. Smith',
            students: [
                {id: 1, name: 'John Doe', email: 'john@example.com'},
                {id: 2, name: 'Jane Smith', email: 'jane@example.com'},
            ],
            gradeItems: [
                {id: 1, name: 'Quiz 1', maxScore: 20, weight: 20},
                {id: 2, name: 'Midterm', maxScore: 100, weight: 30},
                {id: 3, name: 'Final', maxScore: 100, weight: 50},
            ],
            grades: [
                {studentId: 1, gradeItemId: 1, score: 18},
                {studentId: 1, gradeItemId: 2, score: 85},
                {studentId: 2, gradeItemId: 1, score: 15},
            ]
        }
    ])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const coursesByLecturer = computed(() => (lecturerId: number) => {
        // In a real app, filter by lecturer ID
        return courses.value
    })

    const coursesByStudent = computed(() => (studentId: number) => {
        return courses.value.filter(course =>
            course.students.some(student => student.id === studentId)
        )
    })

    // Helper function to calculate weighted average
    const calculateFinalGrade = (grades: StudentGrade[], course: Course) => {
        let totalWeight = 0
        let weightedSum = 0

        course.gradeItems.forEach(item => {
            const grade = grades.find(g => g.gradeItemId === item.id)
            if (grade?.score !== null && grade?.score !== undefined) {
                const percentage = (grade.score / item.maxScore) * 100
                weightedSum += percentage * item.weight
                totalWeight += item.weight
            }
        })

        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null
    }

    // Get student grades for a course
    const getStudentGrades = (courseId: number, studentId: number) => {
        const course = courses.value.find(c => c.id === courseId)
        if (!course) return null

        const grades = course.grades.filter(g => g.studentId === studentId)
        const gradeDetails = course.gradeItems.map(item => {
            const grade = grades.find(g => g.gradeItemId === item.id)
            return {
                ...item,
                score: grade?.score ?? null,
                percentage: grade?.score !== null ?
                    Math.round((grade.score / item.maxScore) * 100) : null
            }
        })

        return {
            courseInfo: {
                id: course.id,
                code: course.code,
                name: course.name,
                lecturer: course.lecturer
            },
            grades: gradeDetails,
            finalGrade: calculateFinalGrade(grades, course)
        }
    }

    // Actions
    async function updateGrade(
        courseId: number,
        studentId: number,
        gradeItemId: number,
        score: number | null
    ) {
        const course = courses.value.find(c => c.id === courseId)
        if (!course) return

        const gradeIndex = course.grades.findIndex(
            g => g.studentId === studentId && g.gradeItemId === gradeItemId
        )

        if (gradeIndex !== -1) {
            course.grades[gradeIndex].score = score
        } else {
            course.grades.push({studentId, gradeItemId, score})
        }

        // In a real app, you would make an API call here
    }

    return {
        courses,
        loading,
        error,
        coursesByLecturer,
        coursesByStudent,
        getStudentGrades,
        updateGrade,
        calculateFinalGrade
    }
})