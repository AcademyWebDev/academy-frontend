<script setup lang="ts">
import {ref, reactive} from 'vue'
import {z} from 'zod'
import {UserIcon, AcademicCapIcon} from '@heroicons/vue/24/outline'
import {useAuthStore} from '~/strores/auth'
import {useFormValidation} from '~/composables/useFormValidation'
import BaseButton from "~/components/common/BaseButton.vue";
import BaseInput from "~/components/common/BaseInput.vue";

// Form validation schema
const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  passwordConfirmation: z.string(),
  role: z.enum(['student', 'lecturer'], {
    required_error: 'Please select your role',
  }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({message: 'You must accept the terms and conditions'}),
  }),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
})

// Form state
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  role: 'student' as const,
  acceptTerms: false,
})

const loading = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const {validate, getError, isValid} = useFormValidation(signupSchema)

const handleSubmit = async () => {
  if (!validate(formData)) return

  loading.value = true
  try {
    await authStore.register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    })
    router.push('/dashboard')
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})
</script>

<template>
  <div class="signup-page">
    <div class="signup-page__header">
      <img
          src="/logo.svg"
          alt="KD Academy Logo"
          class="signup-page__logo"
      >
      <h1 class="signup-page__title">
        Create your account
      </h1>
      <p class="signup-page__subtitle">
        Join KD Academy to start your learning journey
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="signup-page__form">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <BaseInput
              v-model="formData.firstName"
              label="First Name"
              :error="getError('firstName')"
              required
              autocomplete="given-name"
          />

          <BaseInput
              v-model="formData.lastName"
              label="Last Name"
              :error="getError('lastName')"
              required
              autocomplete="family-name"
          />
        </div>

        <BaseInput
            v-model="formData.email"
            type="email"
            label="Email Address"
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
            autocomplete="new-password"
        />

        <BaseInput
            v-model="formData.passwordConfirmation"
            type="password"
            label="Confirm Password"
            :error="getError('passwordConfirmation')"
            required
            autocomplete="new-password"
        />

        <!-- Role Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">I am a:</label>
          <div class="grid grid-cols-2 gap-4">
            <button
                type="button"
                @click="formData.role = 'student'"
                :class="[
                'signup-page__role-btn',
                { 'signup-page__role-btn--active': formData.role === 'student' }
              ]"
            >
              <UserIcon class="w-5 h-5"/>
              <span>Student</span>
            </button>

            <button
                type="button"
                @click="formData.role = 'lecturer'"
                :class="[
                'signup-page__role-btn',
                { 'signup-page__role-btn--active': formData.role === 'lecturer' }
              ]"
            >
              <AcademicCapIcon class="w-5 h-5"/>
              <span>Lecturer</span>
            </button>
          </div>
          <p v-if="getError('role')" class="text-sm text-error-600">
            {{ getError('role') }}
          </p>
        </div>

        <!-- Terms and Conditions -->
        <div class="space-y-2">
          <label class="signup-page__checkbox">
            <input
                type="checkbox"
                v-model="formData.acceptTerms"
                class="form-checkbox rounded text-primary-600"
            >
            <span class="text-sm text-gray-600">
              I agree to the
              <NuxtLink to="/" class="text-primary-600 hover:text-primary-500">
                Terms of Service
              </NuxtLink>
              and
              <NuxtLink to="/" class="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </NuxtLink>
            </span>
          </label>
          <p v-if="getError('acceptTerms')" class="text-sm text-error-600">
            {{ getError('acceptTerms') }}
          </p>
        </div>
      </div>

      <BaseButton
          type="submit"
          :loading="loading"
          :disabled="!isValid || loading"
          class="w-full mt-6"
      >
        Create Account
      </BaseButton>

      <!-- Sign In Link -->
      <p class="signup-page__signin">
        Already have an account?
        <NuxtLink
            to="/login"
            class="text-primary-600 hover:text-primary-500"
        >
          Sign in
        </NuxtLink>
      </p>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.signup-page {
  @apply w-full max-w-md;

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
    @apply space-y-6;
  }

  &__role-btn {
    @apply flex items-center justify-center gap-2 p-3 border-2 rounded-lg
    transition-all duration-200 hover:border-primary-200;

    &--active {
      @apply border-primary-600 bg-primary-50 text-primary-700;
    }
  }

  &__checkbox {
    @apply flex items-center gap-2;

    input[type="checkbox"] {
      @apply rounded border-gray-300 text-primary-600
      focus:ring-primary-500;
    }
  }

  &__signin {
    @apply mt-6 text-center text-sm text-gray-500;
  }
}
</style>