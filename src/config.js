// Frontend runtime config (values injected via Vite env or hardcoded fallbacks)
export const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://www.travelcolleco.com';
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'collecotravel@gmail.com';
export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
