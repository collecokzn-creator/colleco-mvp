import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import logoPng from "../assets/colleco-logo.png";

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
  const dragScopeRef = useRef(null);

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
    <div ref={dragScopeRef} className="fixed inset-0 z-50 pointer-events-none">
      <motion.div
        className="absolute bottom-6 right-6 pointer-events-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        drag
        dragElastic={0.2}
        dragMomentum={false}
        dragConstraints={dragScopeRef}
      >
      {open ? (
        <motion.div className="w-80 bg-cream rounded-2xl shadow-2xl border border-cream-border/80 overflow-hidden" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-brown to-brand-orange text-white px-4 py-2.5 font-bold">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <img src={logoPng} alt="CollEco" className="h-6 w-6" />
            </span>
            CollEco AI Concierge
            <button onClick={() => setOpen(false)} className="ml-auto rounded-full bg-white/10 px-2 py-1 text-sm font-semibold text-white hover:bg-white/20" aria-label="Close chat">
              ✕
            </button>
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-2xl shadow-brand-brown/25 backdrop-blur"
          aria-label="Open CollEco AI chat"
          title="Chat with CollEco AI"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-orange/40 via-transparent to-brand-brown/40 blur-xl" aria-hidden></span>
          <img src={logoPng} alt="CollEco logo" className="relative h-8 w-8 object-contain" />
        </motion.button>
      )}
      </motion.div>
    </div>
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
