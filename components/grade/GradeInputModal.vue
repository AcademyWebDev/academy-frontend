<script setup lang="ts">
import {ref, computed} from 'vue'
import {MagnifyingGlassIcon} from '@heroicons/vue/24/outline'
import {CModal, CModalBody, CModalHeader, CModalTitle} from "@coreui/vue/dist/esm/components/modal";
import BaseTable from "~/components/common/BaseTable.vue";
import BaseButton from "~/components/common/BaseButton.vue";


interface Props {
  show: boolean
  gradingItem: {
    id: number
    title: string
    maxScore: number
    type: string
    date: string
  }
  students: Array<{
    id: number
    name: string
    avatar?: string
  }>
  existingGrades?: Record<number, {
    score: number
    comment?: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  existingGrades: () => ({})
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: {
    grades: Record<number, number>
    comments: Record<number, string>
  }): void
}>()

// Table columns
const columns = [
  {key: 'student', title: 'Student', width: '1/3'},
  {key: 'grade', title: 'Score', width: '1/4'},
  {key: 'comment', title: 'Comment'},
  {key: 'status', title: 'Status', width: '24'}
]

// State
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const filter = ref('all')
const grades = ref<Record<number, number>>({})
const comments = ref<Record<number, string>>({})
const initialGrades = ref<Record<number, number>>({})

// Initialize grades and comments from existing data
onMounted(() => {
  if (props.existingGrades) {
    Object.entries(props.existingGrades).forEach(([studentId, data]) => {
      const id = Number(studentId)
      grades.value[id] = data.score
      comments.value[id] = data.comment || ''
    })
    // Store initial state for change detection
    initialGrades.value = {...grades.value}
  }
})

// Computed
const filteredStudents = computed(() => {
  let filtered = props.students

  // Search filter
  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query)
    )
  }

  // Status filter
  switch (filter.value) {
    case 'graded':
      filtered = filtered.filter(student => grades.value[student.id] !== undefined)
      break
    case 'pending':
      filtered = filtered.filter(student => grades.value[student.id] === undefined)
      break
  }

  return filtered
})

const gradedCount = computed(() =>
    Object.keys(grades.value).length
)

const averageScore = computed(() => {
  if (gradedCount.value === 0) return 0

  const total = Object.values(grades.value).reduce((sum, score) => sum + score, 0)
  const percentage = (total / (gradedCount.value * props.gradingItem.maxScore)) * 100
  return Math.round(percentage)
})

const hasChanges = computed(() => {
  return JSON.stringify(grades.value) !== JSON.stringify(initialGrades.value)
})

// Methods
const calculatePercentage = (score: number) => {
  return Math.round((score / props.gradingItem.maxScore) * 100)
}

const checkGrade = (studentId: number) => {
  // Ensure grade doesn't exceed max score
  if (grades.value[studentId] > props.gradingItem.maxScore) {
    grades.value[studentId] = props.gradingItem.maxScore
  }
  // Ensure grade isn't negative
  if (grades.value[studentId] < 0) {
    grades.value[studentId] = 0
  }
}

const saveGrades = async () => {
  saving.value = true
  try {
    await emit('save', {
      grades: grades.value,
      comments: comments.value
    })
    initialGrades.value = {...grades.value}
  } finally {
    saving.value = false
  }
}

// Reset on close
watch(() => props.show, (newVal) => {
  if (!newVal) {
    search.value = ''
    filter.value = 'all'
  }
})
</script>


<template>
  <CModal
      :visible="show"
      @close="$emit('close')"
      size="xl"
  >
    <CModalHeader>
      <CModalTitle class="flex items-center gap-2">
        <div>{{ gradingItem.title }}</div>
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
          (Max Score: {{ gradingItem.maxScore }})
        </span>
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
      <div class="space-y-6">
        <!-- Summary Stats -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
            <div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ students.length }}
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">Graded</div>
            <div class="text-2xl font-semibold text-green-600 dark:text-green-400">
              {{ gradedCount }}
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
            <div class="text-2xl font-semibold text-primary-600 dark:text-primary-400">
              {{ averageScore }}%
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
            <div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {{ students.length - gradedCount }}
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <input
                  type="text"
                  v-model="search"
                  placeholder="Search students..."
                  class="form-input pl-10"
              >
              <MagnifyingGlassIcon class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            </div>
            <select v-model="filter" class="form-select">
              <option value="all">All Students</option>
              <option value="graded">Graded</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <BaseButton
              :disabled="!hasChanges"
              variant="primary"
              :loading="saving"
              @click="saveGrades"
          >
            Save Changes
          </BaseButton>
        </div>

        <BaseTable
            :columns="columns"
            :loading="loading"
        >
          <tr
              v-for="student in filteredStudents"
              :key="student.id"
              class="base-table__tr"
          >
            <td class="base-table__td">
              <div class="flex items-center gap-3">
                <img
                    :src="student.avatar || '/default-avatar.jpg'"
                    :alt="student.name"
                    class="h-8 w-8 rounded-full object-cover"
                >
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">
                    {{ student.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    ID: {{ student.id }}
                  </div>
                </div>
              </div>
            </td>
            <td class="base-table__td">
              <div class="flex items-center gap-4">
                <input
                    type="number"
                    v-model.number="grades[student.id]"
                    :max="gradingItem.maxScore"
                    min="0"
                    class="form-input w-24"
                    @input="checkGrade(student.id)"
                >
                <div v-if="grades[student.id] !== undefined" class="text-sm">
                  ({{ calculatePercentage(grades[student.id]) }}%)
                </div>
              </div>
            </td>
            <td class="base-table__td">
              <input
                  type="text"
                  v-model="comments[student.id]"
                  placeholder="Add comment..."
                  class="form-input w-full"
              >
            </td>
            <td class="base-table__td">
              <span
                  :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                  grades[student.id] !== undefined
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                ]"
              >
                {{ grades[student.id] !== undefined ? 'Graded' : 'Pending' }}
              </span>
            </td>
          </tr>
        </BaseTable>
      </div>
    </CModalBody>
  </CModal>
</template>

<style lang="scss" scoped>
.form-input,
.form-select {
  @apply rounded-lg border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  shadow-sm transition-colors duration-200;

  @apply focus:border-primary-500 dark:focus:border-primary-400
  focus:ring-primary-500 dark:focus:ring-primary-400;
}
</style>