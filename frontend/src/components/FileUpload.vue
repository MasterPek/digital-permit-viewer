<script setup>
import { ref } from 'vue';

// Props definition
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxFiles: {
    type: Number,
    default: 5 // Default maximum number of files allowed
  },
  supportedFiles: {
    type: String,
    default: 'JPG, PNG'
  },
  maxFileSize: {
    type: Number,
    default: 10
  },
  uploadLabelBtn: {
    type: String,
    default: 'Upload'
  },
  uploadIconBtn: {
    type: String,
    default: '' // Optional uploadIconBtn class (e.g., "pi pi-upload")
  }
});

const emit = defineEmits(['files-selected', 'upload-clicked']);

// File upload state
const uploadedFiles = ref([]);
const draggedIndex = ref(null);
const error = ref(''); // Error message state

const fileInput = ref(null);

// Supported file types and their MIME types
const fileTypeMapping = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// Handle upload button click
const handleUploadClick = () => {
  if (uploadedFiles.value.length === 0) {
    error.value = 'Please select files before uploading.';
    return;
  }
  error.value = ''; // Clear any error message
  emit('upload-clicked', uploadedFiles.value);
};

// Handle file selection
const handleFileChange = (event) => {
  const files = event.target.files;
  validateAndAddFiles(files);
};

// Validate and add files
const validateAndAddFiles = (files) => {
  const supportedExtensions = props.supportedFiles.split(',').map(type => type.trim().toLowerCase());
  const fileTypeMapping = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  const supportedTypes = supportedExtensions.map(ext => fileTypeMapping[ext]);

  let hasError = false;

  // Check if multiple files are allowed
  if (!props.multiple && files.length > 1) {
    error.value = 'Only one file can be uploaded at a time.';
    hasError = true;
  }

  // Check if the total number of files exceeds the maxFiles limit
  if (props.multiple && uploadedFiles.value.length + files.length > props.maxFiles) {
    error.value = `You can only upload up to ${props.maxFiles} files.`;
    hasError = true;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExtension = file.name.split('.').pop().toLowerCase(); // Get the file extension
    const mimeType = file.type.toLowerCase(); // Get the MIME type

    // Check if the file type is supported (either by extension or MIME type)
    if (!supportedExtensions.includes(fileExtension) && !supportedTypes.includes(mimeType)) {
      error.value = `Unsupported file type: ${file.name}. Only ${props.supportedFiles} are allowed.`;
      hasError = true;
      break;
    }

    // Check if the file size exceeds the limit
    if (file.size / (1024 * 1024) > props.maxFileSize) {
      error.value = `File size exceeds the limit of ${props.maxFileSize}MB: ${file.name}`;
      hasError = true;
      break;
    }

    // Clear the uploadedFiles array if multiple is false
    if (!props.multiple) {
      uploadedFiles.value = []; // Reset the array to allow only one file
    }

    // Add the file to the uploadedFiles array
    uploadedFiles.value.push(file);
  }

  // Emit the selected files to the parent component
  if (!hasError) {
    emit('files-selected', uploadedFiles.value);
  }

  // Reset the file input element on error
  if (hasError) {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } else if (!props.multiple) {
    // Clear the file input after adding a single file
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

// Drag-and-drop logic
const dragStart = (index, event) => {
  draggedIndex.value = index;
  event.dataTransfer.setData('text/plain', index);
  event.dataTransfer.effectAllowed = 'move';
};

const drop = (targetIndex, event) => {
  event.preventDefault();
  const draggedIdx = event.dataTransfer.getData('text/plain');

  if (draggedIdx === targetIndex) return;

  // Reorder the files array
  const draggedItem = uploadedFiles.value.splice(draggedIdx, 1)[0];
  uploadedFiles.value.splice(targetIndex, 0, draggedItem);
  draggedIndex.value = null;
};

// Remove file logic
const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1); // Remove the file at the specified index
};

// Clear all files logic
const clearAll = () => {
  uploadedFiles.value = []; // Reset the uploadedFiles array
  error.value = ''; // Clear any error message
  if (fileInput.value) {
    fileInput.value.value = ''; // Reset the file input element
  }
};
</script>
<template>
  <div class="group relative">
    <div class="card-upload">
      <!-- Background Effects -->
      <div
        class="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-sky-500/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70">
      </div>
      <div
        class="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-500/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70">
      </div>

      <!-- File Upload Section -->
      <div class="relative p-6">
        <h3 class="title-upload">{{ title }}</h3>

        <!-- Dropzone -->
        <div class="group/dropzone mt-6">
          <div
            class="dropzone">
            <input type="file" :multiple="multiple" class="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
              @change="handleFileChange" ref="fileInput" />
            <div class="space-y-6 text-center">
              <div class="bg-dropzone-icon-upload">
                <svg class="dropzone-icon-upload" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
              </div>
              <div class="space-y-2">
                <p class="instruction-upload">Browse your files here or drop</p>
                <p class="text-sm text-slate-400">Support files: {{ supportedFiles }}</p>
                <p class="text-xs text-slate-400">Max file size: {{ maxFileSize }}MB</p>
                <p v-if="multiple" class="text-xs text-slate-400">Max files: {{ maxFiles }} files</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <!-- Uploaded Files List (Draggable) -->
        <div class="mt-6 overflow-y-auto space-y-4">
          <div v-for="(file, index) in uploadedFiles" :key="index"
            :class="['card-uploaded', { dragging: draggedIndex === index }]"
            draggable="true" @dragstart="dragStart(index, $event)" @dragover.prevent @drop="drop(index, $event)">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="bg-card-uploaded">
                  <svg v-if="file.status === 'complete'" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <svg v-else class="icon-uploaded" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                  </svg>
                </div>
                <div>
                  <p class="card-uploaded-filename">{{ file.name }}</p>
                  <p class="text-xs text-slate-400">{{ file.size }} • {{ file.type }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <button class="btn-close-card-uploaded" @click="removeFile(index)">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 grid grid-cols-2 gap-4">
          <button @click="handleUploadClick"
            class="btn-upload">
            <span
              class="btn-upload-content">
              <!-- Conditional uploadIconBtn Rendering -->
              <i v-if="uploadIconBtn" :class="uploadIconBtn" class="text-lg"></i>
              {{ uploadLabelBtn }}
            </span>
          </button>
          <button @click="clearAll"
            class="btn-clear-upload">
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style>

</style>