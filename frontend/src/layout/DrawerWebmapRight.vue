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
              <!-- Selected Form Mode: Show form num -->
              <div class="flex flex-col gap-2">
                <h3 class="font-medium text-xl">Form ID</h3>
                <span>#{{ selectedForm?.formNum }}</span>
                <h3 class="font-medium text-xl">Description</h3>
                <span>{{ selectedForm?.description }}</span>
              </div>

              <Divider />
              <!-- Selected Form Mode: Show Approval Status and Permit Area -->
              <div class="flex flex-col gap-2">
                <h3 class="font-medium text-xl">Approval Status</h3>
                <span v-if="approvalStatus" :class="statusClass">{{ approvalStatus }}</span>
                <span v-else>Not Available</span>
              </div>

              <Divider />

              <div class="flex flex-col gap-3">
                <h3 class="font-medium text-xl">Form UUID (will delete after everything finalized)</h3>
                <span>{{ selectedForm?.id }}</span>
              </div>


              <Divider />

              <div class="flex flex-col gap-3">
                <h3 class="font-medium text-xl">Permit Time</h3>
                <div class="flex gap-3">
                  <div class="flex flex-col">
                    <label class="font-medium">Actual Start</label>
                    <DatePicker v-model="actualStart" dateFormat="dd/mm/yy"
                      :placeholder="actualStart ? undefined : 'Date were not set'" disabled />
                  </div>
                  <div class="flex flex-col">
                    <label class="font-medium">Actual Finish</label>
                    <DatePicker v-model="actualFinish" dateFormat="dd/mm/yy"
                      :placeholder="actualFinish ? undefined : 'Date were not set'" disabled />
                  </div>
                </div>
              </div>

              <Divider />

              <div class="flex flex-col gap-3">
                <h3 class="font-medium text-xl">Permit Area</h3>
                <div class="flex justify-center gap-4 px-4">
                  <Button @click="showArea" icon="pi pi-search" label="Show Area" severity="info" outlined
                    size="small" />
                </div>
              </div>

              <Divider />

              <div class="flex flex-col gap-3">
                <h3 class="font-medium text-xl">Action</h3>
                <div class="flex items-center justify-end">
                  <Button @click="accLinkForm" icon="pi pi-external-link" severity="info" text size="small"
                    v-tooltip="'Check the form in ACC'" />
                  <Button icon="pi pi-file-pdf" text size="small" v-tooltip="'View document'" />
                </div>
              </div>

              <Divider />
            </div>

            <div class="mb-4">
              <Accordion value="0">
                <AccordionPanel value="0">
                  <AccordionHeader>Generate PDF</AccordionHeader>
                  <AccordionContent>
                    <div class="flex flex-col items-start gap-3">

                      <div class="flex justify-between w-full">
                        <input type="file" @change="handleFileUpload" class="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0
                          file:text-sm file:font-medium
                          file:bg-sky-500 file:cursor-pointer
                          file:text-white
                          file:dark:text-black
                          hover:file:bg-sky-400
                        " />

                        <!-- Question icon button -->
                        <Button @click="openQuestion = true" severity="info" icon="pi pi-question" size="small" text
                          v-tooltip="'Click to show steps'" />

                        <!-- Modal -->
                        <Dialog v-model:visible="openQuestion" modal header="Steps to generate Form with permit area"
                          :style="{ width: '45rem' }">
                          <div class="flex flex-col gap-4">
                            <Panel header="Step 1" toggleable>
                              <span class="m-0">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                incididunt ut
                                labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                                ullamco
                                laboris nisi ut aliquip ex ea commodo consequat.
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                                nulla
                                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                                deserunt
                                mollit anim id est laborum.
                              </span>
                            </Panel>
                            <Panel header="Step 2" toggleable>
                              <p class="m-0">
                                <img src="/demo/images/gamuda.png" />
                              </p>
                            </Panel>
                          </div>
                        </Dialog>
                      </div>

                      <!-- Generate button -->
                      <Button @click="generatePdf" severity="info" label="Generate" fluid />
                    </div>
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
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
import { useScreenshotStore } from '@/store/screenshotStore';
import { storeToRefs } from 'pinia';
import { useToast } from "primevue/usetoast";

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

const screenshotStore = useScreenshotStore()
const accTemplateStore = useAccTemplateStore();
const { templates, isLoading, error, activeTemplates } = storeToRefs(accTemplateStore);
const { fetchTemplates } = accTemplateStore;

const toast = useToast()
const selectedTemplate = ref(null);

const openQuestion = ref(false);

const selectedFile = ref(null);

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

const accLinkForm = () => {
  window.open(`https://acc.autodesk.com/build/forms/projects/08eee442-9a68-4b82-9d6d-2c50240c3fd6/field-reports/bbf09ad9-3239-5c3f-acb9-379eb359dcd6/reports/${props.selectedForm?.id}`, '_blank');
};

function handleFileUpload(event) {
  selectedFile.value = event.target.files[0];
}

async function generatePdf() {
  if (!selectedFile.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please select a file to generate PDF', life: 3000 });
    return;
  }

  // Capture screenshot of map view div
  const canvasImage = await screenshotStore.captureScreenshot()

  if (!canvasImage) {
    // Log the full error details
    console.error('Screenshot Store Error:', {
      error: screenshotStore.error,
      isCapturing: screenshotStore.isCapturing
    })

    toast.add({ 
      severity: 'error', 
      summary: 'Screenshot Error', 
      detail: screenshotStore.error || 'Failed to capture screenshot', 
      life: 3000 
    })
    return
  }

  // Create FormData and append the file and canvas image
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('screenshot', canvasImage, 'mapview_screenshot.png');

  // Send the request to the backend
  try {
    const response = await fetch('/api/v1/upload/reports', {
      method: 'POST',
      body: formData,
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const result = await response.json();
    console.log('Success:', result);
    
    toast.add({ severity: 'success', summary: 'Success', detail: result.detail, life: 3000 });
  } catch (error) {
    console.error('Error:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || error, life: 3000 });
  }
}

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
<style scoped></style>