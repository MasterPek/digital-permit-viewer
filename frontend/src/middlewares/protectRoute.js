import { accRefreshToken } from "@/service/acc.service";
import { accToken } from "@/utils/token";

const fetchWithRetry = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accToken()}`, // Add the access token
      },
    });

    // If the response status is 401, refresh the token and retry the request
    if (!response.ok) {
      console.warn("Token expired or invalid. Refreshing token...");

      const newToken = await accRefreshToken();
      if (newToken) {
        // Retry the request with the refreshed token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`, // Use the new token
          },
        });

        return retryResponse;
      } else {
        throw new Error("Unable to refresh token");
      }
    }

    return response; 
  } catch (error) {
    console.error("Error during fetch request:", error);
    throw error;
  }
};

export default fetchWithRetry;
