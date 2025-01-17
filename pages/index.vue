<script setup lang="ts">

import {CModal} from "@coreui/vue/dist/esm/components/modal";
</script>

<template>
  <div>
    <CModal
        :visible="true"
        size="lg"
        :backdrop="true"
    >
      <div>Hey</div>
    </CModal>
  </div>
</template>

<style scoped>

</style>