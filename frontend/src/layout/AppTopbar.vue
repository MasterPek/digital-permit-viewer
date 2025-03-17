<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref } from 'vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();

// TODO: integrate project api from backend
const projects = ref([
    { id: 1, name: 'QTMP - Test Project' },
])

const selectedProject = ref(projects.value.find((project) => project.id === 1));
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <!-- <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button> -->
            <router-link :to="{ name: 'webmap' }" class="layout-topbar-logo">
                <div>
                    <img src="/demo/images/gamuda.png" class="rounded-xl" alt="" height="35px" width="35px">
                </div>

                <span class="text-lg sm:text-base md:text-xl">Digital Permit</span>
            </router-link>
        </div>
        <div class="flex justify-center gap-4">
            <Select v-model="selectedProject" :options="projects" optionLabel="name" placeholder="Select a Project" variant="filled" />
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>