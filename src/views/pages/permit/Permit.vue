<template>
  <div>
    <p>testing</p>
  </div>
</template>

<script setup>
import { accForms } from '@/service/acc.service';
import { onMounted } from 'vue';

const fetchForms = async () => {
 try {
  const res = await accForms();

  const data = await res.json();
  console.log("Forms Data:", data);

  return data;
 } catch (error) {
  console.error("Error fetching forms:", error);
 }
}

onMounted(() => {
  fetchForms();
})

</script>
<style scoped>
/* Add your styles here */
</style>