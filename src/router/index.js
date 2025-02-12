import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/webmap',
            component: AppLayout,
            children: [
                {
                    path: '/webmap',
                    name: 'webmap',
                    component: () => import('@/views/Webmap.vue')
                },
                {
                    path: '/permit/survey',
                    name: 'survey-permit',
                    component: () => import('@/views/pages/permit/Survey.vue')
                },
                {
                    path: '/permit',
                    name: 'permit',
                    component: () => import('@/views/pages/permit/Permit.vue')
                },
                {
                    path: 'dev/digital-permit/acc/auth/callback',
                    name: 'acc-callback',
                    component: () => import('@/views/pages/auth/CallBackACC.vue')
                },
                {
                    path: '/dev/digital-permit/gis/auth/callback',
                    name: 'arcgis-callback',
                    component: () => import('@/views/pages/auth/CallBackArcGis.vue')
                },
                {
                    path: '/drag',
                    name: 'drag',
                    component: () => import('@/views/pages/Drag.vue')
                },
                {
                    path: "/:pathMatch(.*)*",
                    name: "notfound",
                    component: () => import("@/views/pages/NotFound.vue"),
                },

                {
                    path: '/webmap/test',
                    name: 'webmap-test',
                    component: () => import('@/views/pages/WebmapTest.vue')
                },
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
