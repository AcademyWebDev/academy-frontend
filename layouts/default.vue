<script setup lang="ts">
import {
  Bars3Icon, BellIcon, ChevronLeftIcon, ChevronDownIcon,
  UserIcon, CogIcon, ArrowRightOnRectangleIcon,
  SunIcon, MoonIcon
} from '@heroicons/vue/24/outline'
import {useAuthStore} from "~/strores/auth";

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Sidebar state
const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// Theme handling
const isDarkMode = ref(false)
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark')
}

// Navigation items based on user role
const navigationItems = computed(() => {
  const items = [
    {label: 'Dashboard', path: '/dashboard', icon: 'HomeIcon'},
    {label: 'Courses', path: '/courses', icon: 'BookOpenIcon'},
    {label: 'Attendance', path: '/attendance', icon: 'ClipboardIcon'},
    {label: 'Grades', path: '/grades', icon: 'ChartBarIcon'},
  ]

  if (authStore.isLecturer || authStore.isAdmin) {
    items.push(
        {label: 'Students', path: '/students', icon: 'UserGroupIcon'},
        {label: 'Reports', path: '/reports', icon: 'DocumentChartBarIcon'}
    )
  }

  if (authStore.isAdmin) {
    items.push(
        {label: 'Settings', path: '/admin/settings', icon: 'CogIcon'}
    )
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
  <div class="app-layout">
    <!-- Sidebar -->
    <aside :class="['app-layout__sidebar', { 'app-layout__sidebar--collapsed': isSidebarCollapsed }]">
      <div class="app-layout__sidebar-header">
        <img src="/logo.svg" alt="KD Academy" class="app-layout__logo">
        <button v-if="!isSidebarCollapsed" @click="toggleSidebar" class="app-layout__collapse-btn">
          <ChevronLeftIcon class="h-5 w-5"/>
        </button>
      </div>

      <nav class="app-layout__nav">
        <NuxtLink v-for="item in navigationItems" :key="item.path" :to="item.path"
                  :class="['app-layout__nav-item', { 'app-layout__nav-item--active': isCurrentPath(item.path) }]"
                  :title="isSidebarCollapsed ? item.label : ''">
          <component :is="item.icon" class="h-5 w-5"/>
          <span v-if="!isSidebarCollapsed">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="app-layout__main">
      <!-- Top Header -->
      <header class="app-layout__header">
        <div class="flex items-center gap-4">
          <button v-if="isSidebarCollapsed" @click="toggleSidebar" class="app-layout__collapse-btn">
            <Bars3Icon class="h-5 w-5"/>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <BaseDropdown>
            <template #trigger>
              <button class="app-layout__header-btn relative">
                <BellIcon class="h-5 w-5"/>
                <span v-if="unreadNotifications" class="app-layout__notification-badge">
                  {{ unreadNotifications }}
                </span>
              </button>
            </template>

            <template #content>
              <div class="app-layout__notifications">
                <div class="p-4 border-b">
                  <h3 class="font-semibold">Notifications</h3>
                </div>
                <div class="max-h-[400px] overflow-y-auto">
                  <div v-if="notifications.length" class="divide-y">
                    <div v-for="notification in notifications" :key="notification.id"
                         class="p-4 hover:bg-gray-50">
                      <p class="text-sm">{{ notification.message }}</p>
                      <span class="text-xs text-gray-500">{{ notification.time }}</span>
                    </div>
                  </div>
                  <div v-else class="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                </div>
              </div>
            </template>
          </BaseDropdown>

          <!-- Theme Toggle -->
          <button class="app-layout__header-btn" @click="toggleTheme">
            <SunIcon v-if="isDarkMode" class="h-5 w-5"/>
            <MoonIcon v-else class="h-5 w-5"/>
          </button>

          <!-- Profile Dropdown -->
          <BaseDropdown>
            <template #trigger>
              <button class="app-layout__profile-btn">
                <img :src="user?.avatar || '/default-avatar.png'" alt="Profile"
                     class="app-layout__avatar">
                <span v-if="!isSidebarCollapsed" class="app-layout__username">
                  {{ user?.name }}
                </span>
                <ChevronDownIcon class="h-4 w-4"/>
              </button>
            </template>

            <template #content>
              <div class="app-layout__profile-menu">
                <div class="px-4 py-3 border-b">
                  <p class="text-sm font-medium">{{ user?.name }}</p>
                  <p class="text-xs text-gray-500">{{ user?.email }}</p>
                </div>
                <div class="py-1">
                  <NuxtLink to="/profile" class="app-layout__menu-item">
                    <UserIcon class="h-4 w-4"/>
                    Profile
                  </NuxtLink>
                  <NuxtLink to="/settings" class="app-layout__menu-item">
                    <CogIcon class="h-4 w-4"/>
                    Settings
                  </NuxtLink>
                  <button @click="handleLogout" class="app-layout__menu-item text-error-600">
                    <ArrowRightOnRectangleIcon class="h-4 w-4"/>
                    Sign out
                  </button>
                </div>
              </div>
            </template>
          </BaseDropdown>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="app-layout__content">
        <slot/>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  @apply flex min-h-screen bg-gray-50 dark:bg-gray-900;

  &__sidebar {
    @apply fixed inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
    transition-all duration-300 ease-in-out;

    &--collapsed {
      @apply w-20;
    }
  }

  &__sidebar-header {
    @apply flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700;
  }

  &__logo {
    @apply h-8 w-auto;
  }

  &__nav {
    @apply flex flex-col gap-1 p-4;
  }

  &__nav-item {
    @apply flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 rounded-lg
    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200;

    &--active {
      @apply bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400;
    }
  }

  &__main {
    @apply flex-1 ml-64 transition-all duration-300;

    .app-layout__sidebar--collapsed + & {
      @apply ml-20;
    }
  }

  &__header {
    @apply sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800
    border-b border-gray-200 dark:border-gray-700;
  }

  &__header-btn {
    @apply p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
    transition-colors duration-200;
  }

  &__notification-badge {
    @apply absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs text-white
    bg-error-500 rounded-full;
  }

  &__profile-btn {
    @apply flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
    transition-colors duration-200;
  }

  &__avatar {
    @apply h-8 w-8 rounded-full object-cover;
  }

  &__username {
    @apply text-sm font-medium text-gray-700 dark:text-gray-300;
  }

  &__profile-menu {
    @apply w-64;
  }

  &__menu-item {
    @apply flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300
    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200;
  }

  &__content {
    @apply p-6;
  }

  &__collapse-btn {
    @apply p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
    rounded transition-colors duration-200;
  }
}
</style>