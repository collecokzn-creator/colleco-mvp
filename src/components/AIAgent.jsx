import React, { useState, useRef, useEffect } from "react";
import { searchHotels, searchFlights, bookHotel, bookFlight } from "../api/mockTravelApi";
import { useLocation } from "react-router-dom";
import logoPng from "../assets/colleco-logo.png";
import { motion } from "framer-motion";

// --- SMART AUTOMATION & GAMIFICATION STUBS ---
// TODO: Integrate real AI backend for natural language, auto-suggest, and learning.
// TODO: Add progress badges, trip readiness meter, and upsell suggestions.

// Note: role selection handled via free text; constants removed to reduce lint noise

// Simple NLP: extract basic intent fields
export function parseBookingIntent(text) {
  const locationMatch = text.match(/\bin\s+([A-Za-z ]+?)(?=\s+(?:from|on|for|by|at)\b|$)/i);
  const nightsMatch = text.match(/(\d+)[- ]?night/i);
  const guestsMatch = text.match(/(\d+)\s+(guests?|people|adults|kids)/i);
  const dateMatch = text.match(/\bfrom\s+(\d{4}-\d{2}-\d{2})\b/i);
  const typeMatch = text.match(/\b(hotel|flight|car|package|stay|trip)\b/i);
  return {
    location: locationMatch ? locationMatch[1].trim() : undefined,
    nights: nightsMatch ? parseInt(nightsMatch[1], 10) : undefined,
    guests: guestsMatch ? parseInt(guestsMatch[1], 10) : undefined,
    startDate: dateMatch ? dateMatch[1] : undefined,
    type: typeMatch ? typeMatch[1] : undefined
  };
}

// Clarify missing details with precise questions
export function clarifyMissingIntent(intent) {
  const prefix = 'To be accurate, I need:';
  const ask = [
    !intent.type && '• Are you looking for a hotel or flight?',
    !intent.location && '• What destination are you considering?',
    !intent.startDate && '• What start date suits you?',
    !intent.guests && '• How many guests will travel?'
  ].filter(Boolean).join('\n');
  return `${prefix}\n${ask}`;
}

// Tone engine: always pleasant, considerate, happy; professional and disciplined when needed
export const applyTone = (roleValue, raw) => {
  if (typeof raw !== 'string') return raw;
  const hasEmoji = /^[\p{Emoji}\p{Extended_Pictographic}]/u.test(raw);
  const basePrefix = hasEmoji ? '' : '😊 ';
  const professionalPrefix = hasEmoji ? '' : '✅ ';
  // Role-based tone
  if (roleValue === 'admin') {
    // Professional, concise, disciplined
    return professionalPrefix + raw + ' — I’ll handle this efficiently.';
  }
  if (roleValue === 'partner') {
    // Helpful, business-friendly
    return (hasEmoji ? '' : '🤝 ') + raw + ' — Let’s optimize together.';
  }
  // Client or unknown: warm and considerate
  return basePrefix + raw + ' — I’ve got you covered.';
};

// Detect request for concise/straightforward output
export const detectConcise = (text) => /\b(concise|short|summary|tl;dr|straightforward|straight[- ]forward)\b/i.test(text);

export default function AIAgent({ inline = false }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const popupRef = useRef(null);
  // Draggable position (persisted)
  const [pos, setPos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aiAgentPos') || 'null');
      if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') return saved;
    } catch {}
    // default offset from bottom-right
    return { x: 0, y: 0 };
  });
  useEffect(() => {
    try {
      localStorage.setItem('aiAgentPos', JSON.stringify(pos));
    } catch {}
  }, [pos]);
  const [role, setRole] = useState(null); // 'client' | 'partner' | 'admin'
  // Context-aware greeting with unique persona
  const persona = {
    name: 'Nia', // CollEco Navigator & Intelligent Assistant
    title: 'CollEco Navigator',
    traits: ['pleasant', 'considerate', 'happy', 'professional', 'disciplined', 'witty', 'detail-oriented'],
    motto: 'Clarity first, then magic.'
  };
  const getGreeting = () => {
    if (location.pathname.startsWith("/plan-trip")) {
      return `🧭 Hi, I’m ${persona.name} — your ${persona.title}. I’ll help you plan trips with clarity and a touch of magic.`;
    }
    if (location.pathname.startsWith("/bookings")) {
      return `📖 I’m ${persona.name}. Need help with bookings, front desk, or PA tasks? I’ll assist with changes, confirmations, and more.`;
    }
    if (location.pathname.startsWith("/packages")) {
      return `🎁 I’m ${persona.name}. Explore packages and get expert advice. Ask me for recommendations or details about any package.`;
    }
    if (location.pathname.startsWith("/itinerary")) {
      return `🗺️ I’m ${persona.name}. Let’s build your itinerary. I’ll organize your trip days and offer smart suggestions.`;
    }
    if (location.pathname.startsWith("/quotes")) {
      return `💬 I’m ${persona.name}. Need a quote or trip suggestion? I’ll generate a personalized quote and offer travel advice.`;
    }
    if (location.pathname.startsWith("/collab")) {
      return `🤝 I’m ${persona.name}. Collaborate, get partner help, or PA support — I’ll coordinate and share trip details.`;
    }
    // Add more page-specific greetings here
    return `👋 I’m ${persona.name}, your CollEco ${persona.title}. I’ll assist with trip planning, PA tasks, and travel advice — with clarity and care.`;
  };
  const [messages, setMessages] = useState([
    { from: 'system', text: getGreeting() }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, open]);
  // Example: user preferences, trip readiness, partner compliance, etc.
  const [progress, setProgress] = useState({ badge: 'Bronze', readiness: 40 });

  // Tone helpers are defined at module scope (see above)

  // Enable click/tap outside to close the agent popup
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // --- SMART SEARCH & BOOKING LOGIC ---

  // Magical, unforgettable, playful smart reply engine
  const smartReply = (text) => {
  const wantConcise = detectConcise(text);
    // Easter egg: magical greeting
    if (/abracadabra|magic|wow|unforgettable|master/i.test(text)) {
      return "🪄✨ You’ve unlocked the CollEco Magic! I’ll conjure up the best travel secrets, hidden gems, and unforgettable experiences just for you. Ask me anything, and prepare to be amazed!";
    }
    // Playful encouragement
    if (/help|assist|guide|suggest|recommend/i.test(text)) {
      return "🌟 As your travel wizard, I’ll guide you to the best adventures, deals, and memories. Want a surprise itinerary or a secret tip?";
    }
    // Gamified wow moment
    if (/badge|progress|level up|achievement/i.test(text)) {
      return "🏅 Congratulations! You’ve earned a CollEco Explorer badge. Keep exploring for more magical rewards!";
    }
    // Proactive magical advice
    if (/stuck|confused|lost|don’t know|can’t decide/i.test(text)) {
      return "🧙‍♂️ No worries! I’ll wave my wand and suggest the perfect trip, package, or activity. Want a random adventure or a curated experience?";
    }
    // Playful trip suggestion
    if (/surprise|random|adventure|secret/i.test(text)) {
      return "🎲 Here’s a magical surprise: a hidden beach, a secret mountain trail, and a local festival—all in one trip! Want to see more?";
    }
    // ...existing code...
    // Booking confirmation
    if (/confirm( this)? booking|book now|finalize|proceed/i.test(text)) {
      return "✅ Your booking is confirmed! Here is your magical confirmation code: COLLECO-" + Math.floor(Math.random()*1000000) + " ✨. May your journey be unforgettable!";
    }
    // Comparison queries
    if (/compare|which is better|difference|vs\.?/i.test(text)) {
      return "🔮 Let me compare your options with a touch of magic! Want a summary, highlights, or a wizard’s recommendation?";
    }
    // Follow-up questions
    if (/add car|add activity|add tour|add insurance|add breakfast|add spa/i.test(text)) {
      return "✨ Added! Your trip just got more magical. Want to add a secret experience or a local treat?";
    }
    // ...existing code...
    // --- MAGICAL SMART SEARCH & BOOKING ---
    const intent = parseBookingIntent(text);
    // If user implies booking, ask clear questions for missing details
    if (/hotel|stay|package|flight|book|reserve|trip|itinerary/i.test(text)) {
      if (!intent.location || !intent.startDate || !intent.guests || !intent.type) {
        const q = clarifyMissingIntent(intent);
        return wantConcise ? q : `${q}\n\nI’ll tailor options once I have these details.`;
      }
    }
    if (intent.type === "hotel" || /hotel|stay|package/i.test(text)) {
      if (intent.location && intent.startDate) {
        const summary = wantConcise
          ? `Searching hotels in ${intent.location} from ${intent.startDate} for ${intent.guests ?? 'N/A'} guests.`
          : `I’m searching hotels in ${intent.location} starting ${intent.startDate}${intent.nights ? ` for ${intent.nights} night(s)` : ''}${intent.guests ? ` for ${intent.guests} guest(s)` : ''}.`;
        setMessages(m => [...m, { from: 'agent', text: applyTone(role, summary) }]);
        const hotels = searchHotels({ location: intent.location, startDate: intent.startDate });
        if (hotels.length > 0) {
          return hotels.map(hotel => (
            <div key={hotel.id} className="bg-white rounded-lg shadow p-2 mb-2 flex gap-2 items-center">
              <img src={hotel.image} alt={hotel.name} className="h-12 w-12 rounded object-cover" />
              <div>
                <div className="font-bold text-brand-russty">{hotel.name}</div>
                <div className="text-xs text-brand-russty/70">{hotel.location}</div>
                <div className="text-xs">R{hotel.pricePerNight}/night</div>
                <button className="mt-1 px-2 py-0.5 bg-brand-orange text-white rounded text-xs" onClick={() => handleBookHotel(hotel.id, intent)}>Book Now</button>
              </div>
            </div>
          ));
        } else {
          return "No hotels found for your criteria. Try another location or date.";
        }
      }
    }
    if (intent.type === "flight" || /flight/i.test(text)) {
      if (intent.location && intent.startDate) {
        const summary = wantConcise
          ? `Searching flights to ${intent.location} on ${intent.startDate}.`
          : `I’m searching flights (assumed from Johannesburg) to ${intent.location} on ${intent.startDate}.`;
        setMessages(m => [...m, { from: 'agent', text: applyTone(role, summary) }]);
        // Assume 'from' is Johannesburg for demo
        const flights = searchFlights({ from: "Johannesburg", to: intent.location, date: intent.startDate });
        if (flights.length > 0) {
          return flights.map(flight => (
            <div key={flight.id} className="bg-white rounded-lg shadow p-2 mb-2 flex gap-2 items-center">
              <div>
                <div className="font-bold text-brand-russty">{flight.airline}</div>
                <div className="text-xs text-brand-russty/70">{flight.from} → {flight.to}</div>
                <div className="text-xs">R{flight.price} | {flight.date} {flight.time}</div>
                <button className="mt-1 px-2 py-0.5 bg-brand-orange text-white rounded text-xs" onClick={() => handleBookFlight(flight.id, intent)}>Book Now</button>
              </div>
            </div>
          ));
        } else {
          return "No flights found for your criteria. Try another route or date.";
        }
      }
    }
    // ...existing code...
    // Plan Trip page context-aware replies
    if (location.pathname.startsWith("/plan-trip")) {
      if (/beach|holiday|trip|package|hotel|flight|tour|itinerary|quote|budget|days|night|recommend|plan|destination|adventure|family|solo|romantic|group/i.test(text)) {
        setProgress(p => ({ ...p, readiness: Math.min(100, p.readiness + 20), badge: p.readiness + 20 >= 80 ? 'Silver' : p.badge }));
        return "✨ Here’s your magical trip plan: flights, hotel, and activities tailored for you—with a secret local experience included! Want to see the full itinerary or book now?";
      }
      if (/cancel|safety|policy/i.test(text)) {
        return "🛡️ All bookings are protected by CollEco’s magic shield—flexible cancellation and safety protocols. Want details?";
      }
  return wantConcise ? "Destination, budget, dates? I’ll plan." : "🪄 Tell me your dream trip—destination, budget, dates—and I’ll work my magic!";
    }
    // Bookings page
    if (location.pathname.startsWith("/bookings")) {
      if (/cancel|change|update|modify|reservation|book|confirm|status|details|help/i.test(text)) {
        return "🧞‍♂️ I’ll handle your booking changes, cancellations, or details with a touch of magic. What do you need?";
      }
  return wantConcise ? "Bookings: status, change, or new?" : "Ask me anything about your bookings—status, changes, or new reservations. I’ll make it easy and magical!";
    }
    // Packages page
    if (location.pathname.startsWith("/packages")) {
      if (/recommend|suggest|package|deal|offer|details|price|compare|family|adventure|luxury|budget/i.test(text)) {
        return "🎁 Here are magical travel packages that match your interests! Want more details, a secret deal, or to book?";
      }
  return wantConcise ? "Package preferences? I’ll match." : "Tell me what kind of package you’re looking for and I’ll recommend the best options—with a magical twist!";
    }
    // Itinerary page
    if (location.pathname.startsWith("/itinerary")) {
      if (/add|remove|edit|day|plan|schedule|activity|event|details|suggest/i.test(text)) {
        return "🗺️ Let’s update your itinerary! I’ll organize your trip days and add magical activities. Tell me what you want to add, remove, or change.";
      }
  return wantConcise ? "Trip details? I’ll organize." : "Share your trip plans and I’ll help organize your itinerary for each day—with a magical surprise included!";
    }
    // Quotes page
    if (location.pathname.startsWith("/quotes")) {
      if (/generate|quote|price|estimate|custom|package|details|budget|request/i.test(text)) {
        return "💬 I’ll generate a personalized quote for your trip—with a magical discount if you say ‘abracadabra’! Please provide your preferences.";
      }
  return wantConcise ? "Trip needs? I’ll quote." : "Tell me your travel needs and I’ll create a quote just for you—with a wow factor!";
    }
    // Collaborations page
    if (location.pathname.startsWith("/collab")) {
      if (/invite|share|partner|group|collaborate|details|plan|trip|event/i.test(text)) {
        return "🤝 Let’s collaborate! I’ll coordinate with partners or friends and add a magical group experience to your trip.";
      }
  return wantConcise ? "Who to collaborate with?" : "Who would you like to collaborate with? I’ll help you share trip details and plans—with a magical group bonus!";
    }
    // Default logic (other pages)
    if (!role) {
      // Role selection
      if (/client/i.test(text)) {
        setRole('client');
        return "🧑‍💼 Client mode activated! Tell me about your dream trip or budget, and I’ll suggest a magical package.";
      }
      if (/partner/i.test(text)) {
        setRole('partner');
        return "🤝 Welcome, partner! Upload your rates, licenses, and insurance here. I’ll flag any missing docs and share magical tips to boost your business.";
      }
      if (/admin/i.test(text)) {
        setRole('admin');
        return "🛡️ Admin mode: I can help you monitor compliance, payouts, and safety alerts—with magical insights!";
      }
      return "Are you a client, partner, or admin? (Hint: say ‘magic’ for a surprise!)";
    }
    // Client flow
    if (role === 'client') {
      if (/beach|holiday|trip|package|hotel|flight|tour|itinerary|quote|budget|days|night|recommend/i.test(text)) {
        setProgress(p => ({ ...p, readiness: Math.min(100, p.readiness + 20), badge: p.readiness + 20 >= 80 ? 'Silver' : p.badge }));
        return "🌴 Here’s a magical 5-day beach holiday in Mozambique: flights, hotel, tours, and a secret local experience for R9,800. Want to see the full itinerary or book now?";
      }
      if (/cancel|safety|policy/i.test(text)) {
        return "🛡️ All bookings are protected by CollEco’s magic shield—flexible cancellation and safety protocols. Want details?";
      }
      return "I’m learning your preferences. Tell me more about your ideal trip, and I’ll add a magical twist!";
    }
    // Partner flow
    if (role === 'partner') {
      if (/upload|license|insurance|rate|product|compliance/i.test(text)) {
        setProgress(p => ({ ...p, badge: 'Silver' }));
        return "📄 Thanks! I’ll review your docs and flag any issues. Want magical tips to boost your revenue?";
      }
      if (/revenue|margin|upsell|suggest/i.test(text)) {
        return "💡 Try bundling transport with your safari package for a +20% margin. Want more magical ideas?";
      }
      return "Let me know if you need onboarding help or want to see your compliance status—with magical insights!";
    }
    // Admin flow
    if (role === 'admin') {
      if (/compliance|payout|safety|alert|analytics|report/i.test(text)) {
        return "📊 Here’s the latest compliance and payout dashboard—with magical insights. Want to export audit logs or see flagged partners?";
      }
      return "I can help you monitor platform health and suggest improvements—with a touch of magic!";
    }
    return "How can I help you next?";
  };

  // Booking handlers
  function handleBookHotel(hotelId, intent) {
    const result = bookHotel(hotelId, { name: "Demo User", startDate: intent.startDate, endDate: intent.startDate, guests: intent.guests });
    setMessages(m => [...m, { from: 'agent', text: result.message }]);
  }
  function handleBookFlight(flightId, intent) {
    const result = bookFlight(flightId, { name: "Demo User", date: intent.startDate });
    setMessages(m => [...m, { from: 'agent', text: result.message }]);
  }

  const send = (text) => {
    setMessages(m => [...m, { from: 'user', text }]);
    setTimeout(() => {
      const reply = smartReply(text);
      if (Array.isArray(reply)) {
        reply.forEach(card => setMessages(m => [...m, { from: 'agent', text: card }]));
      } else {
        const toned = applyTone(role, reply);
        setMessages(m => [...m, { from: 'agent', text: toned }]);
      }
    }, 600);
  };

  // Listen for global event to re-show the agent when hidden
  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener('show-ai-agent', handler);
    return () => window.removeEventListener('show-ai-agent', handler);
  }, []);

  // Inline mode: render compact panel inside parent (e.g., Sidebar)
  if (inline) {
    return (
      <div className="w-full">
        <div className="w-full bg-cream rounded-xl shadow-lg border border-cream-border" ref={popupRef}>
          <div className="bg-brand-russty text-white rounded-t-xl px-4 py-2 font-bold flex items-center gap-2">
            <img src={logoPng} alt="CollEco Logo" className="h-5 w-5 mr-2" />
            <span>Trip Assist</span>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">Inline</span>
          </div>
          {role === 'client' && (
            <div className="flex items-center gap-2 px-4 pt-2 pb-1">
              <span className="text-xs bg-brand-highlight/20 text-brand-russty rounded px-2 py-0.5 font-bold">{progress.badge} Badge</span>
              <div className="flex-1 h-2 bg-cream-border rounded-full overflow-hidden">
                <div className="bg-brand-orange h-2" style={{ width: `${progress.readiness}%` }}></div>
              </div>
              <span className="text-xs text-brand-russty/70">{progress.readiness}%</span>
            </div>
          )}
          <div className="p-3 h-40 overflow-y-auto text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-2 inline-block max-w-[90%] rounded-lg px-2 py-1 ${
                  m.from === 'agent'
                    ? 'bg-brand-orange/10 text-brand-russty'
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
        </div>
      </div>
    );
  }

  if (!visible) return null;
  return (
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, x: pos.x, y: pos.y }}
        animate={{ opacity: 1, x: pos.x, y: pos.y }}
        transition={{ duration: 0.5 }}
      drag
      dragMomentum={false}
      dragConstraints={{ top: -window.innerHeight + 80, left: -window.innerWidth + 80, right: 0, bottom: 0 }}
      onDragEnd={(e, info) => {
        // Update relative offset from default bottom-right position
        setPos(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }));
      }}
    >
      {open ? (
        <motion.div className="w-80 bg-cream rounded-xl shadow-lg border border-cream-border" initial={{ scale: 0.98 }} animate={{ scale: 1 }} ref={popupRef}>
          <div className="bg-brand-russty text-white rounded-t-xl px-4 py-2 font-bold flex items-center gap-2">
            <img src={logoPng} alt="CollEco Logo" className="h-6 w-6 mr-2" />
            <span>CollEco AI Agent</span>
            <span className="ml-auto animate-pulse text-lg">✨</span>
          </div>
          {/* Gamification: Progress badge and readiness meter */}
          {role === 'client' && (
            <div className="flex items-center gap-2 px-4 pt-2 pb-1">
              <span className="text-xs bg-brand-highlight/20 text-brand-russty rounded px-2 py-0.5 font-bold">{progress.badge} Badge</span>
              <div className="flex-1 h-2 bg-cream-border rounded-full overflow-hidden">
                <div className="bg-brand-orange h-2 animate-progress" style={{ width: `${progress.readiness}%` }}></div>
              </div>
              <span className="text-xs text-brand-russty/70">{progress.readiness}% ready</span>
            </div>
          )}
          <div className="p-4 h-48 overflow-y-auto text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.from === 'user' ? 40 : -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`mb-2 inline-block max-w-[90%] rounded-lg px-2 py-1 shadow ${
                  m.from === 'agent'
                    ? 'bg-brand-orange/10 text-brand-russty border border-brand-orange/20'
                    : m.from === 'user'
                    ? 'bg-cream-sand text-brand-russty border border-cream-border'
                    : 'bg-transparent text-brand-orange font-semibold'
                } ${m.from === 'user' ? 'text-right' : ''}`}
              >
                {typeof m.text === 'string' ? m.text : m.text}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <AIAgentInput onSend={send} />
        </motion.div>
      ) : (
        <div className="flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setOpen(true)}
            onContextMenu={(e) => { e.preventDefault(); setVisible(false); }}
            className="rounded-full shadow-lg border border-cream-border bg-white p-2 hover:bg-cream"
            aria-label="Open AI Agent"
            title="Left-click to open. Right-click to hide."
          >
            <img src={logoPng} alt="CollEco Logo" className="h-12 w-12 object-contain" width="48" height="48" />
          </motion.button>
          <span className="mt-1 text-xs font-semibold text-brand-russty bg-white/70 px-2 py-0.5 rounded">AI Agent</span>
        </div>
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
  className="border border-cream-border rounded px-2 py-1 flex-1 bg-cream text-brand-russty placeholder-brand-russty/50"
        placeholder="Type your message..."
        onKeyDown={e => e.key === 'Enter' && v.trim() && (onSend(v), setV(''))}
        aria-label="Type your message"
      />
      <button
        onClick={() => { if (v.trim()) { onSend(v); setV(''); } }}
  className="bg-brand-orange text-white px-3 py-1 rounded hover:bg-brand-orange/90"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}
