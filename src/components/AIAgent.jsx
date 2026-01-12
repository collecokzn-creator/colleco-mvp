import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import logoPng from "../assets/colleco-logo.png";
import voiceAgent from "../utils/voiceAgent";
import { getZolaResponse } from "../utils/zolaConversation";

// --- SMART AUTOMATION & GAMIFICATION STUBS ---
// TODO: Integrate real AI backend for natural language, auto-suggest, and learning.
// TODO: Add progress badges, trip readiness meter, and upsell suggestions.

// Note: role selection handled via free text; constants removed to reduce lint noise

// Helper functions exported for unit tests. These are lightweight and deterministic
// to keep tests fast and avoid coupling to the UI internals.
export function parseBookingIntent(text) {
  // Very small parser used by tests: extract location, date, nights and guests.
  // Capture the location after "in" but stop before common delimiters like
  // "from", "for", "," or end-of-string to avoid including trailing words.
  const locationMatch = text.match(/in\s+([A-Za-z ]+?)(?:\sfrom|\sfor|,|$)/i);
  const dateMatch = text.match(/(20\d{2}-\d{2}-\d{2})/);
  const nightsMatch = text.match(/(\d+)\s+nights?/i);
  const guestsMatch = text.match(/(\d+)\s+guests?/i);
  const type = /hotel|flight|car|stay/.test(text) ? 'hotel' : 'unknown';
  return {
    location: locationMatch ? locationMatch[1].trim() : undefined,
    startDate: dateMatch ? dateMatch[1] : undefined,
    nights: nightsMatch ? Number(nightsMatch[1]) : undefined,
    guests: guestsMatch ? Number(guestsMatch[1]) : undefined,
    type,
  };
}

export function clarifyMissingIntent(obj) {
  const parts = [];
  if (!obj.type) parts.push('hotel or flight');
  if (!obj.location) parts.push('destination');
  if (!obj.startDate) parts.push('start date');
  if (!obj.guests) parts.push('guests');
  return `I need details: ${parts.join(', ')}`;
}

export function applyTone(role, text) {
  if (role === 'client') return `I’ve got you covered — ${text}`;
  if (role === 'admin') return `I’ll handle this efficiently — ${text}`;
  return text;
}

export function detectConcise(text) {
  return /(tl;dr|summary|straightforward|be straight)/i.test(text);
}

export default function AIAgent() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(null); // 'client' | 'partner' | 'admin'
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Hi I\'m Zola, I\'m here to assist you. What can I help you with today?' }
  ]);
  // Example: user preferences, trip readiness, partner compliance, etc.
  const [progress, setProgress] = useState({ badge: 'Bronze', readiness: 40 });
  const [isListening, setIsListening] = useState(false);
  const dragScopeRef = useRef(null);
  const messagesRef = useRef(null);

  // Listen for custom event to open AIAgent from booking confirmations
  useEffect(() => {
    const handleOpenAIAgent = () => {
      setOpen(true);
    };

    window.addEventListener('openAIAgent', handleOpenAIAgent);

    return () => {
      window.removeEventListener('openAIAgent', handleOpenAIAgent);
    };
  }, []);

  // Listen for voice responses from voiceAgent
  useEffect(() => {
    const handleVoiceResponse = (event) => {
      setMessages(prev => [...prev, {
        from: 'system',
        text: event.detail.text
      }]);
    };

    window.addEventListener('colleco:voice-response', handleVoiceResponse);

    return () => {
      window.removeEventListener('colleco:voice-response', handleVoiceResponse);
    };
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      voiceAgent.stopListening();
      setIsListening(false);
    } else {
      const started = voiceAgent.startListening();
      if (started) {
        setIsListening(true);
        if (!open) setOpen(true); // Open panel when voice starts
         // Set up callback for voice input
         voiceAgent.onTranscript = (text) => {
           // Add user message
           setMessages(m => [...m, { from: 'user', text }]);
           // Get Zola's response
           setTimeout(() => {
             const reply = getZolaResponse(text);
             setMessages(m => [...m, { from: 'agent', text: reply }]);
             // Speak the response
             voiceAgent.speak(reply, { skipHistory: true });
           }, 300);
         };
      }
    }
  };

  // Snap above footer on mobile when dragged near bottom
  const handleDragEnd = (event, info) => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 640; // sm breakpoint
    if (!isMobile) return;
    
    const safeZone = 96; // 96px = bottom-24 default offset
    const viewportHeight = window.innerHeight;
    
    // Get current bottom position (viewport height - element's bottom edge)
    const elementBottom = viewportHeight - (info.point.y + 64); // assuming button height ~64px
    
    // If dragged below safe zone, snap it back above footer
    if (elementBottom < safeZone) {
      // Trigger a snap animation by updating position via state/transform
      // Since framer-motion controls position, we rely on dragConstraints to prevent going too low
      // But we can add a gentle "pull back" effect by resetting drag
      event.target.style.transform = '';
    }
  };

  // Context-aware smart reply stub
  const _smartReply = (text) => {
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
      const reply = getZolaResponse(text);
      setMessages(m => [...m, { from: 'agent', text: reply }]);
    }, 600);
  };

  // Auto-scroll messages container to keep the latest messages and input visible
  useEffect(() => {
    if (messagesRef.current) {
      // scroll to bottom
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={dragScopeRef} className="fixed inset-0 z-toast pointer-events-none">
      <motion.div
        className="fixed right-4 sm:right-6 bottom-20 sm:bottom-6 pointer-events-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        drag
        dragElastic={0.2}
        dragMomentum={false}
        dragConstraints={dragScopeRef}
        onDragEnd={handleDragEnd}
      >
      {open ? (
        <motion.div className="w-[min(20rem,92vw)] bg-surface rounded-2xl shadow-2xl border border-cream-border/80 overflow-hidden" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 font-bold border-b border-cream-border">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange/10">
              <img src={logoPng} alt="CollEco" className="h-6 w-6" />
              <span className="absolute -left-3 top-0 h-full w-1 bg-brand-orange rounded-full" aria-hidden></span>
            </span>
            <span className="text-brand-russty">Zola · AI Concierge</span>
            <button 
              onClick={toggleVoice}
              className={`rounded-full px-2 py-1 text-sm font-semibold transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                  : 'bg-brand-orange text-white hover:bg-orange-600'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              title={isListening ? 'Stop voice' : 'Voice input'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button onClick={() => setOpen(false)} className="rounded-full bg-brand-orange text-white px-2 py-1 text-sm font-semibold hover:bg-brand-brown" aria-label="Close chat">
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
          <div ref={messagesRef} className="p-4 h-48 overflow-y-auto text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 inline-block max-w-[90%] rounded-lg px-2 py-1 ${
                  m.from === 'agent'
                    ? 'bg-white text-brand-russty border border-amber-100'
                    : m.from === 'user'
                    ? 'bg-cream-sand text-brand-russty'
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
        <div className="flex flex-col items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-2xl shadow-brand-brown/25 backdrop-blur"
            aria-label="Open Zola AI chat"
            title="Chat with Zola"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-orange/40 via-transparent to-brand-brown/40 blur-xl" aria-hidden></span>
            <img src={logoPng} alt="Zola" className="relative h-8 w-8 object-contain" />
          </motion.button>
          <span className="text-xs font-semibold text-brand-brown bg-white/90 px-2 py-0.5 rounded-full shadow-sm">Zola</span>
        </div>
      )}
      </motion.div>
    </div>
  );
}

function AIAgentInput({ onSend }) {
  const [v, setV] = useState("");
  return (
    <div className="flex gap-2 border-t border-cream-border p-2 bg-white rounded-b-xl">
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        className="border border-cream-border rounded px-2 py-1 flex-1 bg-white text-brand-russty placeholder-brand-brown/50"
        placeholder="Ask me anything... (e.g., Plan a 5-day Cape Town trip)"
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
