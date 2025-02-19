
<template>
  <div class="card">
    <AuthACC />
  </div>
</template>

<script setup>
import AuthACC from '../auth/AuthACC.vue';
import { onMounted, ref } from 'vue';

const testUser = ref(null);
const fetchUsers = async () => {
  const res = await fetch('/dpapi/annotations/', {
    headers: {
      Accept: 'application/json'
    }

  })

  const data = await res.json()
  testUser.value = data

  console.log('sdssd', testUser.value);
  
};

onMounted(async() => {
  await fetchUsers();
})
</script>
