<template>
  <div class="topbar">
    <div>
      <Button icon="pi pi-filter" text @click="toggle" v-tooltip="'Filter'" />
      <Button icon="pi pi-plus" text v-tooltip="'Add Permit'" @click="addPermit" />
    </div>
    <Avatar :label="avatarLabel" shape="circle" v-tooltip="`${avatarTooltip}`" />
  </div>
  <div class="m-2 mt-0">
    <PanelMenu :model="filteredMenuItems">
      <template #item="{ item }">
        <a v-ripple class="flex items-center px-4 py-2 cursor-pointer group">
          <!-- Icon -->
          <div class="flex flex-col w-full">
            <span :class="[{ 'font-semibold': item.items }]">{{ item.label }}</span>
  
            <div class="flex justify-between items-center">
              <Tag v-if="item.approvalStatus" :severity="statusClass(item.approvalStatus, 'severity')" class="text-sm">
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
  </div>
  <Popover ref="op">
    <div class="grid grid-cols-2">
      <Tag
      class="cursor-pointer m-2"
      :severity="statusClass(status, 'severity')"
        v-for="status in statusOptions"
        :key="status"
        @click="selectStatus(status)"
      >{{ status }}</Tag>

      <Divider class="col-span-2" />

      <div class="col-span-2 flex justify-end">
        <Button label="Clear" severity="secondary" text @click="selectStatus(null)" />
      </div>
    </div>
  </Popover>
</template>

<script setup>
import { accAccount, accMe } from '@/service/acc.service';
import { useAccFormStore } from '@/store/accStore';
import { onMounted, ref, computed, watch } from 'vue';

const accStore = useAccFormStore();

const emit = defineEmits(['formSelected', 'addPermit']);

const avatarLabel = ref('');
const avatarTooltip = ref('');

const op = ref()
const selectedStatus = ref(null);
const statusOptions = ref([]);

const toggle = (event) => {
    op.value.toggle(event);
}

// Select a status and filter the menu items
const selectStatus = (status) => {
  selectedStatus.value = status;
  op.value.hide();
};

const fetchStatusOptions = () => {
  if (accStore.items.length > 0 && accStore.items[0].form?.customValues) {
    const statusField = accStore.items[0].form.customValues.find(
      (field) =>
        field.itemLabel?.toLowerCase() === 'approval status' &&
        field.valueName === 'choiceVal'
    );

    if (statusField?.valueOptions) {
      statusOptions.value = statusField.valueOptions;
    }
  }
};

const filteredMenuItems = computed(() => {
  if (!selectedStatus.value) return menuItems.value;

  return menuItems.value.filter((item) => {
    return item.approvalStatus === selectedStatus.value;
  });
});

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

const statusClass = (status, type = 'class') => {
  const statusMap = {
    Approved: { class: 'text-green-600', severity: 'success' },
    Pending: { class: 'text-yellow-600', severity: 'warn' },
    Rejected: { class: 'text-red-600', severity: 'danger' },
    'On Hold': { class: 'text-orange-600', severity: 'info' },
    'In Review': { class: 'text-blue-600', severity: 'info' },
    'Needs Revision': { class: 'text-blue-600', severity: 'info' },
    default: { class: 'text-gray-600', severity: 'secondary' },
  };

  const result = statusMap[status] || statusMap.default;
  return type === 'class' ? result.class : result.severity;
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

const addPermit = () => {
  emit('addPermit');
};

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
  fetchStatusOptions();
};

const fetchAccountId = () => {
  try {
    const res = accAccount();
 
    console.log('cehk',res);
  } catch (error) {
    console.log('error',error);
  }
}

onMounted(() => {
  fetchMe();
  loadForms();
  fetchAccountId();
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
</style>
