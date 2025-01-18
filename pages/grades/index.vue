<script setup lang="ts">
import {ref, computed} from 'vue'
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import {useAuthStore} from '~/strores/auth'
import {useGradesStore} from '~/strores/grade'
import {CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle} from "@coreui/vue/dist/esm/components/modal";
import BaseButton from "~/components/common/BaseButton.vue";
import EditGradePopup from "~/components/grade/EditGradePopup.vue";
import BaseDropdown from "~/components/common/BaseDropdown.vue";

const authStore = useAuthStore()
const gradesStore = useGradesStore()

const filters = ref({
  courseId: 'all',
  status: 'all'
})
const selectedGrade = ref(null)
const showEditModal = ref(false)
const publishingGrade = ref<number | null>(null)

const courses = ref([
  {id: 1, title: 'Web Development'},
  {id: 2, title: 'Mobile Development'}
])

const gradeTypes = ['quiz', 'assignment', 'midterm', 'final', 'project']

const isLecturer = computed(() => authStore.isLecturer || authStore.isAdmin)

const filteredGrades = computed(() => {
  let filtered = gradesStore.grades

  if (filters.value.courseId !== 'all') {
    filtered = filtered.filter(grade => grade.courseId === Number(filters.value.courseId))
  }

  if (filters.value.status !== 'all') {
    filtered = filtered.filter(grade => grade.status === filters.value.status)
  }

  return filtered
})

const formatGradeType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const getTypeAverage = (items: any[], type: string) => {
  const typeItems = items.filter(item => item.type === type)
  if (!typeItems.length) return 'N/A'

  const average = typeItems.reduce((acc, item) => {
    return acc + (item.score / item.maxScore) * 100
  }, 0) / typeItems.length

  return Math.round(average)
}

const calculatePercentage = (score: number, maxScore: number) => {
  return Math.round((score / maxScore) * 100)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const showGradeDetails = (grade: any) => {
  selectedGrade.value = grade
}

const showEditGradeModal = (grade: any) => {
  selectedGrade.value = grade
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedGrade.value = null
}

const handleGradeSave = async () => {
  await gradesStore.fetchGrades()
  closeEditModal()
}

const publishGrade = async (gradeId: number) => {
  publishingGrade.value = gradeId
  try {
    await gradesStore.publishGrades(gradeId)
  } finally {
    publishingGrade.value = null
  }
}

const exportGrades = () => {
  // Implement grade export functionality
  console.log('Exporting grades...')
}

// Fetch grades on mount
onMounted(() => {
  gradesStore.fetchGrades()
})

definePageMeta({
  middleware: ['auth']
})
</script>


<template>
  <div class="grades-page">
    <!-- Header -->
    <header class="grades-page__header">
      <div>
        <h1 class="grades-page__title">Grades</h1>
        <p class="grades-page__subtitle">
          {{ isLecturer ? 'Manage and publish course grades' : 'View your course grades and progress' }}
        </p>
      </div>

      <div class="grades-page__actions">
        <!-- Filters -->
        <BaseDropdown position="right">
          <template #trigger>
            <BaseButton variant="outline" :leftIcon="FunnelIcon">
              Filters
            </BaseButton>
          </template>
          <template #content>
            <div class="filters-dropdown">
              <div class="filters-dropdown__section">
                <label class="filters-dropdown__label">Course</label>
                <select v-model="filters.courseId" class="filters-dropdown__select">
                  <option value="all">All Courses</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.title }}
                  </option>
                </select>
              </div>

              <div class="filters-dropdown__section">
                <label class="filters-dropdown__label">Status</label>
                <select v-model="filters.status" class="filters-dropdown__select">
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </template>
        </BaseDropdown>

        <!-- Export Button (Lecturer Only) -->
        <BaseButton
            v-if="isLecturer"
            variant="outline"
            :leftIcon="ArrowDownTrayIcon"
            @click="exportGrades"
        >
          Export
        </BaseButton>
      </div>
    </header>

    <!-- Main Content -->
    <div class="grades-page__content">
      <!-- Loading State -->
      <div v-if="gradesStore.loading" class="grades-page__loading">
        <div v-for="n in 3" :key="n" class="grades-page__skeleton"/>
      </div>

      <!-- Error State -->
      <div v-else-if="gradesStore.error" class="grades-page__error">
        <ExclamationCircleIcon class="h-12 w-12 text-error-500"/>
        <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ gradesStore.error }}
        </p>
        <BaseButton @click="gradesStore.fetchGrades">
          Try Again
        </BaseButton>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredGrades.length" class="grades-page__empty">
        <DocumentTextIcon class="h-12 w-12 text-gray-400 dark:text-gray-500"/>
        <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
          No grades found
        </p>
        <p class="text-gray-500 dark:text-gray-400">
          {{ isLecturer ? 'Start adding grades for your courses' : 'No grades available yet' }}
        </p>
      </div>

      <!-- Grades Grid -->
      <div v-else class="grades-page__grid">
        <div
            v-for="grade in filteredGrades"
            :key="grade.courseId"
            class="grades-page__card"
        >
          <!-- Card Header -->
          <div class="grades-page__card-header">
            <div>
              <h3 class="grades-page__card-title">
                {{ grade.courseName }}
              </h3>
              <p class="grades-page__card-subtitle">
                {{ grade.lecturer }}
              </p>
            </div>
            <span
                :class="[
                'grades-page__status',
                `grades-page__status--${grade.status}`
              ]"
            >
              {{ grade.status === 'published' ? 'Published' : 'Draft' }}
            </span>
          </div>

          <!-- Card Content -->
          <div class="grades-page__card-content">
            <!-- Grade Items Summary -->
            <div class="grades-page__items-summary">
              <div v-for="type in gradeTypes" :key="type" class="grades-page__item">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatGradeType(type) }}
                </span>
                <span class="font-medium">
                  {{ getTypeAverage(grade.items, type) }}%
                </span>
              </div>
            </div>

            <!-- Final Grade -->
            <div class="grades-page__final-grade">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Final Grade
              </div>
              <div class="text-2xl font-bold">
                {{ grade.finalGrade ?? 'N/A' }}%
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="grades-page__progress">
              <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    class="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300"
                    :style="{ width: `${grade.finalGrade ?? 0}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="grades-page__card-actions">
            <template v-if="isLecturer">
              <BaseButton
                  variant="outline"
                  block
                  @click="showEditGradeModal(grade)"
              >
                Manage Grades
              </BaseButton>
              <BaseButton
                  v-if="grade.status === 'draft'"
                  variant="primary"
                  block
                  :loading="publishingGrade === grade.id"
                  @click="publishGrade(grade.id)"
              >
                Publish Grades
              </BaseButton>
            </template>
            <BaseButton
                v-else
                variant="outline"
                block
                @click="showGradeDetails(grade)"
            >
              View Details
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <CModal
        v-if="selectedGrade"
        :visible="!!selectedGrade"
        @close="selectedGrade = null"
        size="lg"
    >
      <CModalHeader>
        <CModalTitle>Grade Details</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <!-- Grade details content -->
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ selectedGrade.courseName }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedGrade.lecturer }}
            </p>
          </div>

          <!-- Grade Items Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="grades-page__th">Type</th>
                <th class="grades-page__th">Score</th>
                <th class="grades-page__th">Weight</th>
                <th class="grades-page__th">Date</th>
                <th class="grades-page__th">Comments</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                  v-for="item in selectedGrade?.items"
                  :key="item.id"
                  class="grades-page__tr"
              >
                <td class="grades-page__td">
                  {{ formatGradeType(item.type) }}
                </td>
                <td class="grades-page__td">
                  {{ item.score }}/{{ item.maxScore }}
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                      ({{ calculatePercentage(item.score, item.maxScore) }}%)
                    </span>
                </td>
                <td class="grades-page__td">
                  {{ item.weight }}%
                </td>
                <td class="grades-page__td">
                  {{ formatDate(item.date) }}
                </td>
                <td class="grades-page__td">
                  {{ item.comment || '-' }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Final Grade Summary -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Final Grade
              </span>
              <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ selectedGrade.finalGrade }}%
              </span>
            </div>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <BaseButton @click="selectedGrade = null">
          Close
        </BaseButton>
      </CModalFooter>
    </CModal>

    <EditGradePopup
        :show="showEditModal"
        :grade="selectedGrade"
        @close="closeEditModal"
        @save="handleGradeSave"
    />
  </div>
</template>

<style lang="scss" scoped>
.grades-page {
  @apply space-y-6;

  &__header {
    @apply flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4;
  }

  &__title {
    @apply text-2xl font-bold text-gray-900 dark:text-gray-100;
  }

  &__subtitle {
    @apply text-sm text-gray-500 dark:text-gray-400;
  }

  &__actions {
    @apply flex flex-wrap items-center gap-3;
  }

  &__content {
    @apply mt-6;
  }

  &__grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  &__card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm
    border border-gray-200 dark:border-gray-700
    overflow-hidden;
  }

  &__card-header {
    @apply px-4 py-3 flex justify-between items-start
    border-b border-gray-200 dark:border-gray-700;
  }

  &__card-title {
    @apply text-lg font-medium text-gray-900 dark:text-gray-100;
  }

  &__card-subtitle {
    @apply text-sm text-gray-500 dark:text-gray-400;
  }

  &__status {
    @apply px-2.5 py-0.5 rounded-full text-xs font-medium;

    &--published {
      @apply bg-green-100 dark:bg-green-900/30
      text-green-800 dark:text-green-400;
    }

    &--draft {
      @apply bg-gray-100 dark:bg-gray-900/30
      text-gray-800 dark:text-gray-400;
    }
  }

  &__card-content {
    @apply p-4 space-y-4;
  }

  &__items-summary {
    @apply grid grid-cols-3 gap-4;
  }

  &__item {
    @apply flex flex-col items-center text-center gap-1;
  }

  &__final-grade {
    @apply flex flex-col items-center py-4
    border-t border-b border-gray-200 dark:border-gray-700;
  }

  &__progress {
    @apply w-full;
  }

  &__card-actions {
    @apply p-4 space-y-2;
  }

  &__loading {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  &__skeleton {
    @apply h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse;
  }

  &__empty,
  &__error {
    @apply flex flex-col items-center justify-center text-center py-12 gap-4;
  }

  &__th {
    @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400
    uppercase tracking-wider;
  }

  &__tr {
    @apply bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700;
  }

  &__td {
    @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100;
  }
}

.filters-dropdown {
  @apply p-4 space-y-4 w-64;

  &__section {
    @apply space-y-1;
  }

  &__label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
  }

  &__select {
    @apply block w-full rounded-md
    border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-900
    text-gray-900 dark:text-gray-100
    shadow-sm transition-colors duration-200;

    @apply focus:border-primary-500 dark:focus:border-primary-400
    focus:ring-primary-500 dark:focus:ring-primary-400;
  }
}

</style>