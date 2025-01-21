<script setup lang="ts">
import {ref, computed} from 'vue'
import BaseButton from "~/components/common/BaseButton.vue";
import {CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle} from "@coreui/vue/dist/esm/components/modal";
import type {Lecturer} from "~/types/grades";
import {useCourseStore} from '~/strores/courses'

const courseStore = useCourseStore()

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const updating = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)

const lecturers = ref<Lecturer[]>([
  {id: 1, name: 'Dr. Smith'},
  {id: 2, name: 'Dr. Johnson'}
])

const form = ref({
  title: '',
  code: '',
  capacity: 0,
  enrolled: 0,
  status: '',
  description: ''
})

onMounted(() => {
  if (courseStore.selectedCourse) {
    form.value = {
      title: courseStore.selectedCourse.title,
      code: courseStore.selectedCourse.code,
      capacity: courseStore.selectedCourse.capacity,
      enrolled: courseStore.selectedCourse.enrolled,
      status: courseStore.selectedCourse.status,
      description: courseStore.selectedCourse.description || ''
    }
  }
})

// Update form when selectedCourse changes
watch(
    () => courseStore.selectedCourse,
    (newCourse) => {
      if (newCourse) {
        form.value = {
          title: newCourse.title,
          code: newCourse.code,
          capacity: newCourse.capacity,
          enrolled: newCourse.enrolled,
          status: newCourse.status,
          description: newCourse.description || ''
        }
      }
    }
)

const isValid = computed(() => {
  return true
  // return form.value.title.trim() &&
  //     form.value?.code.trim() &&
  //     form.value?.capacity > 0 &&
  //     form.value?.schedule
})

const capacityWarning = computed(() => {
  if (form.value.capacity < form.value.enrolled) {
    return `Warning: New capacity (${form.value.capacity}) is less than current enrollment (${form.value.enrolled})`
  }
  return null
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!isValid.value || updating.value || !courseStore.selectedCourse) return

  updating.value = true
  try {
    await courseStore.updateCourse(courseStore.selectedCourse.id, form.value)
    emit('close')
  } finally {
    updating.value = false
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (deleting.value) return

  deleting.value = true
  try {
    // await courseStore.deleteCourse(courseStore.selectedCourse.id, form.value)
    emit('close')
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}
</script>


<template>
  <CModal
      :visible="show"
      @close="handleClose"
      size="lg"
  >
    <CModalHeader>
      <CModalTitle>Update Course</CModalTitle>
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

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select v-model="form.status" class="form-select w-full">
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <!-- Lecturer Assignment -->
          <!--          <div>-->
          <!--            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">-->
          <!--              Assigned Lecturer-->
          <!--            </label>-->
          <!--            <select v-model="form.lecturer?.id" class="form-select w-full">-->
          <!--              <option value="">Unassigned</option>-->
          <!--              <option v-for="lecturer in lecturers" :key="lecturer.id" :value="lecturer.id">-->
          <!--                {{ lecturer.name }}-->
          <!--              </option>-->
          <!--            </select>-->
          <!--          </div>-->

          <!-- Description -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
                v-model="form.description"
                rows="3"
                class="form-textarea w-full"
            ></textarea>
          </div>
        </div>

        <!-- Warning for capacity -->
        <div
            v-if="capacityWarning"
            class="text-sm text-error-600 dark:text-error-400"
        >
          {{ capacityWarning }}
        </div>
      </form>
    </CModalBody>

    <CModalFooter>
      <div class="flex justify-between w-full">
        <!-- Delete Button (Left side) -->
        <BaseButton
            variant="danger"
            :loading="deleting"
            @click="confirmDelete"
        >
          Delete Course
        </BaseButton>

        <!-- Action Buttons (Right side) -->
        <div class="flex gap-3">
          <BaseButton
              variant="outline"
              @click="handleClose"
          >
            Cancel
          </BaseButton>
          <BaseButton
              variant="primary"
              :loading="updating"
              :disabled="!isValid"
              @click="handleSubmit"
          >
            Update Course
          </BaseButton>
        </div>
      </div>
    </CModalFooter>

    <CModal
        :visible="showDeleteConfirm"
        @close="showDeleteConfirm = false"
        size="sm"
    >
      <CModalHeader>
        <CModalTitle>Delete Course</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to delete this course? This action cannot be undone.
        </p>
      </CModalBody>
      <CModalFooter>
        <div class="flex justify-end gap-3">
          <BaseButton
              variant="outline"
              @click="showDeleteConfirm = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
              variant="danger"
              :loading="deleting"
              @click="handleDelete"
          >
            Delete
          </BaseButton>
        </div>
      </CModalFooter>
    </CModal>
  </CModal>
</template>

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