import { ACC_ENDPOINTS, accClientId, accClientSecret, redirectUri } from "@/constants/acc.constant";
import { AUTH_HEADERS, FORM_URLENCODED_HEADERS } from "@/constants/headers.constant";
import METHOD from "@/constants/http-method.constant";
import fetchWithRetry from "@/middlewares/protectRoute";
import { getAccCookie, setAccCookie } from "@/utils/accCookie";
import { accToken } from "@/utils/token";

const token = accToken();

export const accLogin = () => {
  const state = Date.now().toString(); // Unique ID for session
  const authUrl = `${ACC_ENDPOINTS.ACC_LOGIN}&state=${state}`;
  window.open(authUrl, "_blank", "width=600,height=700");
};

export const accTokens = async (authorizationCode) => {
  try {
    const response = await fetch(ACC_ENDPOINTS.ACC_TOKEN, {
      method: METHOD.POST,
      headers: FORM_URLENCODED_HEADERS,
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        client_id: accClientId,
        client_secret: accClientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // Store the access token, expiration time & refresh token
      localStorage.setItem("acc_accessToken", data.access_token);
      localStorage.setItem("acc_expiresIn", data.expires_in);
      setAccCookie("acc_refreshToken", data.refresh_token, 30);

      // Calculate and store the expiration timestamp
      const expirationTime = Date.now() + data.expires_in * 1000;
      localStorage.setItem("acc_expirationTime", expirationTime);

      console.log("Token expiration timestamp:", new Date(expirationTime).toLocaleString());

      return data.access_token;
    } else {
      console.error("No access token in response:", data);
      return null;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

// Event listener to handle the message after user authentication
export const listenForAuthMessage = (callback) => {
  window.addEventListener("message", async (event) => {
    if (event.origin !== window.location.origin) return;

    const { code, state } = event.data;
    if (code) {
      const token = await accTokens(code);
      if (token) {
        callback(token); // Call the callback with the token if it's needed
      }
    }
  });
};

export const accRefreshToken = async () => {
  try {
    const refreshToken = getAccCookie("acc_refreshToken");

    if (!refreshToken) {
      console.error("No refresh token available. Reauthentication required.");
      return;
    }

    const response = await fetch(ACC_ENDPOINTS.ACC_TOKEN, {
      method: METHOD.POST,
      headers: FORM_URLENCODED_HEADERS,
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: accClientId,
        client_secret: accClientSecret,
      }),
    })

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("acc_accessToken", data.access_token);
      localStorage.setItem("acc_expiresIn", data.expires_in);
      setAccCookie("acc_refreshToken", data.refresh_token, 30);
      return data.access_token;
    }

  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}

export const accMe = async () => {
  try {
    return await fetchWithRetry(ACC_ENDPOINTS.ACC_ME, {
      method: METHOD.GET,
    });

  } catch (error) {
    console.error("Error in accMe:", error);
    throw error;
  }
};

export const accForms = async () => {
  try {
    const response = await fetch(ACC_ENDPOINTS.ACC_FORMS, {
      method: METHOD.GET,
      headers: AUTH_HEADERS(token),
    });

    console.log("Response status:", response);
    

    if (!response.ok) {
      throw new Error(`Failed to fetch forms: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Error in accForms:", error);
  }
};
