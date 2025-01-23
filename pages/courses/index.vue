<script setup lang="ts">
import {ref, computed} from 'vue'
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'
import {useCourseStore} from '~/strores/courses'
import {useAuthStore} from '~/strores/auth'
import BaseButton from "~/components/common/BaseButton.vue";
import BaseDropdown from "~/components/common/BaseDropdown.vue";
import BaseInput from "~/components/common/BaseInput.vue";
import CreateCourseModal from "~/components/course/CreateCourseModal.vue";
import UpdateCourseModal from "~/components/course/UpdateCourseModal.vue";
import type {Course} from "~/types/grades";

const courseStore = useCourseStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const filters = ref({
  status: 'all',
  sortBy: 'date'
})

const isAdmin = computed(() => authStore.isAdmin)
const loading = computed(() => courseStore.loading)
const error = computed(() => courseStore.error)

const filteredCourses = computed(() => {
  let courses = courseStore.courses

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    courses = courses.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.lecturer.name.toLowerCase().includes(query)
    )
  }

  switch (filters.value.status) {
    case 'available':
      courses = courses.filter(course => course.enrolled < course.capacity)
      break
    case 'enrolled':
      // Implement based on user's enrolled courses
      break
    case 'completed':
      courses = courses.filter(course => course.status === 'completed')
      break
  }

  switch (filters.value.sortBy) {
    case 'name':
      courses.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'rating':
      courses.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
  }

  return courses
})

const totalPages = computed(() => Math.ceil(filteredCourses.value.length / 12))

const fetchCourses = async () => {
  try {
    await courseStore.fetchCourses()
  } catch (err) {
    console.error('Error fetching courses:', err)
  }
}

const enrollInCourse = async (courseId: number) => {
  try {
    await courseStore.enrollInCourse(courseId)
    // Show success message
  } catch (err) {
    console.error('Error enrolling in course:', err)
  }
}

// Fetch courses on mount
onMounted(() => {
  fetchCourses()
})

const showCreateModal = ref(false)

const handleCreateCourse = async (courseData: Course) => {
  try {
    await courseStore.createCourse(courseData)
  } catch (error) {
    console.error('Failed to create course:', error)
  }
}

const showUpdateModal = ref(false)

const isLecturer = computed(() => authStore.isLecturer)

const isEnrolled = (courseId: number) => {
  return false
}

const hasRated = (courseId: number) => {
  return false
}

const displayUpdateModal = (course: Course) => {
  courseStore.setSelectedCourse(course)
  showUpdateModal.value = true
}

const handleManageCourse = (course: Course) => {
  // Navigate to course management page
  navigateTo(`/courses/${course.id}/manage`)
}

const handleEnrollCourse = async (course: Course) => {
  try {
    console.log('Enrolling in course:', course.id)
    // Refresh courses after enrollment
  } catch (error) {
    console.error('Failed to enroll:', error)
  }
}

const handleViewCourse = (course: Course) => {
  // Navigate to course view page
  navigateTo(`/courses/${course.id}`)
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
  courseStore.clearSelectedCourse()
}

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})
</script>

<template>
  <div class="courses-page">
    <header class="courses-page__header">
      <div>
        <h1 class="courses-page__title">Courses</h1>
        <p class="courses-page__subtitle">
          {{ isLecturer ? 'Manage your courses and students' : 'Browse and enroll in available courses' }}
        </p>
      </div>

      <div class="courses-page__actions">
        <BaseButton
            v-if="isAdmin"
            variant="primary"
            :leftIcon="PlusIcon"
            @click="showCreateModal = true"
        >
          Create Course
        </BaseButton>

        <BaseDropdown position="right">
          <template #trigger>
            <BaseButton variant="outline" :leftIcon="FunnelIcon">
              Filters
            </BaseButton>
          </template>
          <template #content>
            <div class="filters-dropdown">
              <div class="filters-dropdown__section">
                <label class="filters-dropdown__label">
                  Status
                </label>
                <select
                    v-model="filters.status"
                    class="filters-dropdown__select"
                >
                  <option value="all">All Courses</option>
                  <option value="available">Available</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div class="filters-dropdown__section">
                <label class="filters-dropdown__label">
                  Sort By
                </label>
                <select
                    v-model="filters.sortBy"
                    class="filters-dropdown__select"
                >
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </template>
        </BaseDropdown>

        <div class="courses-page__search">
          <BaseInput
              v-model="searchQuery"
              type="search"
              placeholder="Search courses..."
              :leftIcon="MagnifyingGlassIcon"
          />
        </div>
      </div>
    </header>

    <div class="courses-page__content">
      <div v-if="loading" class="courses-page__loading">
        <div v-for="n in 6" :key="n" class="courses-page__skeleton"/>
      </div>

      <div v-else-if="error" class="courses-page__error">
        <ExclamationCircleIcon class="h-12 w-12 text-error-500"/>
        <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
          Failed to load courses
        </p>
        <p class="text-gray-500 dark:text-gray-400">
          {{ error }}
        </p>
        <BaseButton @click="fetchCourses">
          Try Again
        </BaseButton>
      </div>

      <div
          v-else-if="!filteredCourses.length"
          class="courses-page__empty"
      >
        <AcademicCapIcon class="h-12 w-12 text-gray-400"/>
        <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
          No courses found
        </p>
        <p class="text-gray-500 dark:text-gray-400">
          {{
            searchQuery
                ? 'Try adjusting your search or filters'
                : 'Check back later for new courses'
          }}
        </p>
      </div>

      <div v-else class="courses-page__grid">
        <CourseCard
            v-for="course in courseStore.courses"
            :key="course.id"
            :course="course"
            :is-enrolled="isEnrolled(course.id)"
            :has-rated="hasRated(course.id)"
            @update="displayUpdateModal"
            @manage="handleManageCourse"
            @enroll="handleEnrollCourse"
            @view="handleViewCourse"
        />
      </div>

      <!--      <div v-if="totalPages > 1" class="courses-page__pagination">-->
      <!--      </div>-->
      <CreateCourseModal
          :show="showCreateModal"
          @close="showCreateModal = false"
          @create="handleCreateCourse"
      />

      <UpdateCourseModal
          v-show="showUpdateModal"
          :show="showUpdateModal"
          @close="closeUpdateModal"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.courses-page {
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
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  &__loading {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  &__skeleton {
    @apply h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse;
  }

  &__error,
  &__empty {
    @apply flex flex-col items-center justify-center text-center py-12 px-4;
  }

  &__pagination {
    @apply mt-6 flex justify-center;
  }

  .filters-dropdown {
    @apply p-4 space-y-4
    bg-white dark:bg-gray-800
    divide-y divide-gray-200 dark:divide-gray-700;

    &__section {
      @apply first:pt-0 pt-4;
    }

    &__label {
      @apply block text-sm font-medium
      text-gray-700 dark:text-gray-300
      mb-1;
    }

    &__select {
      @apply block w-full rounded-md
      border-gray-300 dark:border-gray-600
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-gray-100
      shadow-sm
      transition-colors duration-200;

      @apply hover:border-gray-400 dark:hover:border-gray-500;

      @apply focus:border-primary-500 dark:focus:border-primary-400
      focus:ring-primary-500 dark:focus:ring-primary-400;

      option {
        @apply text-gray-900 dark:text-gray-100
        bg-white dark:bg-gray-900;
      }

      &:disabled {
        @apply bg-gray-50 dark:bg-gray-800
        border-gray-200 dark:border-gray-700
        text-gray-500 dark:text-gray-400
        cursor-not-allowed;
      }
    }
  }
}
</style>