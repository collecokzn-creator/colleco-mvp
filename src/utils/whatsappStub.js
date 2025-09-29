// Simulates receiving an inbound WhatsApp message and logging it to a thread.
import { CHANNELS, postMessage } from "./collabStore";

export function simulateInboundWhatsApp({ bookingId, fromName = "Client", content = "Got it, thanks!", authorRole = "client" }) {
  return postMessage(bookingId, {
    authorRole,
    authorName: fromName,
    channel: CHANNELS.whatsapp,
    content,
  });
}
