<script setup>
import { arcGisPortalUrl } from '@/constants/arcgis.constant';
import { ref, onMounted, onUnmounted } from 'vue';
import esriId from '@arcgis/core/identity/IdentityManager';
import Portal from '@arcgis/core/portal/Portal';
import { useRouter } from 'vue-router';

const router = useRouter();
const loginStatus = ref('');
const isLoading = ref(false);
const error = ref(null);

const handleSignedInUser = async () => {
    try {
        const credential = await esriId.getCredential(`${arcGisPortalUrl}/sharing`);
        // Store the credential in localStorage for persistence
        localStorage.setItem('arcgisCredential', JSON.stringify(credential.toJSON()));
        
        // Initialize portal with credential
        const portal = new Portal();
        await portal.load();
        
        // Wait a brief moment to ensure credential is properly stored
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to webmap
        await router.push('/webmap');
    } catch (err) {
        console.error('Error handling signed in user:', err);
    }
};

const handleLogin = async () => {
    try {
        isLoading.value = true;
        error.value = null;
        
        // Attempt to sign in
        await esriId.getCredential(`${arcGisPortalUrl}/sharing`, {
            oAuthPopupConfirmation: false
        });
        
        await handleSignedInUser();
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'An error occurred during login';
        loginStatus.value = 'Login failed';
    } finally {
        isLoading.value = false;
    }
};

// Message handler for popup callback
const messageHandler = async (event) => {
    if (event.origin !== window.location.origin) return;
   
    const { code, state } = event.data;
    if (code && state) {
        try {
            await handleSignedInUser();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'An error occurred processing the login';
        }
    }
};

onMounted(() => {
    window.addEventListener('message', messageHandler);
    
    // Restore credentials from localStorage if available
    const savedCredential = localStorage.getItem('arcgisCredential');
    if (savedCredential) {
        try {
            const credential = JSON.parse(savedCredential);
            esriId.registerToken(credential);
        } catch (err) {
            console.error('Error restoring credential:', err);
        }
    }
});

onUnmounted(() => {
    window.removeEventListener('message', messageHandler);
});
</script>

<template>
    <div class="flex min-h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-surface-50 dark:bg-surface-950">
        <div class="flex flex-col items-center justify-center gap-4">
            <div class="flex flex-col items-center gap-4">
                <span class="text-4xl">Digital Permit Viewer</span>
                <span class="text-lg text-center">Sign in to access the application</span>
            </div>
            <div>
                <div class="space-y-4">
                    <Button :loading="isLoading" @click="handleLogin" v-tooltip.bottom="'login with Gamuda Australia ArcGIS account'">
                        {{ isLoading ? 'Signing in...' : 'Login with ArcGIS' }}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>