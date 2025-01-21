<template>
  <div class="course-card">
    <!-- Course Image -->
    <div class="course-card__image">
      <!--      <img-->
      <!--          :src="course.thumbnail || '/course-placeholder.jpg'"-->
      <!--          :alt="course.title"-->
      <!--          class="course-card__thumbnail"-->
      <!--      >-->
      <img
          src="/course-placeholder.jpg"
          :alt="course.title"
          class="course-card__thumbnail"
      >

      <div
          :class="[
          'course-card__status',
          `course-card__status--${course.status}`
        ]"
      >
        {{ formatStatus(course.status) }}
      </div>
    </div>

    <!-- Course Content -->
    <div class="course-card__content">
      <h3 class="course-card__title">
        {{ course.title }}
      </h3>

      <p class="course-card__lecturer">
        {{ course.lecturer.name || 'Unassigned' }}
      </p>

      <!-- Capacity and Schedule -->
      <div class="course-card__info">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <UsersIcon class="h-4 w-4"/>
          <span>{{ course.enrolled }}/{{ course.capacity }} enrolled</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="course-card__progress">
        <div class="course-card__progress-bar">
          <div
              class="course-card__progress-fill"
              :style="{ width: `${(course.enrolled / course.capacity) * 100}%` }"
          />
        </div>
        <span class="course-card__progress-text">
          {{ course.capacity - course.enrolled }} spots remaining
        </span>
      </div>

      <!-- Rating -->
      <div v-if="course.rating" class="course-card__rating">
        <div class="flex items-center">
          <StarIcon
              v-for="i in 5"
              :key="i"
              :class="[
              'h-5 w-5',
              i <= Math.round(course.rating)
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            ]"
          />
        </div>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ course.rating }} ratings
        </span>
      </div>
      <div v-else>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          No ratings yet
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="course-card__actions">
      <!-- Admin Actions -->
      <template v-if="authStore.isAdmin">
        <div class="grid grid-cols-2 gap-2">
          <BaseButton
              variant="outline"
              block
              @click="$emit('update', course)"
          >
            Update Course
          </BaseButton>
          <BaseButton
              variant="primary"
              block
              @click="$emit('manage', course)"
          >
            Manage Course
          </BaseButton>
        </div>
      </template>

      <!-- Lecturer Actions -->
      <template v-else-if="authStore.isLecturer">
        <BaseButton
            variant="primary"
            block
            @click="$emit('manage', course)"
        >
          Manage Course
        </BaseButton>
      </template>

      <!-- Student Actions -->
      <template v-else>
        <template v-if="!isEnrolled">
          <BaseButton
              variant="primary"
              block
              :disabled="course.enrolled >= course.capacity"
              @click="$emit('enroll', course)"
          >
            {{ course.enrolled >= course.capacity ? 'Course Full' : 'Enroll Now' }}
          </BaseButton>
        </template>
        <template v-else>
          <BaseButton
              variant="outline"
              block
              @click="$emit('view', course)"
          >
            View Course
          </BaseButton>
          <div v-if="!hasRated" class="mt-2">
            <BaseButton
                variant="ghost"
                block
                @click="$emit('rate', course)"
            >
              Rate Course
            </BaseButton>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UsersIcon,
  StarIcon
} from '@heroicons/vue/24/solid'
import {useAuthStore} from '~/strores/auth'
import BaseButton from "~/components/common/BaseButton.vue";
import type {Course} from "~/types/grades";

interface Props {
  course: Course
  isEnrolled?: boolean
  hasRated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEnrolled: false,
  hasRated: false
})

const emit = defineEmits<{
  (e: 'update', course: Props['course']): void
  (e: 'manage', course: Props['course']): void
  (e: 'enroll', course: Props['course']): void
  (e: 'view', course: Props['course']): void
  (e: 'rate', course: Props['course']): void
}>()

const authStore = useAuthStore()

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
</script>

<style lang="scss" scoped>
.course-card {
  @apply bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden;

  &__image {
    @apply relative aspect-video;
  }

  &__thumbnail {
    @apply w-full h-full object-cover;
  }

  &__status {
    @apply absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-xs font-medium;

    &--active {
      @apply bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400;
    }

    &--upcoming {
      @apply bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400;
    }

    &--completed {
      @apply bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400;
    }
  }

  &__content {
    @apply p-4 space-y-3;
  }

  &__title {
    @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
  }

  &__lecturer {
    @apply text-sm text-gray-600 dark:text-gray-400;
  }

  &__info {
    @apply space-y-2;
  }

  &__progress {
    @apply space-y-1;

    &-bar {
      @apply w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden;
    }

    &-fill {
      @apply h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300;
    }

    &-text {
      @apply text-xs text-gray-500 dark:text-gray-400;
    }
  }

  &__rating {
    @apply flex items-center justify-between;
  }

  &__actions {
    @apply p-4 border-t border-gray-200 dark:border-gray-600;
  }
}
</style>