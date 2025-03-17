<template>
  <div class="p-5">
    <FileUpload multiple maxFiles="2" :supportedFiles="'PDF'" :maxFileSize="10" uploadLabelBtn="Generate" />
  </div>
</template>
<script setup>
import { onMounted } from 'vue';

async function testAPI() {
  const res = await fetch('/digital-permits/api/points')

  const data = res.json()

  console.log('data', data)
}

onMounted(() => {
  testAPI()
})
</script>