<script setup lang="ts">
import {computed, ref} from 'vue'
import {
  UsersIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/vue/24/solid'
import BaseButton from "~/components/common/BaseButton.vue";

interface Props {
  course: {
    id: number
    title: string
    lecturer: string
    thumbnail?: string
    capacity: number
    enrolled: number
    schedule: string
    status: 'active' | 'upcoming' | 'completed'
    rating?: number
    ratingCount?: number
  }
  isLecturer: boolean
  isEnrolled?: boolean
  hasRated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEnrolled: false,
  hasRated: false
})

const emit = defineEmits<{
  (e: 'enroll', courseId: number): void
  (e: 'view', courseId: number): void
  (e: 'rate', courseId: number, rating: number): void
}>()

// State
const showRatingModal = ref(false)
const selectedRating = ref(0)

// Computed
const remainingSpots = computed(() => {
  return Math.max(0, props.course.capacity - props.course.enrolled)
})

const statusLabel = computed(() => {
  switch (props.course.status) {
    case 'active':
      return 'Active'
    case 'upcoming':
      return 'Upcoming'
    case 'completed':
      return 'Completed'
  }
})

// Methods
const submitRating = () => {
  if (selectedRating.value) {
    emit('rate', props.course.id, selectedRating.value)
    showRatingModal.value = false
    selectedRating.value = 0
  }
}
</script>

<template>
  <div class="course-card">
    <div class="course-card__image">
      <img
          :src="course.thumbnail || '/course-placeholder.jpg'"
          :alt="course.title"
          class="course-card__thumbnail"
      >

      <div
          :class="[
          'course-card__status',
          `course-card__status--${course.status}`
        ]"
      >
        {{ statusLabel }}
      </div>
    </div>

    <div class="course-card__content">
      <h3 class="course-card__title">
        {{ course.title }}
      </h3>

      <p class="course-card__lecturer">
        {{ course.lecturer }}
      </p>

      <div class="course-card__info">
        <div class="course-card__capacity">
          <UsersIcon class="h-4 w-4"/>
          <span>{{ course.enrolled }}/{{ course.capacity }} enrolled</span>
        </div>
        <div class="course-card__schedule">
          <ClockIcon class="h-4 w-4"/>
          <span>{{ course.schedule }}</span>
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
          {{ remainingSpots }} spots remaining
        </span>
      </div>

      <!-- Rating -->
      <div class="course-card__rating">
        <div class="flex items-center">
          <StarIcon
              v-for="i in 5"
              :key="i"
              :class="[
              'h-5 w-5',
              i <= (course.rating || 0)
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            ]"
          />
        </div>
        <span class="course-card__rating-count">
          {{ course.ratingCount || 0 }} ratings
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="course-card__actions">
      <template v-if="isLecturer">
        <BaseButton
            variant="outline"
            block
            @click="$emit('view', course.id)"
        >
          Manage Course
        </BaseButton>
      </template>
      <template v-else>
        <BaseButton
            v-if="!isEnrolled"
            variant="primary"
            block
            :disabled="course.enrolled >= course.capacity"
            @click="$emit('enroll', course.id)"
        >
          {{ course.enrolled >= course.capacity ? 'Course Full' : 'Enroll Now' }}
        </BaseButton>
        <template v-else>
          <BaseButton
              variant="outline"
              block
              @click="$emit('view', course.id)"
          >
            Continue Course
          </BaseButton>
          <div v-if="!hasRated" class="mt-2">
            <BaseButton
                variant="ghost"
                block
                @click="showRatingModal = true"
            >
              Rate Course
            </BaseButton>
          </div>
        </template>
      </template>
    </div>

    <!-- Rating Modal -->
    <BaseModal
        v-if="showRatingModal"
        title="Rate Course"
        @close="showRatingModal = false"
    >
      <div class="p-4 space-y-4">
        <div class="flex justify-center gap-2">
          <button
              v-for="i in 5"
              :key="i"
              @click="selectedRating = i"
              class="p-1 focus:outline-none"
          >
            <StarIcon
                class="h-8 w-8"
                :class="i <= selectedRating ? 'text-yellow-400' : 'text-gray-300'"
            />
          </button>
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton
              variant="outline"
              @click="showRatingModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
              variant="primary"
              :disabled="!selectedRating"
              @click="submitRating"
          >
            Submit
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style lang="scss" scoped>
.course-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden
  border border-gray-200 dark:border-gray-700
  transition-all duration-200 hover:shadow-md;

  &__image {
    @apply relative aspect-video;
  }

  &__thumbnail {
    @apply w-full h-full object-cover;
  }

  &__status {
    @apply absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium;

    &--active {
      @apply bg-green-100 text-green-800;
    }

    &--upcoming {
      @apply bg-blue-100 text-blue-800;
    }

    &--completed {
      @apply bg-gray-100 text-gray-800;
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
    @apply flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400;
  }

  &__capacity,
  &__schedule {
    @apply flex items-center gap-2;
  }

  &__progress {
    @apply space-y-1;
  }

  &__progress-bar {
    @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
  }

  &__progress-fill {
    @apply h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all duration-300;
  }

  &__progress-text {
    @apply text-xs text-gray-600 dark:text-gray-400;
  }

  &__rating {
    @apply flex items-center justify-between;
  }

  &__rating-count {
    @apply text-sm text-gray-500 dark:text-gray-400;
  }

  &__actions {
    @apply p-4 border-t border-gray-200 dark:border-gray-700;
  }
}
</style>