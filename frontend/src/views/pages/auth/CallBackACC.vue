<template>
  <div>
    <p>Processing authentication...</p>
  </div>
</template>

<script setup>
// Extract code and state from URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code");
const state = urlParams.get("state");

if (code && window.opener) {
  // Send the code back to the parent tab
  window.opener.postMessage({ code, state }, window.location.origin);
  window.close(); // Close the tab after sending
}
</script>
