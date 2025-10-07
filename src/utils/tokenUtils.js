export const getToken = () => {
  const token = localStorage.getItem("token");
  console.log(
    "Retrieved token from localStorage:",
    token ? `${token.substring(0, 20)}...` : "null"
  );

  // Check if token is string "null" or actual null
  if (
    token === "null" ||
    token === null ||
    token === undefined ||
    token === ""
  ) {
    console.warn("Invalid token detected in localStorage");
    return null;
  }

  return token;
};

export const setToken = (token) => {
  if (!token || token === "null" || token === "undefined") {
    console.error("Attempting to set invalid token:", token);
    return false;
  }

  localStorage.setItem("token", token);
  console.log("Token saved to localStorage successfully");
  return true;
};

export const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("Token and user data removed from localStorage");
};

export const isTokenValid = () => {
  const token = getToken();
  return token !== null;
};

export const debugTokenIssues = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("=== TOKEN DEBUG INFO ===");
  console.log("Raw token value:", token);
  console.log("Token type:", typeof token);
  console.log("Token length:", token ? token.length : "N/A");
  console.log("Token is null string:", token === "null");
  console.log("Token is undefined string:", token === "undefined");
  console.log("Token is empty string:", token === "");
  console.log("User data:", user);
  console.log("========================");
};
