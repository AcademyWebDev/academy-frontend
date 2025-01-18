<script setup lang="ts">
import {ref, computed} from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import {useGradesStore} from '~/strores/grade'
import {CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle} from "@coreui/vue/dist/esm/components/modal";
import BaseButton from "~/components/common/BaseButton.vue";

const props = defineProps<{
  grade: any
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

// Store
const gradesStore = useGradesStore()

// State
const showAddItemForm = ref(false)
const editingItem = ref<any>(null)
const publishing = ref(false)

// Constants
const gradeTypes = ['quiz', 'assignment', 'midterm', 'final', 'project']

// Form state
const itemForm = ref({
  type: 'quiz',
  score: 0,
  maxScore: 100,
  weight: 0,
  date: new Date().toISOString().split('T')[0],
  comment: ''
})

// Computed
const isValidForm = computed(() => {
  const form = itemForm.value
  return (
      form.type &&
      form.score >= 0 &&
      form.score <= form.maxScore &&
      form.maxScore > 0 &&
      form.weight > 0 &&
      form.weight <= 100 &&
      form.date
  )
})

// Methods
const formatGradeType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const editItem = (item: any) => {
  editingItem.value = item
  itemForm.value = {...item}
  showAddItemForm.value = false
}

const deleteItem = async (itemId: number) => {
  // Implement delete functionality
  if (!confirm('Are you sure you want to delete this grade item?')) return

  try {
    // await gradesStore.deleteGradeItem(props.grade.id, itemId)
    emit('save')
  } catch (error) {
    console.error('Failed to delete grade item:', error)
  }
}

const saveItem = async () => {
  try {
    if (editingItem.value) {
      await gradesStore.updateGradeItem(
          props.grade.courseId,
          editingItem.value.id,
          itemForm.value
      )
    } else {
      await gradesStore.addGradeItem(props.grade.courseId, itemForm.value)
    }

    cancelItemForm()
    emit('save')
  } catch (error) {
    console.error('Failed to save grade item:', error)
  }
}

const cancelItemForm = () => {
  showAddItemForm.value = false
  editingItem.value = null
  itemForm.value = {
    type: 'quiz',
    score: 0,
    maxScore: 100,
    weight: 0,
    date: new Date().toISOString().split('T')[0],
    comment: ''
  }
}

const publishGrades = async () => {
  publishing.value = true
  try {
    await gradesStore.publishGrades(props.grade.courseId)
    emit('save')
    emit('close')
  } catch (error) {
    console.error('Failed to publish grades:', error)
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <CModal
      :visible="show"
      @close="$emit('close')"
      size="xl"
  >
    <CModalHeader>
      <CModalTitle>Manage Grades - {{ grade?.courseName }}</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="space-y-6">
        <!-- Grade Items Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="grades-page__th">Type</th>
              <th class="grades-page__th">Score</th>
              <th class="grades-page__th">Max Score</th>
              <th class="grades-page__th">Weight (%)</th>
              <th class="grades-page__th">Date</th>
              <th class="grades-page__th">Comments</th>
              <th class="grades-page__th">Actions</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
                v-for="item in grade?.items"
                :key="item.id"
                class="grades-page__tr"
            >
              <td class="grades-page__td">{{ formatGradeType(item.type) }}</td>
              <td class="grades-page__td">{{ item.score }}</td>
              <td class="grades-page__td">{{ item.maxScore }}</td>
              <td class="grades-page__td">{{ item.weight }}%</td>
              <td class="grades-page__td">{{ formatDate(item.date) }}</td>
              <td class="grades-page__td">{{ item.comment || '-' }}</td>
              <td class="grades-page__td">
                <div class="flex items-center gap-2">
                  <button
                      class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      @click="editItem(item)"
                  >
                    <PencilIcon class="h-4 w-4"/>
                  </button>
                  <button
                      class="text-gray-400 hover:text-error-500 dark:hover:text-error-400"
                      @click="deleteItem(item.id)"
                  >
                    <TrashIcon class="h-4 w-4"/>
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div>
          <BaseButton
              variant="outline"
              :leftIcon="PlusIcon"
              @click="showAddItemForm = true"
          >
            Add Grade Item
          </BaseButton>
        </div>

        <div v-if="showAddItemForm || editingItem" class="space-y-4 border-t pt-4">
          <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">
            {{ editingItem ? 'Edit Grade Item' : 'Add New Grade Item' }}
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                  v-model="itemForm.type"
                  class="filters-dropdown__select"
              >
                <option v-for="type in gradeTypes" :key="type" :value="type">
                  {{ formatGradeType(type) }}
                </option>
              </select>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                  v-model="itemForm.date"
                  type="date"
                  class="filters-dropdown__select"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Score
              </label>
              <input
                  v-model.number="itemForm.score"
                  type="number"
                  min="0"
                  :max="itemForm.maxScore"
                  class="filters-dropdown__select"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Score
              </label>
              <input
                  v-model.number="itemForm.maxScore"
                  type="number"
                  min="0"
                  class="filters-dropdown__select"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight (%)
              </label>
              <input
                  v-model.number="itemForm.weight"
                  type="number"
                  min="0"
                  max="100"
                  class="filters-dropdown__select"
              >
            </div>

            <!-- Comments -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comments
              </label>
              <textarea
                  v-model="itemForm.comment"
                  rows="2"
                  class="filters-dropdown__select"
              ></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3">
            <BaseButton
                variant="outline"
                @click="cancelItemForm"
            >
              Cancel
            </BaseButton>
            <BaseButton
                variant="primary"
                :disabled="!isValidForm"
                @click="saveItem"
            >
              {{ editingItem ? 'Update' : 'Add' }} Item
            </BaseButton>
          </div>
        </div>
      </div>
    </CModalBody>
    <CModalFooter>
      <div class="w-full flex justify-between items-center">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {{ formatDate(grade?.lastUpdated) }}
        </div>
        <div class="flex gap-3">
          <BaseButton
              variant="outline"
              @click="$emit('close')"
          >
            Close
          </BaseButton>
          <BaseButton
              v-if="grade?.status === 'draft'"
              variant="primary"
              :loading="publishing"
              @click="publishGrades"
          >
            Publish Grades
          </BaseButton>
        </div>
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