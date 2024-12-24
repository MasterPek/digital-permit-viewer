<template>
  <div class="flex flex-col h-full w-full">
    <div v-if="!refreshToken" class="flex flex-col justify-center items-center w-full h-full gap-4">
      <p>Proceed to ACC to fetch forms</p>
      <Button @click="login" label="Login" />
    </div>
    <div v-else class="flex flex-col gap-4">
      <Permit />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Permit from "../permit/Permit.vue";
import { accLogin, listenForAuthMessage } from "@/service/acc.service";
import { accToken } from "@/utils/token";
import { getAccCookie } from "@/utils/accCookie";

const token = accToken();
const refreshToken = ref(getAccCookie("acc_refreshToken"));

// Login Function
const login = () => {
  accLogin();
}

const handleAuthSuccess = (token) => {
  refreshToken.value = getAccCookie("acc_refreshToken");
};

// Start listening for the authentication message
listenForAuthMessage(handleAuthSuccess);

onMounted(() => {

});

</script>
