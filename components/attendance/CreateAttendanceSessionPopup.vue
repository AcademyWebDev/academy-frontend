<script setup lang="ts">
import {ref, computed} from 'vue'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/vue'
import {useAttendanceStore} from '~/strores/attendance'
import BaseButton from "~/components/common/BaseButton.vue";

interface Props {
  show: boolean
  lecturerCourses?: Array<{
    id: number
    title: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  lecturerCourses: () => []
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const attendanceStore = useAttendanceStore()

const formData = ref({
  courseId: '',
  startTime: '',
  requireLocation: false
})

const isValid = computed(() => {
  return formData.value.courseId && formData.value.startTime
})

const minDateTime = computed(() => {
  const now = new Date()
  return now.toISOString().slice(0, 16)
})

// Methods
const handleSubmit = async () => {
  if (!isValid.value) return

  try {
    await attendanceStore.createSession({
      courseId: Number(formData.value.courseId),
      startTime: formData.value.startTime,
      requireLocation: formData.value.requireLocation
    })
    emit('close')
  } catch (error) {
    console.error('Failed to create session:', error)
  }
}

watch(() => props.show, (newValue) => {
  if (!newValue) {
    formData.value = {
      courseId: '',
      startTime: '',
      requireLocation: false
    }
  }
})
</script>

<template>
  <CModal
      :visible="show"
      @close="$emit('close')"
      size="lg"
      :backdrop="true"
  >
    <CModalHeader>
      <CModalTitle>Create Attendance Session</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course
          </label>
          <select
              v-model="formData.courseId"
              class="filters-dropdown__select"
          >
            <option value="" disabled>Select a course</option>
            <option
                v-for="course in lecturerCourses"
                :key="course.id"
                :value="course.id"
            >
              {{ course.title }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time
          </label>
          <input
              v-model="formData.startTime"
              type="datetime-local"
              class="filters-dropdown__select"
              :min="minDateTime"
          >
        </div>

        <div class="flex items-center gap-2">
          <input
              v-model="formData.requireLocation"
              type="checkbox"
              class="form-checkbox rounded text-primary-600 dark:text-primary-400"
          >
          <label class="text-sm text-gray-700 dark:text-gray-300">
            Require on-campus location
          </label>
        </div>
      </div>
    </CModalBody>
    <CModalFooter>
      <div class="flex justify-end gap-3">
        <BaseButton
            variant="outline"
            @click="$emit('close')"
        >
          Cancel
        </BaseButton>
        <BaseButton
            variant="primary"
            :loading="attendanceStore.creatingSession"
            :disabled="!isValid"
            @click="handleSubmit"
        >
          Create Session
        </BaseButton>
      </div>
    </CModalFooter>
  </CModal>
</template>

<style lang="scss" scoped>
.filters-dropdown__select {
  @apply block w-full rounded-md
  border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  shadow-sm transition-colors duration-200;

  @apply focus:border-primary-500 dark:focus:border-primary-400
  focus:ring-primary-500 dark:focus:ring-primary-400;
}
</style>