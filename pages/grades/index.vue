<template>
  <div class="p-6">
    <LecturerGradeView v-if="isLecturer"/>
    <StudentGradeView v-else :student-id="authStore.user?.id"/>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useAuthStore} from '~/strores/auth'
import LecturerGradeView from "~/components/grade/LecturerGradeView.vue";
import StudentGradeView from "~/components/grade/StudentGradeView.vue";

const authStore = useAuthStore()
const isLecturer = computed(() => authStore.isLecturer || authStore.isAdmin)

definePageMeta({
  middleware: ['auth']
})
</script>