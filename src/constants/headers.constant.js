export const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const FORM_URLENCODED_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
};

export const AUTH_HEADERS = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});