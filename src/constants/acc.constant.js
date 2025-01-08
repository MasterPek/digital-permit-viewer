export const accBaseUrl = import.meta.env.VITE_ACC_BASE_URL;
export const accClientId = import.meta.env.VITE_ACC_CLIENT_ID;
export const accClientSecret = import.meta.env.VITE_ACC_CLIENT_SECRET;
export const redirectUri = import.meta.env.VITE_ACC_REDIRECT_URI;
export const projectId = import.meta.env.VITE_ACC_PROJECT_ID;

export const ACC_ENDPOINTS = {
  ACC_LOGIN: `${accBaseUrl}/authentication/v2/authorize?response_type=code&client_id=${accClientId}&redirect_uri=${redirectUri}&scope=data:read account:read`,
  ACC_TOKEN: `${accBaseUrl}/authentication/v2/token`,
  ACC_ME: `/api/userprofile/v1/users/@me`,  // dont provide accBaseUrl because of cors
  ACC_FORMS: `${accBaseUrl}/construction/forms/v1/projects/${projectId}/forms`,
  ACC_ME2: `${accBaseUrl}/acc/v1/users/me`,
  ACC_ACCOUNTS: `${accBaseUrl}/hq/v1/accounts`,
}