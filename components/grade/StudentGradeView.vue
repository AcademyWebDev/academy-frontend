<template>
  <div class="space-y-6">
    <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Your Grades</h2>

    <!-- Course List -->
    <div class="grid gap-6">
      <div
          v-for="course in courses"
          :key="course.id"
          class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden"
      >
        <!-- Course Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                {{ course.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ course.code }} • {{ course.lecturer }}
              </p>
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Final Grade</div>
              <div
                  class="text-2xl font-bold"
                  :class="getGradeColor(getStudentFinalGrade(course, studentId))"
              >
                {{ getStudentFinalGrade(course, studentId) ?? 'N/A' }}%
              </div>
            </div>
          </div>
        </div>

        # components/grades/StudentGradeView.vue (continued)
        <!-- Grades Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
            <tr class="bg-gray-50 dark:bg-gray-800">
              <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Assessment
              </th>
              <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Weight
              </th>
              <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Grade
              </th>
              <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Weighted
              </th>
            </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
                v-for="item in course.gradeItems"
                :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <!-- Assessment Name -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ item.name }}
                </div>
              </td>

              <!-- Weight -->
              <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                             bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
                    {{ item.weight }}%
                  </span>
              </td>

              <!-- Raw Score -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-gray-100">
                  {{ getStudentScore(course, item.id) ?? '-' }}/{{ item.maxScore }}
                </div>
              </td>

              <!-- Percentage -->
              <td class="px-6 py-4">
                <div
                    v-if="getStudentScore(course, item.id) !== null"
                    class="text-sm font-medium"
                    :class="getGradeColor(calculatePercentage(getStudentScore(course, item.id), item.maxScore))"
                >
                  {{ calculatePercentage(getStudentScore(course, item.id), item.maxScore) }}%
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                  Not graded
                </div>
              </td>

              <!-- Weighted Score -->
              <td class="px-6 py-4">
                <div
                    v-if="getStudentScore(course, item.id) !== null"
                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {{
                    calculateWeightedScore(
                        getStudentScore(course, item.id),
                        item.maxScore,
                        item.weight
                    )
                  }}%
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                  -
                </div>
              </td>
            </tr>

            <!-- Total Row -->
            <tr class="bg-gray-50 dark:bg-gray-700/50 font-medium">
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                Total
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {{ getTotalWeight(course) }}%
              </td>
              <td class="px-6 py-4">-</td>
              <td class="px-6 py-4">-</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ getStudentFinalGrade(course, studentId) ?? '-' }}%
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
import {computed} from 'vue'
import {useGradesStore} from '~/strores/grade'

const props = defineProps<{
  studentId: number
}>()

const gradesStore = useGradesStore()
const courses = computed(() => gradesStore.coursesByStudent(props.studentId))

// Utility functions
const getStudentScore = (course: any, gradeItemId: number) => {
  const grade = course.grades.find(
      g => g.studentId === props.studentId && g.gradeItemId === gradeItemId
  )
  return grade?.score ?? null
}

const calculatePercentage = (score: number | null, maxScore: number) => {
  if (score === null) return null
  return Math.round((score / maxScore) * 100)
}

const calculateWeightedScore = (score: number | null, maxScore: number, weight: number) => {
  const percentage = calculatePercentage(score, maxScore)
  if (percentage === null) return null
  return ((percentage * weight) / 100).toFixed(1)
}

const getStudentFinalGrade = (course: any, studentId: number) => {
  const studentGrades = course.grades.filter(g => g.studentId === studentId)
  return gradesStore.calculateFinalGrade(studentGrades, course)
}

const getTotalWeight = (course: any) => {
  return course.gradeItems.reduce((sum: number, item: any) => sum + item.weight, 0)
}

const getGradeColor = (grade: number | null) => {
  if (grade === null) return ''
  if (grade >= 90) return 'text-green-600 dark:text-green-400'
  if (grade >= 80) return 'text-primary-600 dark:text-primary-400'
  if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-error-600 dark:text-error-400'
}
</script>