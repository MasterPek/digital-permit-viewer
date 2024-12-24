<template>
  <div class="topbar">
    <p>Forms</p>
    <Avatar :label="avatarLabel" shape="circle" v-tooltip="`${avatarTooltip}`" />
  </div>
  <div class="m-2">
    <PanelMenu :model="items" />
  </div>
</template>

<script setup>
import { accForms, accMe } from '@/service/acc.service';
import { onMounted, ref } from 'vue';

const avatarLabel = ref('');
const avatarTooltip = ref('');

const forms = ref([]);
const items = ref([]);

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

const fetchForms = async () => {
 try {
  const res = await accForms();

  const data = await res.json();
  forms.value = data.data;
  console.log("Forms:", forms.value);

  items.value = forms.value.map((form) => {
    return {
      label: form.name,
      // icon: 'pi pi-fw pi-id-card',
      command: () => {
        console.log("Form:", form.id, form.name);
      },
    };
  });

  return data;
 } catch (error) {
  console.error("Error fetching forms:", error);
 }
}

onMounted(() => {
  fetchForms();
  fetchMe();
})

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
  position: sticky; /* Keeps the bar fixed at the top */
  top: 0;
  z-index: 10;
}
</style>