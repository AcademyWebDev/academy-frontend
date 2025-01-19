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

export interface Course {
    id: number
    code: string
    name: string
    lecturer: string
    students: Student[]
    gradeItems: GradeItem[]
}

export interface CourseWithGrades extends Course {
    grades: StudentGrade[]
}