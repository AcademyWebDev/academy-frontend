<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  rounded?: boolean
  leftIcon?: Component
  rightIcon?: Component
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  rounded: false,
})
</script>

<template>
  <button
      :type="type"
      :disabled="disabled || loading"
      :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--loading': loading },
      { 'base-button--block': block },
      { 'base-button--rounded': rounded }
    ]"
      v-bind="$attrs"
  >
    <!-- Loading Spinner -->
    <span
        v-if="loading"
        class="base-button__spinner"
    >
      <span class="sr-only">Loading...</span>
    </span>

    <!-- Left Icon -->
    <component
        :is="leftIcon"
        v-if="leftIcon"
        class="base-button__icon base-button__icon--left"
        :class="{ 'opacity-0': loading }"
    />

    <!-- Button Content -->
    <span
        class="base-button__content"
        :class="{ 'opacity-0': loading }"
    >
      <slot/>
    </span>

    <!-- Right Icon -->
    <component
        :is="rightIcon"
        v-if="rightIcon"
        class="base-button__icon base-button__icon--right"
        :class="{ 'opacity-0': loading }"
    />
  </button>
</template>

<style lang="scss" scoped>
.base-button {
  @apply inline-flex items-center justify-center font-medium transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50
  disabled:cursor-not-allowed relative;

  // Size Variants
  &--sm {
    @apply px-3 py-1.5 text-sm;

    .base-button__icon {
      @apply h-4 w-4;
    }
  }

  &--md {
    @apply px-4 py-2 text-sm;

    .base-button__icon {
      @apply h-5 w-5;
    }
  }

  &--lg {
    @apply px-6 py-3 text-base;

    .base-button__icon {
      @apply h-5 w-5;
    }
  }

  // Style Variants
  &--primary {
    @apply bg-primary-600 text-white hover:bg-primary-700
    focus:ring-primary-500;

    &:disabled {
      @apply bg-primary-600;
    }
  }

  &--secondary {
    @apply bg-secondary-600 text-white hover:bg-secondary-700
    focus:ring-secondary-500;

    &:disabled {
      @apply bg-secondary-600;
    }
  }

  &--outline {
    @apply border-2 border-primary-600 text-primary-600 bg-transparent
    hover:bg-primary-50 focus:ring-primary-500;

    &:disabled {
      @apply border-primary-300 text-primary-300;
    }
  }

  &--ghost {
    @apply text-gray-700 hover:bg-gray-100 focus:ring-gray-500;

    &:disabled {
      @apply text-gray-400;
    }
  }

  &--danger {
    @apply bg-error-600 text-white hover:bg-error-700
    focus:ring-error-500;

    &:disabled {
      @apply bg-error-600;
    }
  }

  // Modifiers
  &--block {
    @apply w-full;
  }

  &--rounded {
    @apply rounded-full;
  }

  &--loading {
    @apply cursor-wait;
  }

  // Icon Positioning
  &__icon {
    &--left {
      @apply -ml-0.5 mr-2;
    }

    &--right {
      @apply -mr-0.5 ml-2;
    }
  }

  // Loading Spinner
  &__spinner {
    @apply absolute inset-0 flex items-center justify-center;

    &::after {
      content: '';
      @apply h-5 w-5 rounded-full border-2 border-white border-r-transparent
      animate-spin;
    }
  }

  &__content {
    @apply flex items-center;
  }
}
</style>