import { arcGisClientId, arcGisPortalUrl, arcGisRedirectUri } from "@/constants/arcgis.constant";
import esriId from '@arcgis/core/identity/IdentityManager';
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";

const oAuthInfo = new OAuthInfo({
  appId: arcGisClientId,
  popup: true,
  popupCallbackUrl: arcGisRedirectUri,
  portalUrl: arcGisPortalUrl,
});

export const restoreCredentials = async () => {
  try {
      const savedCredential = localStorage.getItem('arcgisCredential');
      if (savedCredential) {
          const credential = JSON.parse(savedCredential);
          
          // Register the token with esriId
          esriId.registerToken({
              server: `${arcGisPortalUrl}/sharing/rest`,
              token: credential.token,
              expires: credential.expires,
              ssl: credential.ssl
          });
          
          // Also register the OAuth info
          esriId.registerOAuthInfos([oAuthInfo]);
          
          return true;
      }
      return false;
  } catch (error) {
      console.error('Error restoring credentials:', error);
      return false;
  }
};