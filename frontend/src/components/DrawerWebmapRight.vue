<template>
  <Transition name="slide-fade">
    <div v-if="modelValue" class="webmap-drawer-right" :class="{ 'drawer-open': modelValue }">
      <div class="drawer-content">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <h1 class="text-xl">{{ selectedForm?.name }}</h1>
          <Button icon="pi pi-times" class="close-button" @click="closeDrawer" text rounded />
        </div>

        <!-- Drawer Body -->
        <div class="drawer-body">
          <slot>
            <div class="flex flex-col p-4 gap-2">
              <!-- Selected Form Mode: Show Approval Status and Permit Area -->
              <div class="flex flex-col gap-2">
                <h3 class="font-medium text-xl">Approval Status</h3>
                <span v-if="approvalStatus" :class="statusClass" class="text-xl">{{ approvalStatus }}</span>
                <span v-else class="font-bold text-xl">Not Available</span>
              </div>
              
              <Divider />
              
              <div class="flex flex-col gap-3">
                <h3 class="font-medium text-xl">Form ID</h3>
                <span>{{ selectedForm?.id }}</span>
              </div>

              
              <Divider />
              
              <div class="flex flex-col gap-3">
                <h3 class="font-medium text-xl">Permit Time</h3>
                <div class="flex gap-3">
                  <div class="flex flex-col">
                    <label class="font-medium">Actual Start</label>
                    <DatePicker v-model="actualStart" dateFormat="dd/mm/yy" :placeholder="actualStart ? undefined : 'Date were not set'" disabled />
                  </div>
                  <div class="flex flex-col">
                    <label class="font-medium">Actual Finish</label>
                    <DatePicker v-model="actualFinish" dateFormat="dd/mm/yy" :placeholder="actualFinish ? undefined : 'Date were not set'" disabled />
                  </div>
                </div>
              </div>

              <Divider />
              
              <div class="flex flex-col gap-3">
                <h3 class="font-medium text-xl">Permit Area</h3>
                <div class="flex justify-center gap-4 px-4">
                  <Button @click="showArea" icon="pi pi-search" label="Show Area" severity="info" outlined size="small" />
                </div>
              </div>
              <div class="absolute bottom-2 right-0 p-4">
                <Button label="Print" icon="pi pi-file-pdf" outlined />
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import { useAccTemplateStore } from '@/store/accStore';
import { storeToRefs } from 'pinia';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedForm: {
    type: Object,
    default: null
  },
  isAddPermitMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'close-drawer-right', 'show-area']);

const accTemplateStore = useAccTemplateStore();
const { templates, isLoading, error, activeTemplates } = storeToRefs(accTemplateStore);
const { fetchTemplates } = accTemplateStore;

const selectedTemplate = ref(null);

// Fetch templates when in "Add Permit" mode
// watch(
//   () => props.isAddPermitMode,
//   async (isAddPermitMode) => {
//     if (isAddPermitMode) {
//       await accTemplateStore.fetchTemplates();
//     }
//   }
// );

const approvalStatus = computed(() => {
  if (!props.selectedForm || !props.selectedForm.customValues) return null;

  const statusField = props.selectedForm.customValues.find(
    (field) =>
      field.itemLabel &&
      field.itemLabel.toLowerCase() === "approval status" &&
      field.valueName === "choiceVal"
  );

  return statusField ? statusField.choiceVal : null;
});

function formatDateToDDMMYY(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

const actualStart = computed(() => {
  if (!props.selectedForm || !props.selectedForm.customValues) return null;

  const statusField = props.selectedForm.customValues.find(
    (field) =>
      field.itemLabel &&
      field.itemLabel.toLowerCase() === "actual start" &&
      field.valueName === "dateVal"
  );

  return statusField ? formatDateToDDMMYY(statusField.dateVal) : null;
});

const actualFinish = computed(() => {
  if (!props.selectedForm || !props.selectedForm.customValues) return null;

  const statusField = props.selectedForm.customValues.find(
    (field) =>
      field.itemLabel &&
      field.itemLabel.toLowerCase() === "actual finish" &&
      field.valueName === "dateVal"
  );

  return statusField ? formatDateToDDMMYY(statusField.dateVal) : null;
});


const statusClass = computed(() => {
  switch (approvalStatus.value) {
    case 'Approved':
      return 'text-green-600 font-bold'; // Green for Approved
    case 'Pending':
      return 'text-yellow-600 font-bold'; // Yellow for Pending
    case 'Rejected':
      return 'text-red-600 font-bold'; // Red for Rejected
    case 'On Hold':
      return 'text-blue-600 font-bold'; // Blue for On Hold
    case 'In Review':
      return 'text-blue-600 font-bold'; // Blue for In Review
    case 'Needs Revision':
      return 'text-blue-600 font-bold'; // Blue for Needs Revision
    default:
      return 'text-white font-bold'; // Gray for unknown statuses
  }
});

onMounted(() => {
});

const closeDrawer = () => {
  emit('update:modelValue', false);
  emit('close-drawer-right');
};

const showArea = () => {
  emit('show-area', props.selectedForm?.id);
};
</script>
<style scoped>

</style>