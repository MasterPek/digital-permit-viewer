<template>
  <div>
    <DrawerWebmap v-model="isDrawerOpen">
      <template #default="{ drawerTitle }">
        <div v-if="drawerTitle === 'Permit'">
          <p>Permit</p>
        </div>
      </template>
    </DrawerWebmap>
  </div>
</template>

<script setup>
import AuthACC from '../auth/AuthACC.vue';
</script>

<style scoped>
/* Add your styles here */
</style>