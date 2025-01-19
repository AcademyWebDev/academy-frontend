<template>
  <div class="base-table">
    <div class="base-table__wrapper">
      <table class="base-table__table">
        <thead class="base-table__header">
        <tr>
          <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'base-table__th',
                column.align && `text-${column.align}`,
                column.width && `w-${column.width}`
              ]"
          >
            {{ column.title }}
          </th>
        </tr>
        </thead>
        <tbody class="base-table__body">
        <template v-if="loading">
          <tr v-for="n in 3" :key="n" class="base-table__tr">
            <td
                v-for="column in columns"
                :key="column.key"
                class="base-table__td"
            >
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </td>
          </tr>
        </template>
        <template v-else>
          <slot />
        </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  title: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

defineProps<{
  columns: Column[]
  loading?: boolean
}>()
</script>

<style lang="scss" scoped>
.base-table {
  @apply relative;

  &__wrapper {
    @apply overflow-x-auto ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg;
  }

  &__table {
    @apply min-w-full divide-y divide-gray-200 dark:divide-gray-700;
  }

  &__header {
    @apply bg-gray-50 dark:bg-gray-800;
  }

  &__th {
    @apply px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100;
  }

  &__body {
    @apply divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800;
  }

  &__tr {
    @apply hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150;
  }

  &__td {
    @apply px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap;
  }
}
</style>