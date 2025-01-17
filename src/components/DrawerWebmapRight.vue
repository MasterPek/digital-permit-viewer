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
            <div class="flex flex-col p-4">
              <!-- Selected Form Mode: Show Approval Status and Permit Area -->
              <div class="flex flex-col gap-2">
                <span class="font-medium text-xl">Approval Status</span>
                <span v-if="approvalStatus" :class="statusClass" class="text-xl">{{ approvalStatus }}</span>
                <span v-else>Not Available</span>
              </div>
              <Divider />
              <div class="flex flex-col gap-3">
                <span class="font-medium text-xl">Permit Area</span>
                <div class="flex justify-center gap-4 px-4">
                  <Button label="Show Area" severity="info" outlined size="small" />
                  <Button label="Print" icon="pi pi-file-pdf" iconPos="right" outlined size="small" />
                </div>
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

const emit = defineEmits(['update:modelValue', 'close-drawer-right']);

const closeDrawer = () => {
  emit('update:modelValue', false);
  emit('close-drawer-right');
};
</script>

<style scoped>
.webmap-drawer-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 40vw;
  max-width: 350px;
  height: 100%;
  background-color: var(--surface-card);
  border-left: 1px solid var(--surface-border);
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--surface-border);
}

.drawer-body {
  flex-grow: 1;
  overflow-y: auto;
}

.close-button {
  margin-left: auto;
}

@media (max-width: 768px) {
  .webmap-drawer-right {
    width: 60vw;
  }
}

@media (max-width: 480px) {
  .webmap-drawer-right {
    width: 80vw;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>