<template>
  <CModal
      :visible="show"
      @close="handleClose"
      size="lg"
  >
    <CModalHeader>
      <CModalTitle>Create New Course</CModalTitle>
    </CModalHeader>

    <CModalBody>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <!-- Course Title -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course Title
            </label>
            <input
                v-model="form.title"
                type="text"
                placeholder="e.g., Introduction to Programming"
                class="form-input w-full"
            >
          </div>

          <!-- Course Code -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course Code
            </label>
            <input
                v-model="form.code"
                type="text"
                placeholder="e.g., CS101"
                class="form-input w-full"
            >
          </div>

          <!-- Capacity -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Capacity
            </label>
            <input
                v-model.number="form.capacity"
                type="number"
                min="1"
                class="form-input w-full"
            >
          </div>

          <!-- Term -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Term
            </label>
            <select v-model="form.term" class="form-select w-full">
              <option value="Fall 2024">Fall 2024</option>
              <option value="Spring 2025">Spring 2025</option>
              <option value="Summer 2025">Summer 2025</option>
            </select>
          </div>

          <!-- Schedule -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Schedule
            </label>
            <select v-model="form.schedule" class="form-select w-full">
              <option value="Mon/Wed 09:00-10:30">Mon/Wed 09:00-10:30</option>
              <option value="Mon/Wed 11:00-12:30">Mon/Wed 11:00-12:30</option>
              <option value="Tue/Thu 09:00-10:30">Tue/Thu 09:00-10:30</option>
              <option value="Tue/Thu 11:00-12:30">Tue/Thu 11:00-12:30</option>
            </select>
          </div>

          <!-- Description -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
                v-model="form.description"
                rows="3"
                class="form-textarea w-full"
                placeholder="Brief description of the course..."
            ></textarea>
          </div>
        </div>
      </form>
    </CModalBody>

    <CModalFooter>
      <div class="flex justify-end gap-3">
        <BaseButton
            variant="outline"
            @click="handleClose"
        >
          Cancel
        </BaseButton>
        <BaseButton
            variant="primary"
            :disabled="!isValid"
            :loading="loading"
            @click="handleSubmit"
        >
          Create Course
        </BaseButton>
      </div>
    </CModalFooter>
  </CModal>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import BaseButton from "~/components/common/BaseButton.vue";
import {CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle} from "@coreui/vue/dist/esm/components/modal";

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', data: any): void
}>()

// Form state
const loading = ref(false)
const form = ref({
  title: '',
  code: '',
  capacity: 30,
  term: 'Fall 2024',
  schedule: '',
  description: ''
})

// Computed
const isValid = computed(() => {
  return form.value.title.trim() &&
      form.value.code.trim() &&
      form.value.capacity > 0 &&
      form.value.term &&
      form.value.schedule
})

// Methods
const handleClose = () => {
  form.value = {
    title: '',
    code: '',
    capacity: 30,
    term: 'Fall 2024',
    schedule: '',
    description: ''
  }
  emit('close')
}

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return

  loading.value = true
  try {
    emit('create', {...form.value})
    handleClose()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-input,
.form-select,
.form-textarea {
  @apply rounded-md border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-gray-100
  shadow-sm;

  @apply focus:ring-primary-500 dark:focus:ring-primary-400
  focus:border-primary-500 dark:focus:border-primary-400;
}

.form-textarea {
  @apply resize-none;
}
</style>