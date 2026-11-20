const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

if (!apiUrl) throw new Error("VITE_API_URL must be set to the hosted API URL when building for production.");

export const Endpoint = apiUrl.replace(/\/$/, "");
