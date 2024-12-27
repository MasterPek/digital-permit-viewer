<template>
  <div class="topbar">
    <p>Forms</p>
    <Avatar :label="avatarLabel" shape="circle" v-tooltip="`${avatarTooltip}`" />
  </div>
  <div class="m-2">
    <PanelMenu :model="accStore.items" />
  </div>
</template>

<script setup>
import { accMe } from '@/service/acc.service';
import { useAccStore } from '@/store/accStore';
import { onMounted, ref, watch } from 'vue';

const accStore = useAccStore();

const avatarLabel = ref('');
const avatarTooltip = ref('');
const emit = defineEmits(['formSelected']);

// TODO currently when click permit icon the right drawer open too, open same form and close it and open same form lead to not opening the form
watch(() => accStore.selectedForm, (newForm) => {
  if (newForm) {
    console.log('Form selected in Permit:', newForm);
    emit('formSelected', newForm);
  }
}, { immediate: true });

const fetchMe = async () => {
  try {
    const response = await accMe();
    const data = await response.json();
    console.log("me Data:", data);

    const firstName = data.firstName || "";
    const lastName = data.lastName || "";

    avatarLabel.value = `${firstName.charAt(0)}${lastName.charAt(0)}`;
    avatarTooltip.value = `${firstName} ${lastName}`;

    return data;
  } catch (error) {
    console.error("Error fetching ACC_ME:", error);
  }
};

const loadForms = async () => {
  await accStore.fetchForms(); // Fetch and populate items in the store
};

onMounted(() => {
  fetchMe();
  loadForms();
});
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  box-shadow: 0 0 20px rgba(20, 20, 20, 0.1);
  position: sticky;
  /* Keeps the bar fixed at the top */
  top: 0;
  z-index: 10;
}
</style>