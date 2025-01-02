<template>
  <div class="topbar">
    <p>Forms</p>
    <Avatar :label="avatarLabel" shape="circle" v-tooltip="`${avatarTooltip}`" />
  </div>
  <div class="m-2">
    <PanelMenu :model="menuItems">
      <template #item="{ item }">
        <a v-ripple class="flex items-center px-4 py-2 cursor-pointer group">
          <!-- Icon -->
          <div class="flex flex-col w-full">
            <span :class="[{ 'font-semibold': item.items }]">{{ item.label }}</span>
  
            <div class="flex justify-between items-center">
              <span v-if="item.approvalStatus" :class="statusClass(item.approvalStatus)" class="text-sm">
                {{ item.approvalStatus }}
              </span>
              <span class="text-sm" v-else>
                Not Available
              </span>

              <Button label="created by" size="small" text />
            </div>
          </div>
        </a>
      </template>
    </PanelMenu>
  </div>
</template>

<script setup>
import { accMe } from '@/service/acc.service';
import { useAccStore } from '@/store/accStore';
import { onMounted, ref, computed, watch } from 'vue';

const accStore = useAccStore();

const emit = defineEmits(['formSelected']);

const avatarLabel = ref('');
const avatarTooltip = ref('');

// Computed menu items with enriched Approval Status
const menuItems = computed(() => {
  console.log('accStore.items:', accStore.items); // Log the items from the store

  return accStore.items.map((item) => {
    if (item.form && item.form.customValues) {
      const statusField = item.form.customValues.find(
        (field) =>
          field.itemLabel &&
          field.itemLabel.toLowerCase() === 'approval status' &&
          field.valueName === 'choiceVal'
      );

      console.log('Status field found:', statusField); // Log the status field

      return {
        ...item,
        approvalStatus: statusField ? statusField.choiceVal : null,
      };
    }
    return { ...item, approvalStatus: null };
  });
});

const statusClass = (status) => {
  switch (status) {
    case 'Approved':
      return 'text-green-600 font-bold';
    case 'Pending':
      return 'text-yellow-600 font-bold';
    case 'Rejected':
      return 'text-red-600 font-bold';
    case 'On Hold':
      return 'text-orange-600 font-bold';
    case 'In Review':
      return 'text-blue-600 font-bold';
    case 'Needs Revision':
      return 'text-purple-600 font-bold';
    default:
      return 'text-gray-600 font-bold';
  }
};

watch(
  () => accStore.selectedForm,
  (newForm) => {
    if (newForm) {
      emit('formSelected', newForm);
    } else {
      console.log('No form selected');
    }
  },
  { immediate: false }
);

const fetchMe = async () => {
  try {
    const response = await accMe();
    const data = await response.json();

    const firstName = data.firstName || '';
    const lastName = data.lastName || '';

    avatarLabel.value = `${firstName.charAt(0)}${lastName.charAt(0)}`;
    avatarTooltip.value = `${firstName} ${lastName}`;
  } catch (error) {
    console.error('Error fetching ACC_ME:', error);
  }
};

const loadForms = async () => {
  await accStore.fetchForms();
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
  top: 0;
  z-index: 10;
}
</style>
