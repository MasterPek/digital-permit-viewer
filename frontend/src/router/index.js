import AppLayout from "@/layout/AppLayout.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory('/digital-permit/'),
    routes: [
        {
            path: "/",
            redirect: "/webmap",
            meta: { auth: true },
            component: AppLayout,
            children: [
                {
                    path: "/webmap",
                    name: "webmap",
                    component: () => import("@/views/Webmap.vue"),
                },
                {
                    path: "/layer/survey",
                    name: "survey-layer",
                    component: () => import("@/views/pages/permit/Survey.vue"),
                },
                {
                    path: "/permit",
                    name: "permit",
                    component: () => import("@/views/pages/permit/Permit.vue"),
                },
                {
                    path: "dev/digital-permit/acc/auth/callback",
                    name: "acc-callback",
                    component: () =>
                        import("@/views/pages/auth/CallBackACC.vue"),
                },
                {
                    path: "/dev/digital-permit/gis/auth/callback",
                    name: "arcgis-callback",
                    component: () =>
                        import("@/views/pages/auth/CallBackArcGis.vue"),
                },
                {
                    path: "/drag",
                    name: "drag",
                    component: () => import("@/views/pages/Drag.vue"),
                },
            ],
        },
        {
            path: "/auth/login",
            name: "login",
            component: () => import("@/views/pages/auth/Login.vue"),
            meta: {public: true}
        },
    ],
});

router.beforeEach(async (to, from) => {
    if (to.meta.auth) {
        const arcgisCredential = JSON.parse(
            localStorage.getItem("arcgisCredential"),
        );

        if (!arcgisCredential) {
            // If no credential is found, redirect to login
            return { name: "login" };
        }

        // Get the current time in milliseconds
        const currentTime = Date.now();

        // Check if the credential is expired
        if (currentTime > arcgisCredential.expires) {
            // If expired, clear the credential and redirect to login
            localStorage.removeItem("arcgisCredential");
            return { name: "login" };
        }

        // If the credential is valid, allow navigation
        return true;
    }

    // If the route does not require authentication, allow navigation
    return true;
});

export default router;
