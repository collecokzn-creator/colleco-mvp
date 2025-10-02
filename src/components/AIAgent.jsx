import React, { useState } from "react";
import { motion } from "framer-motion";

// --- SMART AUTOMATION & GAMIFICATION STUBS ---
// TODO: Integrate real AI backend for natural language, auto-suggest, and learning.
// TODO: Add progress badges, trip readiness meter, and upsell suggestions.

// Note: role selection handled via free text; constants removed to reduce lint noise

export default function AIAgent() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null); // 'client' | 'partner' | 'admin'
  const [messages, setMessages] = useState([
    { from: 'system', text: '👋 Hi! I’m your CollEco AI Concierge. Are you a client, partner, or admin?' }
  ]);
  // Example: user preferences, trip readiness, partner compliance, etc.
  const [progress, setProgress] = useState({ badge: 'Bronze', readiness: 40 });

  // Context-aware smart reply stub
  const smartReply = (text) => {
    if (!role) {
      // Role selection
      if (/client/i.test(text)) {
        setRole('client');
        return "Great! Tell me about your dream trip or budget, and I’ll suggest a package.";
      }
      if (/partner/i.test(text)) {
        setRole('partner');
        return "Welcome, partner! Upload your rates, licenses, and insurance here. I’ll flag any missing docs.";
      }
      if (/admin/i.test(text)) {
        setRole('admin');
        return "Admin mode: I can help you monitor compliance, payouts, and safety alerts.";
      }
      return "Are you a client, partner, or admin?";
    }
    // Client flow
    if (role === 'client') {
      if (/beach|holiday|trip|package|hotel|flight|tour|itinerary|quote|budget|days|night|recommend/i.test(text)) {
        // Smart automation: auto-suggest package (stub)
        setProgress(p => ({ ...p, readiness: Math.min(100, p.readiness + 20), badge: p.readiness + 20 >= 80 ? 'Silver' : p.badge }));
        return "Here’s a 5-day beach holiday in Mozambique with flights, hotel, and tours for R9,800. Want to see the full itinerary or book now?";
      }
      if (/cancel|safety|policy/i.test(text)) {
        return "All bookings are covered by our flexible cancellation and safety protocols. Want details?";
      }
      return "I’m learning your preferences. Tell me more about your ideal trip!";
    }
    // Partner flow
    if (role === 'partner') {
      if (/upload|license|insurance|rate|product|compliance/i.test(text)) {
        setProgress(p => ({ ...p, badge: 'Silver' }));
        return "Thanks! I’ll review your docs and flag any issues. Want tips to boost your revenue?";
      }
      if (/revenue|margin|upsell|suggest/i.test(text)) {
        return "Try bundling transport with your safari package for a +20% margin. Want more ideas?";
      }
      return "Let me know if you need onboarding help or want to see your compliance status.";
    }
    // Admin flow
    if (role === 'admin') {
      if (/compliance|payout|safety|alert|analytics|report/i.test(text)) {
        return "Here’s the latest compliance and payout dashboard. Want to export audit logs or see flagged partners?";
      }
      return "I can help you monitor platform health and suggest improvements.";
    }
    return "How can I help you next?";
  };

  const send = (text) => {
    setMessages(m => [...m, { from: 'user', text }]);
    setTimeout(() => {
      const reply = smartReply(text);
      setMessages(m => [...m, { from: 'agent', text: reply }]);
    }, 600);
  };

  return (
    <motion.div className="fixed bottom-6 right-6 z-50" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {open ? (
        <motion.div className="w-80 bg-cream rounded-xl shadow-lg border border-cream-border" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
          <div className="bg-brand-brown text-white rounded-t-xl px-4 py-2 font-bold flex items-center gap-2">
            <span>🤖</span> CollEco AI Agent
            <button onClick={() => setOpen(false)} className="ml-auto text-brand-highlight hover:text-white">✕</button>
          </div>
          {/* Gamification: Progress badge and readiness meter */}
          {role === 'client' && (
            <div className="flex items-center gap-2 px-4 pt-2 pb-1">
              <span className="text-xs bg-brand-highlight/20 text-brand-brown rounded px-2 py-0.5 font-bold">{progress.badge} Badge</span>
              <div className="flex-1 h-2 bg-cream-border rounded-full overflow-hidden">
                <div className="bg-brand-orange h-2" style={{ width: `${progress.readiness}%` }}></div>
              </div>
              <span className="text-xs text-brand-brown/70">{progress.readiness}% ready</span>
            </div>
          )}
          <div className="p-4 h-48 overflow-y-auto text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 inline-block max-w-[90%] rounded-lg px-2 py-1 ${
                  m.from === 'agent'
                    ? 'bg-brand-orange/10 text-brand-brown'
                    : m.from === 'user'
                    ? 'bg-cream-sand text-brand-brown'
                    : 'bg-transparent text-brand-orange font-semibold'
                } ${m.from === 'user' ? 'text-right' : ''}`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <AIAgentInput onSend={send} />
        </motion.div>
      ) : (
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }} onClick={() => setOpen(true)} className="bg-gradient-to-r from-brand-orange to-brand-brown text-white px-4 py-2 rounded-full shadow font-bold hover:from-brand-highlight hover:to-brand-orange">Chat with AI</motion.button>
      )}
    </motion.div>
  );
}

function AIAgentInput({ onSend }) {
  const [v, setV] = useState("");
  return (
    <div className="flex gap-2 border-t border-cream-border p-2 bg-cream rounded-b-xl">
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        className="border border-cream-border rounded px-2 py-1 flex-1 bg-cream text-brand-brown placeholder-brand-brown/50"
        placeholder="Type your message..."
        onKeyDown={e => e.key === 'Enter' && v.trim() && (onSend(v), setV(''))}
        aria-label="Type your message"
      />
      <button
        onClick={() => { if (v.trim()) { onSend(v); setV(''); } }}
        className="bg-brand-orange text-white px-3 py-1 rounded hover:bg-brand-brown"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}
