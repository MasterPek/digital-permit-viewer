<template>
  <div>
    <div class="topbar">
      <div>
        <Button icon="pi pi-filter" text @click="toggle" v-tooltip="'Filter'" />
      </div>
      <Avatar :label="avatarLabel" shape="circle" v-tooltip="`${avatarTooltip}`" />
    </div>
    <div class="m-2 mt-0 scroll-container" ref="scrollContainer" @scroll="handleScroll">
      <PanelMenu :model="filteredMenuItems">
        <template #item="{ item }">
          <a v-ripple class="flex items-center px-4 py-2 cursor-pointer group">
            <div class="flex flex-col w-full">
              <span :class="[{ 'font-semibold': item.items }]">{{ item.label }}</span>
              <div class="flex justify-between items-center">
                <Tag v-if="item.approvalStatus" :severity="statusClass(item.approvalStatus, 'severity')"
                  class="text-sm">
                  {{ item.approvalStatus }}
                </Tag>
                <Tag severity="secondary" class="text-sm" v-else>
                  Not Available
                </Tag>
                <Button label="created by" size="small" text />
              </div>
            </div>
          </a>
        </template>
      </PanelMenu>
      <div v-if="loading" class="text-center">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p v-if="noMoreItems" class="text-center text-gray-500 my-4">No more items to load</p>
    </div>
    <Popover ref="op">
      <div v-if="statusOptions.length > 0" class="grid grid-cols-2">
        <Tag class="cursor-pointer m-2" :severity="statusClass(status, 'severity')" v-for="status in statusOptions"
          :key="status" @click="selectStatus(status)">
          {{ status }}
        </Tag>

        <Divider class="col-span-2" />

        <div class="col-span-2 flex justify-end">
          <Button label="Clear" severity="secondary" text @click="clearFilters" />
        </div>
      </div>

      <!-- Debugging: Show a message if there are no status options -->
      <p v-else class="text-center text-gray-500">No status options available</p>
    </Popover>
  </div>
</template>

<script setup>
import { accAccount } from '@/service/acc.service';
import { useAccStore } from '@/store/accStore';
import { onMounted, ref, computed, watch, onUnmounted } from 'vue';

const accStore = useAccStore();
const scrollContainer = ref(null);
const loading = ref(false);
const noMoreItems = ref(false);

const emit = defineEmits(['formSelected']);

const avatarLabel = ref('');
const avatarTooltip = ref('');

const op = ref();
const selectedStatus = ref(null);
const statusOptions = ref([]);

const toggle = (event) => {
  op.value.toggle(event);
};

// Clear filters - reset store and reload
const clearFilters = async () => {
  selectedStatus.value = null;
  op.value.hide();
  
  // Reset store pagination
  accStore.pagination.offset = 0;
  
  // Clear existing items to prevent duplication
  accStore.items = [];
  
  // Reload forms from the beginning
  loading.value = true;
  try {
    await accStore.fetchForms();
    fetchStatusOptions();
  } finally {
    loading.value = false;
  }
};

// Select a status and filter the menu items
const selectStatus = (status) => {
  selectedStatus.value = status;
  op.value.hide();
};

const fetchStatusOptions = () => {
  let allCustomValues = accStore.items.flatMap(item => item.form?.customValues || []);
  
  const statusField = allCustomValues.find(
    (field) =>
      field.itemLabel?.toLowerCase() === 'approval status' &&
      field.valueName === 'choiceVal'
  );

  if (statusField?.valueOptions) {
    statusOptions.value = statusField.valueOptions;
  }
};

// const fetchStatusOptions = () => {
//   if (accStore.items.length > 0 && accStore.items[0].form?.customValues) {
//     console.log('custom values', accStore.items[0].form.customValues);

//     const statusField = accStore.items[0].form.customValues.find(
//       (field) =>
//         field.itemLabel?.toLowerCase() === 'approval status' &&
//         field.valueName === 'choiceVal'
//     );

//     if (statusField?.valueOptions) {
//       statusOptions.value = statusField.valueOptions;
//       console.log("statusOptions:", statusOptions.value);
//     }
//   }
// };

const filteredMenuItems = computed(() => {
  if (!selectedStatus.value) {
    return menuItems.value.filter((item) => item.label.toLowerCase().includes("permit"));
  }

  return menuItems.value.filter((item) => {
    return (
      item.approvalStatus === selectedStatus.value &&
      item.label.toLowerCase().includes("permit")
    );
  });
});

// Computed menu items with enriched Approval Status
const menuItems = computed(() => {
  return accStore.items.map((item) => {
    if (item.form && item.form.customValues) {
      const statusField = item.form.customValues.find(
        (field) =>
          field.itemLabel &&
          field.itemLabel.toLowerCase() === 'approval status' &&
          field.valueName === 'choiceVal'
      );
      return {
        ...item,
        approvalStatus: statusField ? statusField.choiceVal : null,
      };
    }
    return { ...item, approvalStatus: null };
  });
});

// Check if more items should be loaded based on current filter
const checkIfMoreItemsNeeded = () => {
  if (!scrollContainer.value) return;

  const container = scrollContainer.value;
  const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 300;
  
  // If filtered results are low, try to load more
  if (isNearBottom && filteredMenuItems.value.length < 10 && !loading.value) {
    if (accStore.pagination.offset < accStore.pagination.totalResults) {
      loadMoreItems();
    }
  }
};

const handleScroll = (event) => {
  const container = event.target;
  const bottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 20;

  if (bottom && !loading.value && accStore.pagination.offset < accStore.pagination.totalResults) {
    loadMoreItems();
  } else if (accStore.pagination.offset >= accStore.pagination.totalResults) {
    noMoreItems.value = true;
  }
};

const loadMoreItems = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    await accStore.fetchForms(true);
    fetchStatusOptions();
    
    if (accStore.pagination.offset >= accStore.pagination.totalResults) {
      noMoreItems.value = true;
    }
  } finally {
    loading.value = false;
  }
};

const statusClass = (status, type = 'class') => {
  const statusMap = {
    Approved: { class: 'text-green-600', severity: 'success' },
    Pending: { class: 'text-yellow-600', severity: 'warn' },
    Rejected: { class: 'text-red-600', severity: 'danger' },
    'On Hold': { class: 'text-blue-600', severity: 'info' },
    'In Review': { class: 'text-blue-600', severity: 'info' },
    'Needs Revision': { class: 'text-blue-600', severity: 'info' },
    default: { class: 'text-white', severity: 'secondary' },
  };

  const result = statusMap[status] || statusMap.default;
  return type === 'class' ? result.class : result.severity;
};

watch(
  () => accStore.selectedForm,
  (newForm) => {
    if (newForm) {
      emit('formSelected', newForm);
    }
  },
  { immediate: false }
);

// Watch for filter status changes to check if more items are needed
watch(
  () => selectedStatus.value,
  () => {
    setTimeout(() => {
      checkIfMoreItemsNeeded();
    }, 100);
  }
);

// Watch for new items to update filter options
watch(
  () => accStore.items,
  () => {
    fetchStatusOptions();
  },
  { deep: true, immediate: true }
);

const avatar = async () => {
  try {
    const firstName = accStore.user?.firstName || '';
    const lastName = accStore.user?.lastName || '';

    avatarLabel.value = `${firstName.charAt(0)}${lastName.charAt(0)}`;
    avatarTooltip.value = `${firstName} ${lastName}`;
  } catch (error) {
    console.error('Error fetching ACC_ME:', error);
  }
};

const loadForms = async () => {
  loading.value = true;
  try {
    await accStore.fetchForms();
    fetchStatusOptions();
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await accStore.fetchUsers();
  await avatar();
  await loadForms();
});

onUnmounted(() => {
  // Reset pagination offset when component is unmounted
  accStore.pagination.offset = 0;
});
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  box-shadow: 0 0 20px rgba(20, 20, 20, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.scroll-container {
  height: calc(90vh - 100px);
  overflow-y: auto;
  scroll-behavior: smooth;
}
</style>