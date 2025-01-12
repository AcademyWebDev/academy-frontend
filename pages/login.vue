<script setup lang="ts">
import {ref, reactive} from 'vue'
import {definePageMeta} from '#imports'
import {z} from 'zod'
import {useFormValidation} from '~/composables/useFormValidation'
import {useAuthStore} from "~/strores/auth";
import BaseInput from "~/components/common/BaseInput.vue";
import BaseButton from "~/components/common/BaseButton.vue";

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

const formData = reactive({
  email: '',
  password: ''
})

const authStore = useAuthStore()
const router = useRouter()

const {validate, getError, isValid} = useFormValidation(loginSchema)

const handleSubmit = async () => {
  if (!validate(formData)) return

  try {
    await authStore.login(formData.email, formData.password)
    navigateTo('/courses')
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/courses')
  }
})

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
</script>

<template>
  <div class="login-page">
    <div class="login-page__container">
      <div class="login-page__content">
        <!-- Logo and Title -->
        <div class="login-page__header">
          <img
              src="/logo.svg"
              alt="KD Academy Logo"
              class="login-page__logo"
          >
          <h1 class="login-page__title">
            Welcome to KD Academy
          </h1>
          <p class="login-page__subtitle">
            Sign in to access your learning dashboard
          </p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="login-page__form">
          <BaseInput
              v-model="formData.email"
              type="email"
              label="Email"
              :error="getError('email')"
              required
              autocomplete="email"
          />

          <BaseInput
              v-model="formData.password"
              type="password"
              label="Password"
              :error="getError('password')"
              required
              autocomplete="current-password"
          />

          <BaseButton
              type="submit"
              :loading="authStore.loading"
              :disabled="!isValid || authStore.loading"
              class="w-full"
          >
            Sign In
          </BaseButton>
        </form>

        <!-- Sign Up Link -->
        <p class="login-page__signup">
          Don't have an account?
          <NuxtLink
              to="/register"
              class="text-primary-600 hover:text-primary-500"
          >
            Sign up
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  @apply min-h-screen flex items-center justify-center bg-gray-50;

  &__container {
    @apply w-full max-w-md px-6 py-12;
  }

  &__content {
    @apply bg-white rounded-2xl shadow-xl p-8;
  }

  &__header {
    @apply text-center mb-8;
  }

  &__logo {
    @apply h-12 w-auto mx-auto mb-4;
  }

  &__title {
    @apply text-2xl font-bold text-gray-900 mb-2;
  }

  &__subtitle {
    @apply text-gray-500;
  }

  &__form {
    @apply space-y-6 mb-6;
  }

  &__remember {
    @apply flex items-center justify-between mb-6;
  }

  &__divider {
    @apply relative my-6;

    &::before {
      content: '';
      @apply absolute inset-0 flex items-center;

      &::before {
        content: '';
        @apply w-full border-t border-gray-200;
      }
    }

    &-text {
      @apply relative bg-white px-4 text-sm text-gray-500;
    }
  }

  &__social {
    @apply space-y-4 mb-6;
  }

  &__signup {
    @apply text-center text-sm text-gray-500;
  }
}
</style>