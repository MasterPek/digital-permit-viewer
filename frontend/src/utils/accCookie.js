export const setAccCookie = (name, value, days) => {
  const now = new Date();
  now.setTime(now.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + now.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
}

export const getAccCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}