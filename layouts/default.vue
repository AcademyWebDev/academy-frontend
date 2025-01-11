<script setup lang="ts">
import {
  Bars3Icon,
  BellIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import {useAuthStore} from '~/strores/auth'
import {useTheme} from '~/composables/useTheme'
import BaseDropdown from "~/components/common/BaseDropdown.vue";

const authStore = useAuthStore()
const {isDark, toggleTheme} = useTheme()
const user = computed(() => authStore.user)

// Sidebar state
const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value.toString())
}

// Initialize sidebar state from localStorage
onMounted(() => {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState) {
    isSidebarCollapsed.value = savedState === 'true'
  }
})

// Navigation items based on user role
const navigationItems = computed(() => {
  const items = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: defineAsyncComponent(() => import('@heroicons/vue/24/outline/HomeIcon'))
    },
    {
      label: 'Courses',
      path: '/courses',
      icon: defineAsyncComponent(() => import('@heroicons/vue/24/outline/AcademicCapIcon'))
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: defineAsyncComponent(() => import('@heroicons/vue/24/outline/ClipboardDocumentCheckIcon'))
    },
    {
      label: 'Grades',
      path: '/grades',
      icon: defineAsyncComponent(() => import('@heroicons/vue/24/outline/ChartBarIcon'))
    }
  ]

  if (authStore.isLecturer || authStore.isAdmin) {
    items.push(
        {
          label: 'Students',
          path: '/students',
          icon: defineAsyncComponent(() => import('@heroicons/vue/24/outline/UserGroupIcon'))
        },
        {
          label: 'Reports',
          path: '/reports',
          icon: defineAsyncComponent(() => import('@heroicons/vue/24/outline/DocumentChartBarIcon'))
        }
    )
  }

  if (authStore.isAdmin) {
    items.push({
      label: 'Settings',
      path: '/admin/settings',
      icon: defineAsyncComponent(() => import('@heroicons/vue/24/outline/Cog6ToothIcon'))
    })
  }

  return items
})

// Mock notifications (replace with real data)
const notifications = ref([
  {
    id: 1,
    message: 'New grade posted for Programming 101',
    time: '5 minutes ago'
  },
  {
    id: 2,
    message: 'Upcoming class reminder: Web Development',
    time: '1 hour ago'
  }
])

const unreadNotifications = computed(() => notifications.value.length)

// Path helpers
const route = useRoute()
const isCurrentPath = (path: string) => route.path === path

// Logout handler
const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}
</script>

<template>
  <div :class="['app-layout', { 'dark': isDark }]">
    <aside
        :class="[
        'app-layout__sidebar',
        { 'app-layout__sidebar--collapsed': isSidebarCollapsed }
      ]"
    >
      <div class="app-layout__sidebar-header">
        <img
            src="/logo.svg"
            alt="KD Academy"
            class="app-layout__logo"
        >
        <button
            v-if="!isSidebarCollapsed"
            @click="toggleSidebar"
            class="app-layout__collapse-btn"
            aria-label="Collapse sidebar"
        >
          <ChevronLeftIcon class="h-5 w-5"/>
        </button>
      </div>

      <nav class="app-layout__nav">
        <NuxtLink
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            :class="[
            'app-layout__nav-item',
            { 'app-layout__nav-item--active': isCurrentPath(item.path) }
          ]"
            :title="isSidebarCollapsed ? item.label : undefined"
        >
          <component :is="item.icon" class="h-5 w-5"/>
          <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div v-if="!isSidebarCollapsed" class="app-layout__sidebar-footer">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © {{ new Date().getFullYear() }} KD Academy
        </p>
      </div>
    </aside>

    <div class="app-layout__main">
      <header class="app-layout__header">
        <div class="flex items-center gap-4">
          <button
              v-if="isSidebarCollapsed"
              @click="toggleSidebar"
              class="app-layout__collapse-btn"
              aria-label="Expand sidebar"
          >
            <Bars3Icon class="h-5 w-5"/>
          </button>

          <div class="app-layout__breadcrumb">
            <!-- You can add breadcrumbs here -->
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="app-layout__search">
            <label class="relative hidden md:block">
              <span class="sr-only">Search</span>
              <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 dark:text-gray-500"/>
              </span>
              <input
                  type="text"
                  class="form-input pl-9 pr-4 py-2 w-full md:w-64 rounded-lg
                       bg-gray-50 dark:bg-gray-700
                       border-gray-300 dark:border-gray-600
                       text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:border-primary-500 dark:focus:border-primary-400
                       focus:ring-primary-500 dark:focus:ring-primary-400"
                  placeholder="Search..."
              >
            </label>
          </div>

          <BaseDropdown position="right">
            <template #trigger>
              <button class="app-layout__header-btn" aria-label="Notifications">
                <div class="relative">
                  <BellIcon class="h-5 w-5"/>
                  <span
                      v-if="unreadNotifications"
                      class="app-layout__notification-badge"
                  >
                    {{ unreadNotifications }}
                  </span>
                </div>
              </button>
            </template>

            <template #content>
              <div class="app-layout__notifications">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                <div class="max-h-[400px] overflow-y-auto">
                  <div v-if="notifications.length" class="divide-y divide-gray-200 dark:divide-gray-700">
                    <div
                        v-for="notification in notifications"
                        :key="notification.id"
                        class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <p class="text-sm text-gray-900 dark:text-gray-100">{{ notification.message }}</p>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ notification.time }}</span>
                    </div>
                  </div>
                  <div v-else class="p-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                </div>
              </div>
            </template>
          </BaseDropdown>

          <button
              class="app-layout__header-btn"
              @click="toggleTheme"
              aria-label="Toggle theme"
          >
            <SunIcon v-if="isDark" class="h-5 w-5"/>
            <MoonIcon v-else class="h-5 w-5"/>
          </button>

          <BaseDropdown position="right">
            <template #trigger>
              <button class="app-layout__profile-btn">
                <img
                    :src="user?.avatar || '/default-avatar.jpg'"
                    :alt="user?.name"
                    class="app-layout__avatar"
                >
                <span
                    v-if="!isSidebarCollapsed"
                    class="app-layout__username hidden md:block"
                >
                  {{ user?.name }}
                </span>
                <ChevronDownIcon class="h-4 w-4"/>
              </button>
            </template>

            <template #content>
              <div class="app-layout__profile-menu">
                <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ user?.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ user?.email }}
                  </p>
                </div>
                <div class="py-1">
                  <NuxtLink
                      to="/profile"
                      class="app-layout__menu-item"
                  >
                    <UserIcon class="h-4 w-4"/>
                    Profile
                  </NuxtLink>
                  <NuxtLink
                      to="/settings"
                      class="app-layout__menu-item"
                  >
                    <Cog6ToothIcon class="h-4 w-4"/>
                    Settings
                  </NuxtLink>
                  <hr class="border-gray-200 dark:border-gray-700">
                  <button
                      @click="handleLogout"
                      class="app-layout__menu-item text-error-600 dark:text-error-400"
                  >
                    <ArrowRightOnRectangleIcon class="h-4 w-4"/>
                    Sign out
                  </button>
                </div>
              </div>
            </template>
          </BaseDropdown>
        </div>
      </header>

      <main class="app-layout__content">
        <slot/>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100;

  &__sidebar {
    @apply fixed inset-y-0 left-0 z-20 w-64
    bg-white dark:bg-gray-800
    border-r border-gray-200 dark:border-gray-700
    transition-all duration-300 ease-in-out
    flex flex-col;

    &--collapsed {
      @apply w-20;
    }
  }

  &__sidebar-header {
    @apply flex items-center justify-between h-16 px-4
    border-b border-gray-200 dark:border-gray-700;
  }

  &__logo {
    @apply h-8 w-auto;
  }

  &__nav {
    @apply flex-1 flex flex-col gap-1 p-4 overflow-y-auto;
  }

  &__nav-item {
    @apply flex items-center gap-3 px-3 py-2
    text-gray-700 dark:text-gray-300 rounded-lg
    hover:bg-gray-100 dark:hover:bg-gray-700
    transition-colors duration-200;

    &--active {
      @apply bg-primary-50 dark:bg-primary-900/50
      text-primary-600 dark:text-primary-400;
    }
  }

  &__sidebar-footer {
    @apply p-4 border-t border-gray-200 dark:border-gray-700;
  }

  &__main {
    @apply flex-1 ml-64 transition-all duration-300;

    .app-layout__sidebar--collapsed + & {
      @apply ml-20;
    }
  }

  &__header {
    @apply sticky top-0 z-10 flex items-center justify-between h-16 px-4
    bg-white dark:bg-gray-800
    border-b border-gray-200 dark:border-gray-700;
  }

  &__header-btn {
    @apply p-2 text-gray-500 dark:text-gray-400
    hover:bg-gray-100 dark:hover:bg-gray-700
    rounded-lg transition-colors duration-200;
  }

  &__notification-badge {
    @apply absolute -top-1 -right-1 h-5 w-5
    flex items-center justify-center
    text-xs text-white bg-error-500
    rounded-full;
  }

  &__profile-btn {
    @apply flex items-center gap-2 p-2
    text-gray-700 dark:text-gray-300
    hover:bg-gray-100 dark:hover:bg-gray-700
    rounded-lg transition-colors duration-200;
  }

  &__avatar {
    @apply h-8 w-8 rounded-full object-cover;
  }

  &__username {
    @apply text-sm font-medium;
  }

  &__profile-menu {
    @apply w-64 bg-white dark:bg-gray-800
    rounded-lg shadow-lg
    border border-gray-200 dark:border-gray-700;
  }

  &__menu-item {
    @apply flex items-center gap-2 w-full px-4 py-2
    text-sm text-gray-700 dark:text-gray-300
    hover:bg-gray-100 dark:hover:bg-gray-700
    transition-colors duration-200;
  }

  &__notifications {
    @apply w-80 bg-white dark:bg-gray-800
    rounded-lg shadow-lg divide-y
    divide-gray-200 dark:divide-gray-700;
  }

  &__content {
    @apply p-6 bg-gray-50 dark:bg-gray-900 min-h-screen;
  }

  &__collapse-btn {
    @apply p-1 text-gray-500 dark:text-gray-400
    hover:bg-gray-100 dark:hover:bg-gray-700
    rounded transition-colors duration-200;
  }

  &__breadcrumb {
    @apply text-sm text-gray-500 dark:text-gray-400;
  }

  &__search {
    input {
      @apply transition-all duration-200;

      &:focus {
        @apply w-80;
      }
    }
  }
}
</style>