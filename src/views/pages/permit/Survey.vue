
<template>
  <Card style="width: 25rem; overflow: hidden">
      <template #header>
          <img alt="user header" src="https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL21hcHMuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo4Mjh9fX0=" />
      </template>
      <template #title>Advanced Card</template>
      <template #subtitle>Card subtitle</template>
      <template #content>
        <p>cards</p>
      </template>
      <template #footer>
          <div class="flex gap-4 mt-1">
              <Button label="Cancel" severity="secondary" outlined class="w-full" />
              <Button label="Save" class="w-full" />
          </div>
      </template>
  </Card>
  <Image src="https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL21hcHMuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo4Mjh9fX0="
  alt="Image" width="250" preview />
  <div class="card">
    <AuthACC />
  </div>
</template>

<script setup>
import AuthACC from '../auth/AuthACC.vue';
</script>
