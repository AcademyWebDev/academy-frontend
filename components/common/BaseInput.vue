<script setup lang="ts">
import {ref} from 'vue'
import {XMarkIcon} from '@heroicons/vue/20/solid'

interface Props {
  modelValue: string | number
  label?: string
  type?: string
  error?: string
  hint?: string
  required?: boolean
  clearable?: boolean
  leftIcon?: Component
  rightIcon?: Component
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  clearable: false,
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
}>()

const input = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const clearInput = () => {
  emit('update:modelValue', '')
  input.value?.focus()
}
</script>

<template>
  <div class="base-input">
    <label
        v-if="label"
        :for="id"
        class="base-input__label"
    >
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper">
      <component
          :is="leftIcon"
          v-if="leftIcon"
          class="base-input__icon base-input__icon--left"
      />

      <input
          :id="id"
          ref="input"
          v-bind="$attrs"
          :value="modelValue"
          :type="type"
          :class="[
          'base-input__field',
          { 'base-input__field--error': !!error },
          { 'base-input__field--with-left-icon': leftIcon },
          { 'base-input__field--with-right-icon': rightIcon || clearable }
        ]"
          @input="handleInput"
          @blur="handleBlur"
      >

      <component
          :is="rightIcon"
          v-if="rightIcon"
          class="base-input__icon base-input__icon--right"
      />

      <button
          v-if="clearable && modelValue"
          type="button"
          class="base-input__clear"
          @click="clearInput"
      >
        <XMarkIcon class="h-4 w-4"/>
      </button>
    </div>

    <p v-if="error" class="base-input__error">
      {{ error }}
    </p>

    <p v-if="hint" class="base-input__hint">
      {{ hint }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.base-input {
  @apply flex flex-col gap-1;

  &__label {
    @apply text-sm font-medium text-gray-700;
  }

  &__required {
    @apply text-error-500 ml-1;
  }

  &__wrapper {
    @apply relative flex items-center;
  }

  &__field {
    @apply w-full rounded-lg border border-gray-300 py-2 px-4 text-gray-900 shadow-sm;
    @apply transition-colors duration-200;
    @apply placeholder:text-gray-400;

    &:focus {
      @apply border-primary-500 ring-1 ring-primary-500 outline-none;
    }

    &--error {
      @apply border-error-500;

      &:focus {
        @apply ring-error-500;
      }
    }

    &--with-left-icon {
      @apply pl-10;
    }

    &--with-right-icon {
      @apply pr-10;
    }
  }

  &__icon {
    @apply absolute h-5 w-5 text-gray-400;

    &--left {
      @apply left-3;
    }

    &--right {
      @apply right-3;
    }
  }

  &__clear {
    @apply absolute right-3 text-gray-400 hover:text-gray-500;
    @apply transition-colors duration-200;
  }

  &__error {
    @apply text-sm text-error-500;
  }

  &__hint {
    @apply text-sm text-gray-500;
  }
}
</style>