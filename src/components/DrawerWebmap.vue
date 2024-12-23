<template>
  <div class="web-map-drawer-container">
    <!-- Trigger Buttons -->
    <div class="drawer-trigger" @click="toggleDrawer('Layers')">
      <button v-tooltip="'Layers'">
        <span class="material-symbols-outlined text-red-400">
          stacks
        </span>
      </button>
    </div>
    <div class="drawer-trigger" @click="toggleDrawer('Legend')">
      <button v-tooltip="'Legend'">
        <span class="material-symbols-outlined text-red-400">
          legend_toggle
        </span>
      </button>
    </div>

    <div class="drawer-trigger" @click="toggleDrawer('Permit')">
      <button v-tooltip="'Permit'">
        <span class="material-symbols-outlined text-red-400">
          license
        </span>
      </button>
    </div>

    <!-- Drawer Overlay -->
    <Transition name="slide-fade">
      <div v-if="isDrawerOpen" class="web-map-drawer" :class="{ 'drawer-open': isDrawerOpen }">
        <div class="drawer-content">
          <!-- Drawer Header -->
          <div class="drawer-header">
            <h2>{{ drawerTitle }}</h2>
            <Button icon="pi pi-times" class="close-button" @click="closeDrawer" text rounded />
          </div>

          <!-- Drawer Body -->
          <div class="drawer-body">
            <slot :drawer-title="drawerTitle">No content provided</slot>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Button from 'primevue/button';

// Props for customization
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

// Emits for v-model support
const emit = defineEmits(['update:modelValue']);

// Drawer state
const isDrawerOpen = ref(false);
const drawerTitle = ref('');

// Toggle drawer method
const toggleDrawer = (title) => {
  if (!isDrawerOpen.value || drawerTitle.value !== title) {
    isDrawerOpen.value = true;
    drawerTitle.value = title;
    // emit('update:modelValue', isDrawerOpen.value);
  }
};


// Close drawer method
const closeDrawer = () => {
  isDrawerOpen.value = false;
  emit('update:modelValue', false);
};

// Watch for external control of drawer
watch(() => props.modelValue, (newValue) => {
  isDrawerOpen.value = newValue;
});
</script>

<style scoped>
.web-map-drawer-container {
  position: absolute; 
  top: 0;
  left: 0;
  padding: 10px;
  background: #18181b;
  height: 100%; 
  width: 60px; 
  z-index: 10; /* Ensure it appears above the map */
  cursor: auto;
}

.drawer-trigger {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 5px;
}

.web-map-drawer {
  position: absolute;
  top: 0;
  left: 60px; /* Align next to the drawer container */
  width: 40vw; /* Width of the drawer */
  max-width: 400px;
  height: 100%;
  background-color: #18181b;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* background-color: aquamarine; */
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #000000;
}

.drawer-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
}

.close-button {
  margin-left: auto;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .web-map-drawer-container {
    width: 60px; /* Keep the width fixed */
  }

  .web-map-drawer {
    width: 60vw; /* Adjust the drawer width */
  }
}

@media (max-width: 480px) {
  .web-map-drawer-container {
    width: 60px; /* Keep the width fixed */
  }

  .web-map-drawer {
    width: 80vw; /* Adjust the drawer width */
  }
}

/* Transition effects */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(0%);
  opacity: 0;
}
</style>
