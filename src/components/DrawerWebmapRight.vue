<template>
  <Transition name="slide-fade">
    <div v-if="modelValue" class="web-map-drawer2" :class="{ 'drawer-open': modelValue }">
      <div class="drawer-content">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <h2>{{ selectedForm?.name }}</h2>
          <Button icon="pi pi-times" class="close-button" @click="closeDrawer" text rounded />
        </div>

        <!-- Drawer Body -->
        <div class="drawer-body">
          <slot>
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Form Details</h3>
              <div class="space-y-2">
                <p><strong>Form ID:</strong> {{ selectedForm?.id }}</p>
                <p><strong>Description:</strong> {{ selectedForm?.description }}</p>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedForm: {
    type: Object,
    default: null
  }
});

onMounted(() => {
  console.log('DrawerWebmapRight mounted');
});

watch(() => props.modelValue, (newValue) => {
  console.log('DrawerWebmapRight modelValue changed:', newValue);
});

watch(() => props.selectedForm, (newValue) => {
  console.log('DrawerWebmapRight selectedForm changed:', newValue);
});

const emit = defineEmits(['update:modelValue']);

const closeDrawer = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.web-map-drawer2 {
  position: absolute;
  top: 0;
  right: 0;
  width: 40vw;
  max-width: 400px;
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
  padding: 15px;
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
  .web-map-drawer2 {
    width: 60vw;
  }
}

@media (max-width: 480px) {
  .web-map-drawer2 {
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