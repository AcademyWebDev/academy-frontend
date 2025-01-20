# pages/dashboard/index.vue
<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <header class="dashboard__header">
      <div>
        <h1 class="dashboard__title">
          Welcome back, {{ authStore.user?.name }}
        </h1>
        <p class="dashboard__subtitle">
          {{
            isLecturer
                ? 'Here\'s what\'s happening with your courses'
                : 'Track your academic progress'
          }}
        </p>
      </div>
    </header>

    <!-- Quick Stats -->
    <div class="dashboard__stats">
      <div v-if="isLecturer" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Lecturer Stats -->
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__title">Active Courses</div>
            <div class="stat-card__value">{{ activeCourses.length }}</div>
          </div>
          <div class="stat-card__icon bg-primary-50 dark:bg-primary-900/20 text-primary-600">
            <AcademicCapIcon class="h-6 w-6"/>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__title">Total Students</div>
            <div class="stat-card__value">{{ totalStudents }}</div>
          </div>
          <div class="stat-card__icon bg-green-50 dark:bg-green-900/20 text-green-600">
            <UsersIcon class="h-6 w-6"/>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__title">Pending Grades</div>
            <div class="stat-card__value">{{ pendingGrades }}</div>
          </div>
          <div class="stat-card__icon bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600">
            <ClockIcon class="h-6 w-6"/>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Student Stats -->
        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__title">Current Courses</div>
            <div class="stat-card__value">{{ currentCourses.length }}</div>
          </div>
          <div class="stat-card__icon bg-primary-50 dark:bg-primary-900/20 text-primary-600">
            <BookOpenIcon class="h-6 w-6"/>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__title">Attendance Rate</div>
            <div class="stat-card__value">{{ overallAttendanceRate }}%</div>
          </div>
          <div class="stat-card__icon bg-green-50 dark:bg-green-900/20 text-green-600">
            <ChartBarIcon class="h-6 w-6"/>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__content">
            <div class="stat-card__title">Average Grade</div>
            <div class="stat-card__value">{{ overallGrade }}%</div>
          </div>
          <div class="stat-card__icon bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600">
            <AcademicCapIcon class="h-6 w-6"/>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dashboard__content">
      <!-- Lecturer View -->
      <template v-if="isLecturer">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- Active Courses -->
          <div class="dashboard__card">
            <div class="dashboard__card-header">
              <h2 class="dashboard__card-title">Active Courses</h2>
              <BaseButton
                  size="sm"
                  variant="outline"
                  @click="navigateTo('/courses')"
              >
                View All
              </BaseButton>
            </div>
            <div class="dashboard__card-content">
              <div v-if="loading" class="space-y-4">
                <div v-for="n in 3" :key="n" class="animate-pulse">
                  <div class="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
              <div v-else-if="!activeCourses.length" class="dashboard__empty">
                <p class="text-gray-500 dark:text-gray-400">No active courses</p>
              </div>
              <div v-else class="space-y-4">
                <div
                    v-for="course in activeCourses.slice(0, 3)"
                    :key="course.id"
                    class="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    @click="navigateTo(`/courses/${course.id}`)"
                >
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-gray-100">
                      {{ course.title }}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ course.enrolled }} students • {{ course.schedule }}
                    </p>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400"/>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="dashboard__card">
            <div class="dashboard__card-header">
              <h2 class="dashboard__card-title">Recent Activity</h2>
            </div>
            <div class="dashboard__card-content">
              <div v-if="loading" class="space-y-4">
                <div v-for="n in 5" :key="n" class="animate-pulse">
                  <div class="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
              <div v-else-if="!recentActivity.length" class="dashboard__empty">
                <p class="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
              <div v-else class="space-y-4">
                <div
                    v-for="activity in recentActivity"
                    :key="activity.id"
                    class="flex gap-4 p-4"
                >
                  <div
                      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      :class="getActivityColor(activity.type)"
                  >
                    <component
                        :is="getActivityIcon(activity.type)"
                        class="h-4 w-4"
                    />
                  </div>
                  <div>
                    <p class="text-sm text-gray-900 dark:text-gray-100">
                      {{ activity.message }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(activity.timestamp) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Main Content (Left Side - 2 columns) -->
          <div class="xl:col-span-2 space-y-6">
            <!-- Current Courses -->
            <div class="dashboard__card">
              <div class="dashboard__card-header">
                <h2 class="dashboard__card-title">Current Courses</h2>
                <BaseButton
                    size="sm"
                    variant="outline"
                    @click="navigateTo('/courses')"
                >
                  View All
                </BaseButton>
              </div>
              <div class="dashboard__card-content">
                <div v-if="loading" class="space-y-4">
                  <div v-for="n in 3" :key="n" class="animate-pulse">
                    <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  </div>
                </div>
                <div v-else-if="!currentCourses.length" class="dashboard__empty">
                  <p class="text-gray-500 dark:text-gray-400">No current courses</p>
                </div>
                <div v-else class="space-y-4">
                  <div
                      v-for="course in currentCourses"
                      :key="course.id"
                      class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50
                     transition-colors cursor-pointer"
                      @click="navigateTo(`/courses/${course.id}`)"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h3 class="font-medium text-gray-900 dark:text-gray-100">
                          {{ course.title }}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          {{ course.lecturer }} • {{ course.schedule }}
                        </p>
                      </div>
                      <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getGradeColor(course.grade)"
                      >
                  {{ course.grade ?? 'N/A' }}%
                </span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mt-2">
                      <div class="flex justify-between text-xs mb-1">
                        <span class="text-gray-500 dark:text-gray-400">Course Progress</span>
                        <span class="text-gray-700 dark:text-gray-300">
                    {{ course.completedItems }}/{{ course.totalItems }} Items
                  </span>
                      </div>
                      <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            class="h-full bg-primary-600 dark:bg-primary-500"
                            :style="{ width: `${(course.completedItems / course.totalItems) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Latest Grades -->
            <div class="dashboard__card">
              <div class="dashboard__card-header">
                <h2 class="dashboard__card-title">Latest Grades</h2>
                <BaseButton
                    size="sm"
                    variant="outline"
                    @click="navigateTo('/grades')"
                >
                  View All
                </BaseButton>
              </div>
              <div class="dashboard__card-content">
                <div v-if="loading" class="space-y-4">
                  <div v-for="n in 5" :key="n" class="animate-pulse">
                    <div class="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  </div>
                </div>
                <div v-else-if="!latestGrades.length" class="dashboard__empty">
                  <p class="text-gray-500 dark:text-gray-400">No grades yet</p>
                </div>
                <div v-else>
                  <table class="min-w-full">
                    <thead>
                    <tr>
                      <th class="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                        Course
                      </th>
                      <th class="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                        Assessment
                      </th>
                      <th class="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-2">
                        Grade
                      </th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr
                        v-for="grade in latestGrades"
                        :key="grade.id"
                        class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td class="py-3 text-sm">
                        <span class="text-gray-900 dark:text-gray-100">{{ grade.course }}</span>
                      </td>
                      <td class="py-3 text-sm">
                        <span class="text-gray-500 dark:text-gray-400">{{ grade.assessment }}</span>
                      </td>
                      <td class="py-3 text-sm text-right">
                    <span
                        class="font-medium"
                        :class="getGradeColor(grade.score)"
                    >
                      {{ grade.score }}%
                    </span>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side Column -->
          <div class="space-y-6">
            <!-- Attendance Summary -->
            <div class="dashboard__card">
              <div class="dashboard__card-header">
                <h2 class="dashboard__card-title">Attendance Summary</h2>
              </div>
              <div class="dashboard__card-content">
                <div class="space-y-4">
                  <div
                      v-for="course in currentCourses"
                      :key="course.id"
                      class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <div class="font-medium text-gray-900 dark:text-gray-100">
                        {{ course.title }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ course.attendedSessions }}/{{ course.totalSessions }} Sessions
                      </div>
                    </div>
                    <div
                        class="text-lg font-semibold"
                        :class="getAttendanceColor(course.attendanceRate)"
                    >
                      {{ course.attendanceRate }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upcoming Sessions -->
            <div class="dashboard__card">
              <div class="dashboard__card-header">
                <h2 class="dashboard__card-title">Upcoming Sessions</h2>
              </div>
              <div class="dashboard__card-content">
                <div v-if="!upcomingSessions.length" class="dashboard__empty">
                  <p class="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
                </div>
                <div v-else class="space-y-3">
                  <div
                      v-for="session in upcomingSessions"
                      :key="session.id"
                      class="flex items-start gap-3 p-3"
                  >
                    <div class="flex-shrink-0 w-12 text-center">
                      <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {{ formatDate(session.date, 'MMM') }}
                      </div>
                      <div class="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {{ formatDate(session.date, 'DD') }}
                      </div>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-gray-100">
                        {{ session.course }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatTime(session.date) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {
  AcademicCapIcon,
  UsersIcon,
  ClockIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import {useAuthStore} from '~/strores/auth'
import BaseButton from "~/components/common/BaseButton.vue";

const authStore = useAuthStore()
const loading = ref(false)

// Computed
const isLecturer = computed(() => authStore.isLecturer || authStore.isAdmin)

// Mock data (replace with actual store data)
const activeCourses = ref([
  {
    id: 1,
    title: 'Introduction to Programming',
    enrolled: 25,
    schedule: 'Mon/Wed 09:00'
  }
  // Add more courses...
])

const recentActivity = ref([
  {
    id: 1,
    type: 'grade',
    message: 'Posted grades for Web Development',
    timestamp: new Date().toISOString()
  }
  // Add more activities...
])

// Stats calculations
const totalStudents = computed(() => {
  return activeCourses.value.reduce((sum, course) => sum + course.enrolled, 0)
})

const pendingGrades = ref(5)


const getActivityIcon = (type: string) => {
  switch (type) {
    case 'grade':
      return AcademicCapIcon
    case 'attendance':
      return UsersIcon
    default:
      return ClockIcon
  }
}

// Add these computed properties
const overallAttendanceRate = computed(() => {
  if (!currentCourses.value.length) return 0
  const total = currentCourses.value.reduce((sum, course) =>
      sum + course.attendanceRate, 0
  )
  return Math.round(total / currentCourses.value.length)
})

const overallGrade = computed(() => {
  const coursesWithGrades = currentCourses.value.filter(course => course.grade)
  if (!coursesWithGrades.length) return 0
  const total = coursesWithGrades.reduce((sum, course) =>
      sum + (course.grade || 0), 0
  )
  return Math.round(total / coursesWithGrades.length)
})

const getActivityColor = (type: string) => {
  switch (type) {
    case 'grade':
      return 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
    case 'attendance':
      return 'bg-green-50 dark:bg-green-900/20 text-green-600'
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600'
  }
}

const currentCourses = ref([
  {
    id: 1,
    title: 'Web Development',
    lecturer: 'Dr. Smith',
    schedule: 'Mon/Wed 09:00',
    grade: 85,
    completedItems: 8,
    totalItems: 10,
    attendedSessions: 12,
    totalSessions: 14,
    attendanceRate: 86
  }
  // Add more courses...
])

const latestGrades = ref([
  {
    id: 1,
    course: 'Web Development',
    assessment: 'Midterm Exam',
    score: 85
  }
  // Add more grades...
])

const upcomingSessions = ref([
  {
    id: 1,
    course: 'Web Development',
    date: '2024-01-22T09:00:00'
  }
  // Add more sessions...
])

const getGradeColor = (grade) => {
  if (!grade) return 'text-gray-500 dark:text-gray-400'
  if (grade >= 90) return 'text-green-600 dark:text-green-400'
  if (grade >= 80) return 'text-primary-600 dark:text-primary-400'
  if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-error-600 dark:text-error-400'
}

const getAttendanceColor = (rate) => {
  if (rate >= 90) return 'text-green-600 dark:text-green-400'
  if (rate >= 80) return 'text-primary-600 dark:text-primary-400'
  if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-error-600 dark:text-error-400'
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString, format?: string) => {
  const date = new Date(dateString)
  if (format === 'MMM') return date.toLocaleString('default', {month: 'short'})
  if (format === 'DD') return date.getDate()
  return date.toLocaleDateString()
}

definePageMeta({
  middleware: ['auth']
})
</script>

<style lang="scss" scoped>
.dashboard {
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

  &__stats {
    @apply mt-6;
  }

  &__content {
    @apply mt-6 space-y-6;
  }

  &__card {
    @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;

    &-header {
      @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
    }

    &-title {
      @apply text-lg font-medium text-gray-900 dark:text-gray-100;
    }

    &-content {
      @apply p-6;
    }
  }

  &__empty {
    @apply text-center py-8;
  }
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6
  flex items-center justify-between;

  &__content {
    @apply space-y-1;
  }

  &__title {
    @apply text-sm font-medium text-gray-500 dark:text-gray-400;
  }

  &__value {
    @apply text-2xl font-semibold text-gray-900 dark:text-gray-100;
  }

  &__icon {
    @apply p-3 rounded-full;
  }
}
</style>