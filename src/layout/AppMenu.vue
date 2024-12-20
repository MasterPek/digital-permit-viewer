<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        // label: 'Basemaps',
        items: [
        { label: 'Street View', icon: 'pi pi-fw pi-map', to: '/' },
        { label: 'Imagery View', icon: 'pi pi-fw pi-map', to: '/imagery-map' }
        ],
    },
    {
        items: [
            { 
                label: 'Survey', 
                icon: 'pi pi-fw pi-id-card', 
                to: '/permit/survey',
            },
        ]
    },
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
