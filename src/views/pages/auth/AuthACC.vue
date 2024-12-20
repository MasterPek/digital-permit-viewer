<template>
  <div class="flex flex-col justify-center items-center h-full w-full">
    <div class="flex flex-col gap-4">
      <p>Proceed to ACC to fetch forms</p>
      <Button @click="login" label="Login" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const baseUrl = import.meta.env.VITE_ACC_BASE_URL;
const accClientId = import.meta.env.VITE_ACC_CLIENT_ID;
const accClientSecret = import.meta.env.VITE_ACC_CLIENT_SECRET;
const redirectUri = import.meta.env.VITE_ACC_REDIRECT_URI;

const accToken = ref(localStorage.getItem("acc_accessToken"));

// Login Function
const login = () => {
  const state = Date.now().toString(); // Unique ID for session
  const authUrl = `${baseUrl}/authentication/v2/authorize?response_type=code&client_id=${accClientId}&redirect_uri=${redirectUri}&scope=data:read&state=${state}`;
  window.open(authUrl, "_blank", "width=600,height=700");
};

// Listen for Post-Login Message
window.addEventListener("message", async (event) => {
  if (event.origin !== window.location.origin) return;

  const { code, state } = event.data;
  if (code) {
    try {
      const response = await fetch(`${baseUrl}/authentication/v2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: accClientId,
          client_secret: accClientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();
      console.log("Token Response:", data); // Check if the token is in the response
      if (data.access_token) {
        // Store token in localStorage and proceed with further requests
        localStorage.setItem("acc_accessToken", data.access_token);
        accToken.value = data.access_token; // Update reactive state if you're using Vue
      } else {
        console.error("No access token in response:", data);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }
});

// TODO: fetch projects(hardcoded), forms, formId
const fetchMe = async () => {
  try {
    const response = await fetch('/api/userprofile/v1/users/@me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Me Data:', data);

    return data;
  } catch (error) {
    console.error('Error fetching me:', error);
    throw error;
  }
};

const fetchHub = async () => {
  try {
    const response = await fetch('/project/v1/hubs', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accToken.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hub Data:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching hub:', error);
  }
}

onMounted(() => {
  if (accToken.value) {
    fetchMe();
    fetchHub();
  }
});

// Watch for changes to accToken and trigger fetchMe if it changes
watch(accToken, (newToken) => {
  if (newToken) {
    fetchMe();
  }
});
</script>
