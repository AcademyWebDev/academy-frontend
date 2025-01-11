# components/common/BaseDropdown.vue
<template>
  <div class="base-dropdown" v-click-outside="close">
    <!-- Trigger -->
    <div @click="toggle" class="base-dropdown__trigger">
      <slot name="trigger" />
    </div>

    <!-- Dropdown Content -->
    <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
    >
      <div
          v-if="isOpen"
          :class="[
          'base-dropdown__content',
          `base-dropdown__content--${position}`
        ]"
      >
        <slot name="content" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  position?: 'left' | 'right'
}

withDefaults(defineProps<Props>(), {
  position: 'left'
})

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style lang="scss" scoped>
.base-dropdown {
  @apply relative inline-block;

  &__trigger {
    @apply cursor-pointer;
  }

  &__content {
    @apply absolute z-50 mt-2 w-56
    bg-white dark:bg-gray-800
    rounded-lg shadow-lg
    border border-gray-200 dark:border-gray-700;

    &--left {
      @apply left-0;
    }

    &--right {
      @apply right-8;
    }
  }
}
</style>