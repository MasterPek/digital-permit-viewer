export const accToken = () => {
  const token = localStorage.getItem("acc_accessToken");
  if (!token) {
    console.error("Access token is missing!");
  }
  return token;
};
