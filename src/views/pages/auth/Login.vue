<script setup>
import { arcGisClientId, arcGisRedirectUri } from '@/constants/arcgis.constant';
import { ref, onMounted } from 'vue';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import esriId from '@arcgis/core/identity/IdentityManager';
import Portal from '@arcgis/core/portal/Portal';

const loginStatus = ref('');
const isLoading = ref(false);
const error = ref(null);

// Initialize OAuth configuration
const info = new OAuthInfo({
    appId: arcGisClientId,
    popup: false,
    redirectUri: arcGisRedirectUri,
    portalUrl: import.meta.env.VITE_ARCGIS_PORTAL_URL,
});

// Register the OAuth configuration
esriId.registerOAuthInfos([info]);

const handleLogin = async () => {
    try {
        isLoading.value = true;
        error.value = null;

        // Step 1: Get the user's credentials
        const credential = await esriId.getCredential(info.portalUrl + '/sharing');

        if (credential) {
            // Step 2: Initialize Portal after authentication
            const portal = new Portal();
            await portal.load();

            // Step 3: Store the user info
            const userInfo = {
                userId: credential.userId,
                token: credential.token,
                refreshToken: credential.refreshToken,
                expires: credential.expires,
            };

            localStorage.setItem('arcgis_user', JSON.stringify(userInfo));

            // Step 4: Redirect or perform other actions
            window.location.href = '/permit/survey';
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred during login';
        loginStatus.value = 'Login failed';
    } finally {
        isLoading.value = false;
    }
};

// Handle logout
const handleLogout = async () => {
    try {
        esriId.destroyCredentials();
        localStorage.removeItem('arcgis_user');
        loginStatus.value = 'Logged out successfully';
        // Add your redirect logic here
        // window.location.href = '/login';
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred during logout';
    }
};

onMounted(async () => {
});
</script>

<template>
    <div
        class="flex min-h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-surface-50 dark:bg-surface-950">
        <div class="flex flex-col items-center justify-center">
            <div>
                <span class="text-2xl">Welcome to Digital Permit</span>
            </div>
            <div class="w-full px-8 py-20 sm:px-20">
                <div class="space-y-4">
                    <Button :disabled="isLoading" @click="handleLogin">
                        {{ isLoading ? 'Signing in...' : 'Login with ArcGIS' }}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>