<template>
  <div class="space-y-6">
    <!-- Course Selection -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Your Courses</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Select a course to manage grades
        </p>
      </div>
    </div>


    <div
        v-for="course in courses"
        :key="course.id"
        class="border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <div class="px-6 dark:bg-gray-700 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ course.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ course.code }} • {{ course.students.length }} Students
            </p>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-white dark:bg-gray-800">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
            <tr>
              <th class="bg-gray-50 dark:bg-gray-700 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Student
              </th>
              <th
                  v-for="item in course.gradeItems"
                  :key="item.id"
                  scope="col"
                  class="px-6 dark:bg-gray-700 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {{ item.name }}
                <div class="text-xs font-normal">
                  Max: {{ item.maxScore }} • Weight: {{ item.weight }}%
                </div>
              </th>
              <th scope="col"
                  class="px-6 dark:bg-gray-700 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Final Grade
              </th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="student in course.students"
                :key="student.id"
                class="dark:border-gray-700 dark:bg-gray-700 hover:bg-gray-50 transition-colors"
            >
              <!-- Student Info -->
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ student.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ student.email }}
                  </div>
                </div>
              </td>

              <!-- Grade Items -->
              <td
                  v-for="item in course.gradeItems"
                  :key="item.id"
                  class="px-6 py-4"
              >
                <input
                    type="number"
                    v-model="gradeInputs[`${course.id}-${student.id}-${item.id}`]"
                    :placeholder="`/${item.maxScore}`"
                    :max="item.maxScore"
                    min="0"
                    class="form-input w-20 text-center"
                    @change="updateGrade(course.id, student.id, item.id)"
                >
              </td>

              <!-- Final Grade -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium" :class="getGradeColor(getStudentFinalGrade(course, student.id))">
                  {{ getStudentFinalGrade(course, student.id) ?? '-' }}%
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useGradesStore} from '~/strores/grade'

const gradesStore = useGradesStore()
const courses = computed(() => gradesStore.coursesByLecturer(1)) // Replace with actual lecturer ID
const gradeInputs = ref<Record<string, number | null>>({})

// Initialize grade inputs
courses.value.forEach(course => {
  course.students.forEach(student => {
    course.gradeItems.forEach(item => {
      const grade = course.grades.find(
          g => g.studentId === student.id && g.gradeItemId === item.id
      )
      gradeInputs.value[`${course.id}-${student.id}-${item.id}`] = grade?.score ?? null
    })
  })
})

const updateGrade = async (courseId: number, studentId: number, gradeItemId: number) => {
  const key = `${courseId}-${studentId}-${gradeItemId}`
  const score = gradeInputs.value[key]
  await gradesStore.updateGrade(courseId, studentId, gradeItemId, score)
}

const getStudentFinalGrade = (course: any, studentId: number) => {
  const studentGrades = course.grades.filter(g => g.studentId === studentId)
  return gradesStore.calculateFinalGrade(studentGrades, course)
}

const getGradeColor = (grade: number | null) => {
  if (grade === null) return ''
  if (grade >= 90) return 'text-green-600 dark:text-green-400'
  if (grade >= 80) return 'text-primary-600 dark:text-primary-400'
  if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-error-600 dark:text-error-400'
}
</script>

<style scoped>
.form-input {
  @apply rounded-md border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-gray-100;

  @apply focus:ring-primary-500 dark:focus:ring-primary-400
  focus:border-primary-500 dark:focus:border-primary-400;
}
</style>