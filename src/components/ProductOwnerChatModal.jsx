import React, { useEffect, useState } from 'react';
import { ensureThread, ROLES, CHANNELS, loadThreads, saveThreads } from '../utils/collabStore.js';

export default function ProductOwnerChatModal({ bookingId, clientName, productOwnerName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thread, setThread] = useState(null);
  const [receipts, setReceipts] = useState({});

  useEffect(() => {
    // Load or create thread for this booking
    const threads = loadThreads();
    let t = threads[bookingId];
    if (!t) {
      t = ensureThread({ id: bookingId, clientName }, [
        { role: ROLES.client, name: clientName },
        { role: ROLES.productOwner, name: productOwnerName }
      ]);
      threads[bookingId] = t;
      saveThreads(threads);
    }
    setThread(t);
    setMessages(t.messages || []);
  }, [bookingId, clientName, productOwnerName]);

  function sendMessage() {
    if (!input.trim()) return;
    const ts = Date.now();
    const msg = {
      sender: clientName,
      role: ROLES.client,
      channel: CHANNELS.inapp,
      text: input.trim(),
      ts
    };
    const threads = loadThreads();
    threads[bookingId].messages.push(msg);
    saveThreads(threads);
    setMessages([...threads[bookingId].messages]);
    setInput('');
    // Simulate read receipts
    setReceipts(r => ({ ...r, [ts]: 'sent' }));
    setTimeout(() => setReceipts(r => ({ ...r, [ts]: 'delivered' })), 1000);
    setTimeout(() => setReceipts(r => ({ ...r, [ts]: 'read' })), 2500);
    // Channel sync/fallback: if not read in 10s, offer resend
    setTimeout(() => {
      if (!receipts[ts] || receipts[ts] !== 'read') {
        if (window.confirm('Message not read in-app. Resend via WhatsApp or Email?')) {
          window.open(`https://wa.me/?text=${encodeURIComponent(msg.text)}`);
        }
      }
    }, 10000);
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
        <button className="absolute top-2 right-2 text-brand-brown" onClick={onClose}>✕</button>
        <h3 className="text-lg font-bold mb-2 text-brand-orange">Contact Product Owner</h3>
        <div className="mb-2 text-xs text-brand-brown/80">
          <strong>Booking:</strong> {bookingId} <span className="ml-2">Client: {clientName}</span> <span className="ml-2">Owner: {productOwnerName}</span>
        </div>
        <div className="mb-3 text-xs text-brand-brown/70">
          All messages are sent in-app and visible to the product owner.<br />
          <span className="block mt-1 text-[11px] text-brand-brown/50">
            <strong>Tip:</strong> Use quick action buttons for common replies.<br />
            <strong>Channel:</strong> Select your preferred channel above. Urgent messages will auto-escalate to WhatsApp.<br />
            <strong>Status:</strong> Sent (🕑), Delivered (✅), Read (👁️) icons show message progress.
          </span>
        </div>
        <div className="border rounded p-2 mb-3 h-48 overflow-y-auto bg-cream-sand">
          {messages.length === 0 ? (
            <div className="text-xs text-brand-brown/50">No messages yet.</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`mb-2 flex ${m.role === ROLES.client ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-2 py-1 rounded text-xs ${m.role === ROLES.client ? 'bg-brand-orange text-white' : 'bg-white border border-cream-border text-brand-brown'}`}>
                  <span className="font-semibold mr-1">{m.sender}:</span> {m.text}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 mb-1">
            <button className="px-2 py-1 bg-cream border border-cream-border rounded text-xs text-brand-brown hover:bg-brand-orange hover:text-white" onClick={() => setInput('Booking confirmed!')}>Booking confirmed</button>
            <button className="px-2 py-1 bg-cream border border-cream-border rounded text-xs text-brand-brown hover:bg-brand-orange hover:text-white" onClick={() => setInput('Payment received, thank you!')}>Payment received</button>
            <button className="px-2 py-1 bg-cream border border-cream-border rounded text-xs text-brand-brown hover:bg-brand-orange hover:text-white" onClick={() => setInput('Can you provide more info?')}>Request info</button>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-cream-border rounded px-2 py-1 text-sm"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
            />
            <button className="px-3 py-1 bg-brand-orange text-white rounded" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
