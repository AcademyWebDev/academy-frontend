export interface Student {
    id: number
    name: string
    email: string
}

export interface GradeItem {
    id: number
    name: string
    maxScore: number
    weight: number
}

export interface StudentGrade {
    studentId: number
    gradeItemId: number
    score: number | null
}

export interface Lecturer {
    id: number
    name: string
}

export interface Course {
    id: number
    code: string
    title: string
    lecturer: Lecturer
    capacity: number
    enrolled: number
    status: 'active' | 'upcoming' | 'completed'
    description?: string
    thumbnail?: string
    rating?: number
    students: Student[]
    gradeItems: GradeItem[]
}

export interface CourseWithGrades extends Course {
    grades: StudentGrade[]
}