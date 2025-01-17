<script setup lang="ts">
import {ref, computed} from 'vue'
import {
  PlusIcon,
  FunnelIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  ClipboardIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/vue/24/outline'
import {useAuthStore} from '~/strores/auth'
import BaseDropdown from "~/components/common/BaseDropdown.vue";
import BaseButton from "~/components/common/BaseButton.vue";
import CreateAttendanceSessionPopup from "~/components/attendance/CreateAttendanceSessionPopup.vue";

const authStore = useAuthStore()
const isLecturer = computed(() => authStore.isLecturer || authStore.isAdmin)

const loading = ref(false)
const error = ref<string | null>(null)
const showCreateSession = ref(false)
const creatingSession = ref(false)
const markingAttendance = ref<number | null>(null)

// Filters
const filters = ref({
  dateRange: 'week',
  courseId: 'all',
  status: 'all'
})

// Form state for new session
const newSession = ref({
  courseId: null as number | null,
  startTime: '',
  requireLocation: false
})

const courses = ref([
  {id: 1, title: 'Web Development', lecturer: 'Dr. Smith'},
  {id: 2, title: 'Mobile Development', lecturer: 'Dr. Johnson'}
])

const sessions = ref([
  {
    id: 1,
    courseId: 1,
    course: {
      title: 'Web Development',
      lecturer: 'Dr. Smith'
    },
    status: 'active',
    startTime: '2024-01-14T09:00:00',
    requireLocation: true,
    presentCount: 15,
    totalStudents: 20
  },
  {
    id: 2,
    courseId: 2,
    course: {
      title: 'Mobile Development',
      lecturer: 'Dr. Johnson'
    },
    status: 'ended',
    startTime: '2024-01-14T11:00:00',
    requireLocation: false,
    presentCount: 18,
    totalStudents: 25
  }
])

const lecturerCourses = computed(() => {
  return courses.value
})

const filteredSessions = computed(() => {
  let filtered = sessions.value

  // Filter by course
  if (filters.value.courseId !== 'all') {
    filtered = filtered.filter(session => session.courseId === filters.value.courseId)
  }

  // Filter by status
  if (filters.value.status !== 'all') {
    filtered = filtered.filter(session => session.status === filters.value.status)
  }

  // Filter by date range
  const now = new Date()
  switch (filters.value.dateRange) {
    case 'today':
      filtered = filtered.filter(session =>
          new Date(session.startTime).toDateString() === now.toDateString()
      )
      break
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(session =>
          new Date(session.startTime) >= weekAgo
      )
      break
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(session =>
          new Date(session.startTime) >= monthAgo
      )
      break
  }

  return filtered
})

const isValidSession = computed(() => {
  return newSession.value.courseId && newSession.value.startTime
})

const fetchSessions = async () => {
  loading.value = true
  error.value = null
  try {
    // Replace with API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // sessions.value = await response.data
  } catch (err) {
    error.value = 'Failed to load attendance sessions'
    console.error('Error fetching sessions:', err)
  } finally {
    loading.value = false
  }
}

const createSession = async () => {
  creatingSession.value = true
  try {
    // Replace with API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newSessionData = {
      id: Date.now(),
      ...newSession.value,
      status: 'active',
      course: courses.value.find(c => c.id === newSession.value.courseId),
      presentCount: 0,
      totalStudents: 25
    }
    sessions.value.unshift(newSessionData)
    showCreateSession.value = false
    newSession.value = {
      courseId: null,
      startTime: '',
      requireLocation: false
    }
  } catch (err) {
    console.error('Error creating session:', err)
  } finally {
    creatingSession.value = false
  }
}

const endSession = async (sessionId: number) => {
  try {
    // Replace with API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      session.status = 'ended'
    }
  } catch (err) {
    console.error('Error ending session:', err)
  }
}

const markAttendance = async (sessionId: number) => {
  markingAttendance.value = sessionId
  try {
    // Replace with API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      session.presentCount++
    }
  } catch (err) {
    console.error('Error marking attendance:', err)
  } finally {
    markingAttendance.value = null
  }
}

const hasMarkedAttendance = (sessionId: number) => {
  return false
}

const viewSessionDetails = (sessionId: number) => {
  navigateTo(`/attendance/${sessionId}`)
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const calculateRate = (present: number, total: number) => {
  return total ? Math.round((present / total) * 100) : 0
}

// Fetch data on mount
onMounted(() => {
  fetchSessions()
})

// Page meta
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

</script>


<template>
  <div class="attendance-page">
    <!-- Header Section -->
    <header class="attendance-page__header">
      <div>
        <h1 class="attendance-page__title">Attendance</h1>
        <p class="attendance-page__subtitle">
          {{ isLecturer ? 'Manage course attendance sessions' : 'Mark your attendance for active sessions' }}
        </p>
      </div>

      <div class="attendance-page__actions">
        <!-- Lecturer Actions -->
        <BaseButton
            v-if="isLecturer"
            variant="primary"
            :leftIcon="PlusIcon"
            @click="showCreateSession = true"
        >
          Create Session
        </BaseButton>

        <!-- Filter Dropdown -->
        <BaseDropdown position="right">
          <template #trigger>
            <BaseButton variant="outline" :leftIcon="FunnelIcon">
              Filters
            </BaseButton>
          </template>
          <template #content>
            <div class="filters-dropdown">
              <div class="filters-dropdown__section">
                <label class="filters-dropdown__label">Date Range</label>
                <select v-model="filters.dateRange" class="filters-dropdown__select">
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div class="filters-dropdown__section">
                <label class="filters-dropdown__label">Course</label>
                <select v-model="filters.courseId" class="filters-dropdown__select">
                  <option value="all">All Courses</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.title }}
                  </option>
                </select>
              </div>

              <div v-if="isLecturer" class="filters-dropdown__section">
                <label class="filters-dropdown__label">Status</label>
                <select v-model="filters.status" class="filters-dropdown__select">
                  <option value="all">All Sessions</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>
          </template>
        </BaseDropdown>

        <!-- Reports Button for Lecturers -->
        <BaseButton
            v-if="isLecturer"
            variant="outline"
            :leftIcon="ChartBarIcon"
            @click="navigateTo('/attendance/reports')"
        >
          Reports
        </BaseButton>
      </div>
    </header>

    <!-- Main Content -->
    <div class="attendance-page__content">
      <!-- Loading State -->
      <div v-if="loading" class="attendance-page__loading">
        <div v-for="n in 3" :key="n" class="attendance-page__skeleton"/>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="attendance-page__error">
        <ExclamationCircleIcon class="h-12 w-12 text-error-500"/>
        <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ error }}
        </p>
        <BaseButton @click="fetchSessions">Try Again</BaseButton>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredSessions.length" class="attendance-page__empty">
        <ClipboardIcon class="h-12 w-12 text-gray-400 dark:text-gray-500"/>
        <p class="text-lg font-medium text-gray-900 dark:text-gray-100">
          No attendance sessions found
        </p>
        <p class="text-gray-500 dark:text-gray-400">
          {{
            isLecturer ? 'Create a new session to start tracking attendance' : 'Check back later for active sessions'
          }}
        </p>
      </div>

      <!-- Sessions Grid -->
      <div v-else class="attendance-page__grid">
        <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="attendance-page__session"
        >
          <div class="attendance-page__session-header">
            <span
                :class="[
                'attendance-page__session-status',
                `attendance-page__session-status--${session.status}`
              ]"
            >
              {{ session.status === 'active' ? 'Active' : 'Ended' }}
            </span>
            <time class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDateTime(session.startTime) }}
            </time>
          </div>

          <div class="attendance-page__session-content">
            <h3 class="attendance-page__session-title">
              {{ session.course.title }}
            </h3>

            <div class="attendance-page__session-info">
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <UserIcon class="h-4 w-4"/>
                <span>{{ session.course.lecturer }}</span>
              </div>

              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPinIcon class="h-4 w-4"/>
                <span>{{ session.requireLocation ? 'On-campus' : 'Online' }}</span>
              </div>
            </div>

            <!-- Attendance Stats (Lecturer View) -->
            <div v-if="isLecturer" class="attendance-page__session-stats">
              <div class="attendance-page__stat">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Present</span>
                <span class="text-lg font-semibold text-green-600 dark:text-green-400">
                  {{ session.presentCount }}
                </span>
              </div>
              <div class="attendance-page__stat">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ session.totalStudents }}
                </span>
              </div>
              <div class="attendance-page__stat">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rate</span>
                <span class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {{ calculateRate(session.presentCount, session.totalStudents) }}%
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="attendance-page__session-actions">
              <template v-if="isLecturer">
                <BaseButton
                    v-if="session.status === 'active'"
                    variant="danger"
                    size="sm"
                    block
                    @click="endSession(session.id)"
                >
                  End Session
                </BaseButton>
                <BaseButton
                    v-else
                    variant="outline"
                    size="sm"
                    block
                    @click="viewSessionDetails(session.id)"
                >
                  View Details
                </BaseButton>
              </template>
              <template v-else>
                <BaseButton
                    v-if="session.status === 'active' && !hasMarkedAttendance(session.id)"
                    variant="primary"
                    size="sm"
                    block
                    :loading="markingAttendance === session.id"
                    @click="markAttendance(session.id)"
                >
                  Mark Present
                </BaseButton>
                <p
                    v-else-if="session.status === 'active'"
                    class="text-center text-sm text-green-600 dark:text-green-400"
                >
                  ✓ Attendance Marked
                </p>
                <p
                    v-else
                    class="text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Session Ended
                </p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CreateAttendanceSessionPopup
        :show="showCreateSession"
        :lecturer-courses="lecturerCourses"
        @close="showCreateSession = false"
        @create="createSession"
    />
  </div>
</template>

<style lang="scss" scoped>
.attendance-page {
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

  &__session {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm
    border border-gray-200 dark:border-gray-700
    overflow-hidden transition-shadow duration-200
    hover:shadow-md;
  }

  &__session-header {
    @apply px-4 py-3 flex justify-between items-center
    border-b border-gray-200 dark:border-gray-700;
  }

  &__session-status {
    @apply px-2.5 py-0.5 rounded-full text-xs font-medium;

    &--active {
      @apply bg-green-100 dark:bg-green-900/30
      text-green-800 dark:text-green-400;
    }

    &--ended {
      @apply bg-gray-100 dark:bg-gray-900/30
      text-gray-800 dark:text-gray-400;
    }
  }

  &__session-content {
    @apply p-4 space-y-4;
  }

  &__session-title {
    @apply text-lg font-medium text-gray-900 dark:text-gray-100;
  }

  &__session-info {
    @apply space-y-2;
  }

  &__session-stats {
    @apply grid grid-cols-3 gap-4 py-3
    border-t border-b border-gray-200 dark:border-gray-700;
  }

  &__stat {
    @apply flex flex-col items-center gap-1;
  }

  &__session-actions {
    @apply pt-2;
  }

  &__loading {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
  }

  &__skeleton {
    @apply h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse;
  }

  &__empty,
  &__error {
    @apply flex flex-col items-center justify-center text-center py-12 gap-4;
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