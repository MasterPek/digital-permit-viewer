<template>
  <div class="flex items-center justify-center min-h-screen">
    <p>Processing authentication...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import esriId from '@arcgis/core/identity/IdentityManager';

const loadHandler = () => {
  if (window.opener) {
    if (window.location.hash) {
      try {
        // Use the esriId from the ArcGIS API for JavaScript ESM
        esriId.setOAuthResponseHash(window.location.hash);
      } catch (e) {
        console.error('Error setting OAuth response hash:', e);
        // Fallback to dispatching a custom event
        window.opener.dispatchEvent(
          new CustomEvent('arcgis:auth:hash', { detail: window.location.hash })
        );
      }
    } else if (window.location.search) {
      // Handle location.search if needed
      window.opener.dispatchEvent(
        new CustomEvent('arcgis:auth:location:search', { detail: window.location.search })
      );
    }

    // Close the popup after handling the OAuth response
    window.close();
  } else {
    console.error('No opener window found.');
  }
};

onMounted(() => {
  loadHandler();
});
</script>