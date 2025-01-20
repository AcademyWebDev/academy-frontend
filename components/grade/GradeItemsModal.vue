<template>
  <CModal
      :visible="show"
      @close="handleClose"
      size="lg"
  >
    <CModalHeader>
      <CModalTitle>
        Grade Items - {{ course.name }}
      </CModalTitle>
    </CModalHeader>

    <CModalBody>
      <div class="space-y-6">
        <!-- Current Grade Items Table -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Current Items
            </h3>
            <BaseButton
                v-if="!showForm"
                variant="primary"
                size="sm"
                :leftIcon="PlusIcon"
                @click="startAdd"
            >
              Add Item
            </BaseButton>
          </div>

          <!-- Grade Items Form (Add/Edit) -->
          <div v-if="showForm" class="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                    v-model="form.name"
                    type="text"
                    placeholder="e.g., Quiz 1, Midterm Exam"
                    class="form-input w-full"
                >
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Score
                  </label>
                  <input
                      v-model.number="form.maxScore"
                      type="number"
                      min="0"
                      class="form-input w-full"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weight (%)
                  </label>
                  <input
                      v-model.number="form.weight"
                      type="number"
                      min="0"
                      max="100"
                      class="form-input w-full"
                  >
                </div>
              </div>

              <!-- Warning for total weight -->
              <div
                  v-if="totalWeightWarning"
                  class="text-sm text-error-600 dark:text-error-400"
              >
                {{ totalWeightWarning }}
              </div>

              <div class="flex justify-end gap-2">
                <BaseButton
                    variant="outline"
                    size="sm"
                    @click="cancelForm"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                    variant="primary"
                    size="sm"
                    :disabled="!isValidForm"
                    :loading="saving"
                    type="submit"
                >
                  {{ editingItem ? 'Update' : 'Add' }} Item
                </BaseButton>
              </div>
            </form>
          </div>

          <!-- Items Table -->
          <div class="border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200  dark:divide-gray-700">
              <thead>
              <tr class="bg-gray-50 dark:bg-gray-700">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Max Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Weight
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                  v-for="item in sortedItems"
                  :key="item.id"
                  class="hover:bg-gray-50 dark:bg-gray-700"
              >
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ item.name }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ item.maxScore }}
                  </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                               bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
                      {{ item.weight }}%
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end items-center gap-2">
                    <button
                        class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        @click="startEdit(item)"
                    >
                      <PencilIcon class="h-4 w-4"/>
                    </button>
                    <button
                        class="text-gray-400 hover:text-error-500 dark:hover:text-error-400"
                        @click="confirmDelete(item)"
                    >
                      <TrashIcon class="h-4 w-4"/>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Total Weight Row -->
              <tr class="bg-gray-50 dark:bg-gray-700">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                  Total
                </td>
                <td class="px-6 py-4"></td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                               bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
                      {{ totalWeight }}%
                    </span>
                </td>
                <td class="px-6 py-4"></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CModalBody>

    <CModalFooter>
      <BaseButton
          variant="outline"
          @click="handleClose"
      >
        Close
      </BaseButton>
    </CModalFooter>

    <!-- Delete Confirmation Modal -->
    <CModal
        :visible="!!itemToDelete"
        @close="itemToDelete = null"
        size="sm"
    >
      <CModalHeader>
        <CModalTitle>Delete Grade Item</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to delete "{{ itemToDelete.name }}"? This will also delete all associated grades and
          cannot be undone.
        </p>
      </CModalBody>
      <CModalFooter>
        <div class="flex justify-end gap-3">
          <BaseButton
              variant="outline"
              @click="itemToDelete = null"
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

<script setup lang="ts">
import {ref, computed} from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import BaseButton from "~/components/common/BaseButton.vue";
import {CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle} from "@coreui/vue/dist/esm/components/modal";

const props = defineProps<{
  show: boolean
  course: {
    id: number
    name: string
    gradeItems: Array<{
      id: number
      name: string
      maxScore: number
      weight: number
    }>
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', data: { name: string; maxScore: number; weight: number }): void
  (e: 'update', id: number, data: { name: string; maxScore: number; weight: number }): void
  (e: 'delete', id: number): void
}>()

// State
const showForm = ref(false)
const editingItem = ref<number | null>(null)
const itemToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)

const form = ref({
  name: '',
  maxScore: 100,
  weight: 0
})

// Computed
const sortedItems = computed(() => {
  return [...props.course.gradeItems].sort((a, b) => a.name.localeCompare(b.name))
})

const totalWeight = computed(() => {
  return props.course.gradeItems.reduce((sum, item) => sum + item.weight, 0)
})

const totalWeightWarning = computed(() => {
  const total = totalWeight.value + (editingItem.value ? 0 : form.value.weight)
  if (total > 100) return `Warning: Total weight will exceed 100% (${total}%)`
  return null
})

const isValidForm = computed(() => {
  return form.value.name.trim() &&
      form.value.maxScore > 0 &&
      form.value.weight > 0 &&
      form.value.weight <= 100
})

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    maxScore: 100,
    weight: 0
  }
  editingItem.value = null
}

const startAdd = () => {
  resetForm()
  showForm.value = true
}

const startEdit = (item: any) => {
  form.value = {...item}
  editingItem.value = item.id
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!isValidForm.value || saving.value) return

  saving.value = true
  try {
    if (editingItem.value) {
      await emit('update', editingItem.value, form.value)
    } else {
      await emit('add', form.value)
    }
    showForm.value = false
    resetForm()
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item: any) => {
  itemToDelete.value = item
}

const handleDelete = async () => {
  if (!itemToDelete.value || deleting.value) return

  deleting.value = true
  try {
    await emit('delete', itemToDelete.value.id)
    itemToDelete.value = null
  } finally {
    deleting.value = false
  }
}

const handleClose = () => {
  showForm.value = false
  resetForm()
  emit('close')
}
</script>

<style lang="scss" scoped>
.form-input {
  @apply rounded-md border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-gray-100
  shadow-sm;

  @apply focus:ring-primary-500 dark:focus:ring-primary-400
  focus:border-primary-500 dark:focus:border-primary-400;
}
</style>