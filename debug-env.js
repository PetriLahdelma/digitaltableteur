// Environment variable verification script
// Run this in browser console to check if EmailJS credentials are loaded

console.log("=== EmailJS Environment Variable Check ===");
console.log("VITE_EMAIL_SERVICE_ID:", import.meta.env.VITE_EMAIL_SERVICE_ID ? "✅ Set" : "❌ Missing");
console.log("VITE_EMAIL_TEMPLATE_ID:", import.meta.env.VITE_EMAIL_TEMPLATE_ID ? "✅ Set" : "❌ Missing");
console.log("VITE_EMAIL_PUBLIC_KEY:", import.meta.env.VITE_EMAIL_PUBLIC_KEY ? "✅ Set" : "❌ Missing");

// Show first few characters for verification (never log full keys!)
if (import.meta.env.VITE_EMAIL_SERVICE_ID) {
  console.log("Service ID starts with:", import.meta.env.VITE_EMAIL_SERVICE_ID.substring(0, 8) + "...");
}
if (import.meta.env.VITE_EMAIL_TEMPLATE_ID) {
  console.log("Template ID starts with:", import.meta.env.VITE_EMAIL_TEMPLATE_ID.substring(0, 8) + "...");
}
if (import.meta.env.VITE_EMAIL_PUBLIC_KEY) {
  console.log("Public Key starts with:", import.meta.env.VITE_EMAIL_PUBLIC_KEY.substring(0, 8) + "...");
}

console.log("=== End Check ===");