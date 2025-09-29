// Simple notification stub for push/email/SMS
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
  // Fallback: console & toast placeholder
  console.info(`[Notify:${role}] ${title} - ${body}`);
}
