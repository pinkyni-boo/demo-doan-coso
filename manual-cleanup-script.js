/**
 * Manual Browser Console Cleanup Script
 *
 * Run this script in your browser's console (F12) if you're experiencing login loops
 * or "Bearer null" errors.
 *
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Refresh the page and try logging in again
 */

console.log("🔧 Starting manual localStorage cleanup...");

// Check current state
const currentToken = localStorage.getItem("token");
const currentUser = localStorage.getItem("user");

console.log("Current token:", currentToken);
console.log("Current user:", currentUser);

// List of problematic values to clean up
const problematicValues = [
  "null",
  "undefined",
  "",
  " ",
  "NaN",
  "false",
  "true",
];

if (!currentToken || problematicValues.includes(currentToken.trim())) {
  console.log("❌ Found problematic token, removing...");
  localStorage.removeItem("token");
} else {
  console.log("✅ Token looks valid");
}

// Clean up user data if token was problematic
if (!currentToken || problematicValues.includes(currentToken.trim())) {
  console.log("❌ Removing user data due to token issues...");
  localStorage.removeItem("user");
}

// Remove any other auth-related items that might be corrupted
const allKeys = Object.keys(localStorage);
let removedKeys = [];

allKeys.forEach((key) => {
  const value = localStorage.getItem(key);
  if (key.includes("auth") || key.includes("jwt") || key.includes("session")) {
    localStorage.removeItem(key);
    removedKeys.push(key);
  }
});

if (removedKeys.length > 0) {
  console.log("🧹 Removed additional auth keys:", removedKeys);
}

console.log("✅ Cleanup completed!");
console.log("🔄 Please refresh the page and try logging in again.");
console.log("📝 If issues persist, check that:");
console.log("   - Backend server is running on port 5000");
console.log("   - JWT_SECRET is properly set in backend/.env");
console.log("   - Network connection is stable");

// Optional: Force page refresh
console.log("💡 To auto-refresh the page, run: window.location.reload()");
