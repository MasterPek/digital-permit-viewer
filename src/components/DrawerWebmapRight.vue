<template>
  <Transition name="slide-fade">
    <div v-if="modelValue" class="webmap-drawer-right" :class="{ 'drawer-open': modelValue }">
      <div class="drawer-content">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <h2>{{ selectedForm?.name }}</h2>
          <Button icon="pi pi-times" class="close-button" @click="closeDrawer" text rounded />
        </div>

        <!-- Drawer Body -->
        <div class="drawer-body">
          <slot>
            <div class="flex flex-col p-4 gap-4">
              <!-- Selected Form Mode: Show Approval Status and Permit Area -->
              <div class="flex flex-col gap-2">
                <span class="font-medium text-xl">Approval Status</span>
                <span v-if="approvalStatus" :class="statusClass" class="text-xl">{{ approvalStatus }}</span>
                <span v-else class="font-bold text-xl">Not Available</span>
              </div>
              
              <Divider />
              
              <div class="flex flex-col gap-3">
                <span class="font-medium text-xl">Permit ID</span>
                <span>{{ selectedForm?.id }}</span>
              </div>

              <Divider />
              
              <div class="flex flex-col gap-3">
                <span class="font-medium text-xl">Permit Area</span>
                <div class="flex justify-center gap-4 px-4">
                  <Button @click="showArea" icon="pi pi-search" label="Show Area" severity="info" outlined size="small" />
                  <Button label="Print" icon="pi pi-file-pdf" outlined size="small" />
                </div>
              </div>

              <Divider />
              
              <!-- TODO permit time section -->
              <div class="flex flex-col gap-3">
                <span class="font-medium text-xl">Permit Time</span>
                <span class="font-medium text-lg">Actual Time</span>
                <DatePicker v-model="date" disabled />
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
watch(
  () => props.isAddPermitMode,
  async (isAddPermitMode) => {
    if (isAddPermitMode) {
      await accTemplateStore.fetchTemplates();
    }
  }
);

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

const statusClass = computed(() => {
  switch (approvalStatus.value) {
    case 'Approved':
      return 'text-green-600 font-bold'; // Green for Approved
    case 'Pending':
      return 'text-yellow-600 font-bold'; // Yellow for Pending
    case 'Rejected':
      return 'text-red-600 font-bold'; // Red for Rejected
    case 'On Hold':
      return 'text-orange-600 font-bold'; // Orange for On Hold
    case 'In Review':
      return 'text-blue-600 font-bold'; // Blue for In Review
    case 'Needs Revision':
      return 'text-purple-600 font-bold'; // Purple for Needs Revision
    default:
      return 'text-gray-600 font-bold'; // Gray for unknown statuses
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