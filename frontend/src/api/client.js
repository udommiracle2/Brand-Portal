import axios from "axios";

// In dev, Vite proxies /api and /uploads to localhost:4000 (see vite.config.js),
// so the relative "/api" default works with nothing else set.
// In production (Vercel, etc.) there's no such proxy, so VITE_API_URL must
// point at your deployed backend, e.g. https://your-backend.onrender.com/api
const API_BASE = import.meta.env.VITE_API_URL || "/api";

if (import.meta.env.PROD && API_BASE === "/api") {
  // eslint-disable-next-line no-console
  console.warn(
    "[brand-portal] VITE_API_URL is not set in this build. API calls will go to " +
      "this site's own domain (/api) instead of your backend, and will fail. " +
      "Set VITE_API_URL in your hosting provider's environment variables " +
      "(scoped to Production), then trigger a fresh deployment."
  );
}

// Product/logo images are returned as backend-relative paths like
// "/uploads/xyz.jpg". In dev that resolves through the Vite proxy; in
// production it needs the backend's origin prepended.
const MEDIA_BASE = API_BASE.replace(/\/api\/?$/, "");

export function resolveMediaUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${MEDIA_BASE}${path}`;
}

const client = axios.create({
  baseURL: API_BASE,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("bp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  return err?.response?.data?.error || fallback;
}

export default client;
