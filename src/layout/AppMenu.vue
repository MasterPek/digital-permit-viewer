<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { useBasemapStore } from '@/store/basemapStore';
import Checkbox from 'primevue/checkbox';

const basemapStore = useBasemapStore();

const layers = ref({
  Survey: [
    { label: 'Layer 1', checked: true },
    { label: 'Layer 2', checked: false },
  ],
  Design: [
    { label: 'Layer 1', checked: false },
    { label: 'Layer 2', checked: true },
  ],
  Environment: [
    { label: 'Layer 1', checked: false },
    { label: 'Layer 2', checked: false },
  ],
  "Permit Area": [
    { label: 'Permit Layer 1', checked: true },
    { label: 'Permit Layer 2', checked: false },
  ],
});

const model = ref([
    {
        label: 'Basemaps',
        items: [
        { label: 'Street View', icon: 'pi pi-fw pi-map', to: '/', command: () => useBasemapStore.setBasemap(basemapStore.streetMap) },
        { label: 'Imagery View', icon: 'pi pi-fw pi-map', to: '/imagery-map', command: () => basemapStore.setBasemap(basemapStore.imageryMap), }
        ],
    },
    {
        label: 'Layers',
        items: [
            { 
                label: 'Survey', 
                icon: 'pi pi-fw pi-id-card', 
                to: '/layer/survey',
                items: layers.value.Survey.map(layer => ({
                label: layer.label,
                icon: 'pi pi-fw pi-check',
                component: Checkbox,
                modelValue: layer.checked,
                onUpdateModelValue: (value) => {
                    layer.checked = value;
                    // Add logic to show/hide layers based on checkbox
                },
                })),
            },
            { 
                label: 'Design', 
                icon: 'pi pi-fw pi-check-square', 
                to: '/layer/design',
                items: layers.value.Design.map(layer => ({
                label: layer.label,
                icon: 'pi pi-fw pi-check',
                component: Checkbox,
                modelValue: layer.checked,
                onUpdateModelValue: (value) => {
                    layer.checked = value;
                    // Add logic to show/hide layers based on checkbox
                },
                })),
            },
            { 
                label: 'Environment', 
                icon: 'pi pi-fw pi-mobile', 
                to: '/layer/environment', 
                class: 'rotated-icon',
                items: layers.value.Environment.map(layer => ({
                label: layer.label,
                icon: 'pi pi-fw pi-check',
                component: Checkbox,
                modelValue: layer.checked,
                onUpdateModelValue: (value) => {
                    layer.checked = value;
                    // Add logic to show/hide layers based on checkbox
                },
                })),
            },
            { 
                label: 'Permit Area', 
                icon: 'pi pi-fw pi-table', 
                to: '/layer/permit-area',
                items: layers.value["Permit Area"].map(layer => ({
                label: layer.label,
                icon: 'pi pi-fw pi-check',
                component: Checkbox,
                modelValue: layer.checked,
                onUpdateModelValue: (value) => {
                    layer.checked = value;
                    // Add logic to show/hide layers based on checkbox
                },
                })),
            },
        ]
    },
    // {
    //     label: 'Hierarchy',
    //     items: [
    //         {
    //             label: 'Submenu 1',
    //             icon: 'pi pi-fw pi-bookmark',
    //             items: [
    //                 {
    //                     label: 'Submenu 1.1',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [
    //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
    //                     ]
    //                 },
    //                 {
    //                     label: 'Submenu 1.2',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
    //                 }
    //             ]
    //         },
    //     ]
    // },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
