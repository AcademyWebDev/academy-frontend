# components/common/BaseDropdown.vue
<template>
  <div class="base-dropdown" v-click-outside="close">
    <!-- Trigger -->
    <div @click="toggle" class="base-dropdown__trigger">
      <slot name="trigger"/>
    </div>

    <!-- Dropdown Content -->
    <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
    >
      <div
          v-if="isOpen"
          :class="[
          'base-dropdown__content',
          `base-dropdown__content--${placement}`
        ]"
      >
        <slot name="content"/>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom'
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
    @apply absolute z-50 min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg
    border border-gray-200 dark:border-gray-700 overflow-hidden;

    &--bottom {
      @apply top-full mt-2 left-0;
    }

    &--top {
      @apply bottom-full mb-2 left-0;
    }

    &--left {
      @apply right-full mr-2 top-0;
    }

    &--right {
      @apply left-full ml-2 top-0;
    }
  }
}
</style>