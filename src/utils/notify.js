// Simple notification stub for push/email/SMS
import logger from './logger';

export function notify(role, title, body) {
  try {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  } catch {}
  // Fallback: use central logger to avoid template interpolation
  logger.warn(`Notify:${role}`, { title, body });
}
