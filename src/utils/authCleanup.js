// LocalStorage cleanup utility to fix token issues

export const cleanupLocalStorage = () => {
  console.log("Cleaning up localStorage...");

  // Get current values for debugging
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("Before cleanup - Token:", token);
  console.log("Before cleanup - User:", user);

  // Remove all auth-related items
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Also remove any other potential auth items
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (
      key.includes("auth") ||
      key.includes("jwt") ||
      key.includes("session")
    ) {
      localStorage.removeItem(key);
      console.log(`Removed ${key} from localStorage`);
    }
  });

  console.log("LocalStorage cleanup completed");
};

export const isLocalStorageCorrupted = () => {
  const token = localStorage.getItem("token");

  // Check for common corrupted values
  const corruptedValues = [
    "null",
    "undefined",
    "",
    " ",
    "NaN",
    "false",
    "true",
  ];

  if (!token) return false; // No token is fine

  return corruptedValues.includes(token.trim());
};

export const forceCleanLogin = () => {
  cleanupLocalStorage();

  // Redirect to login page
  window.location.href = "/login";
};

// Initialize on app load
export const initializeAuthCleanup = () => {
  if (isLocalStorageCorrupted()) {
    console.warn("Corrupted localStorage detected, cleaning up...");
    cleanupLocalStorage();
    console.log("Corrupted data cleaned, user can now login normally");
    // Don't redirect automatically - let the app handle routing naturally
  }
};
