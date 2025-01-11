# layouts/auth.vue
<template>
  <div class="auth-layout">
    <!-- Left Side - Image/Brand -->
    <div class="auth-layout__brand">
      <div class="auth-layout__brand-content">
        <img
            src="/logo.svg"
            alt="KD Academy"
            class="auth-layout__logo"
        >
        <h1 class="auth-layout__title">
          Transform Your Learning Journey
        </h1>
        <p class="auth-layout__subtitle">
          Join KD Academy's digital ecosystem for an enhanced educational experience
        </p>
      </div>

      <div class="auth-layout__pattern"/>
    </div>

    <div class="auth-layout__content">
      <div class="auth-layout__container">
        <slot/>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-layout {
  @apply flex min-h-screen;

  &__brand {
    @apply hidden lg:flex lg:w-1/2 relative bg-primary-600;
    align-items: center;
    justify-content: center;
  }

  &__brand-content {
    @apply relative z-10 flex flex-col items-center justify-center h-full px-12 text-center;
  }

  &__logo {
    @apply w-48 h-auto mb-8;
  }

  &__title {
    @apply text-3xl font-bold text-white mb-4;
  }

  &__subtitle {
    @apply text-lg text-primary-100 max-w-md;
  }

  &__pattern {
    @apply absolute inset-0 bg-primary-700 opacity-50;
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  }

  &__content {
    @apply flex flex-col justify-center w-full lg:w-1/2 px-4 sm:px-6 lg:px-8;
  }

  &__container {
    @apply w-full max-w-md mx-auto;
  }
}
</style>