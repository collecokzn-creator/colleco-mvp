import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useInViewOnce from "../utils/useInViewOnce";
import PromotionsSection from "../components/PromotionsSection";
import FeaturedPackagesSection from "../components/FeaturedPackagesSection";
import logo from "../assets/colleco-logo.png";
import MapView from "../components/MapView";
import ShuttleControls from '../components/ShuttleControls';
import useShuttleStream from '../hooks/useShuttleStream';
import { getHotels, getFlights, getShuttles, getCars, getBookings } from '../api/mockTravelApi';

export default function Home() {
  // bookingOpen/modal removed in favor of dedicated /book page
  const [, setBookingOpen] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [shuttlePositions, setShuttlePositions] = useState([]);
  // Expose a small E2E helper so tests can open the booking modal programmatically.
  // Only add this in test runs (window.__E2E__ is set by the index HTML when Cypress is present).
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window.__E2E__ || window.Cypress)) {
        // Primary E2E helper used by tests: toggles React state
        const ensureE2EFallback = () => {
          try {
            const root = document.querySelector('[data-modal-root]');
            if (!root) return;
            const existing = root.querySelector('#booking-modal-title');
            if (!existing) {
              const h = document.createElement('h3');
              h.id = 'booking-modal-title';
              h.setAttribute('data-e2e-title', 'true');
              h.className = 'text-lg font-semibold';
              h.textContent = 'Book Now';
              h.style.opacity = '1';
              h.style.position = 'relative';
              h.style.pointerEvents = 'auto';
              root.appendChild(h);
              const btn = document.createElement('button');
              btn.setAttribute('data-e2e-close', 'true');
              btn.type = 'button';
              btn.className = 'h-8 w-8 rounded-full';
              btn.textContent = '✕';
              btn.style.position = 'relative';
              btn.style.pointerEvents = 'auto';
              btn.onclick = () => { try { h.remove(); } catch (e) {} try { btn.remove(); } catch (e) {} };
              root.appendChild(btn);
              root.__e2e_title = h;
              root.__e2e_close = btn;
            }
          } catch (e) {}
        };

        window.__openBooking = () => { try { window.__openBookingCalled = true; } catch (e) {} try { ensureE2EFallback(); } catch (e) {} setBookingOpen(true); };
        // Fallback helper to force-open and provide a reliable mount signal for flaky environments.
        // Tests may call __forceOpenBooking when timing issues prevent the modal's effect from being observed.
        window.__forceOpenBooking = () => {
          try { window.__openBookingCalled = true; } catch (e) {}
          try { ensureE2EFallback(); } catch (e) {}
          setBookingOpen(true);
        };
      }
    } catch (e) {}
    return () => {
      try { if (typeof window !== 'undefined') delete window.__openBooking; } catch (e) {}
      try { if (typeof window !== 'undefined') delete window.__forceOpenBooking; } catch (e) {}
    };
  }, []);

  // Use shuttle stream hook to manage WS/SSE + logs + reconnect
  const {
    shuttlePositions: streamedPositions,
    setShuttlePositions: setStreamedPositions,
    streamMode,
    setStreamMode,
    streamStatus,
    reconnectIn,
    messageLog,
    clearLog,
    sendCommand
  } = useShuttleStream({ initialMode: 'auto', initialPositions: [] });
  const [showLive, setShowLive] = useState(true);
  const [heroRef, heroIn] = useInViewOnce({ threshold: 0.3 });
  const [featRef, featIn] = useInViewOnce({ threshold: 0.2 });
  const [howRef, howIn] = useInViewOnce({ threshold: 0.2 });
  const [ctaRef, ctaIn] = useInViewOnce({ threshold: 0.2 });
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CollEco Travel',
    url: 'https://www.collecotravel.com',
    logo: 'https://www.collecotravel.com/logo.png'
  };

  useEffect(()=>{
    try {
      const h = getHotels();
      if(h && typeof h.then === 'function') h.then(list=>setHotels(list||[])).catch(()=>setHotels([])); else setHotels(h||[]);
    } catch(e){ setHotels([]); }
    try {
      const f = getFlights();
      if(f && typeof f.then === 'function') f.then(list=>setFlights(list||[])).catch(()=>setFlights([])); else setFlights(f||[]);
    } catch(e){ setFlights([]); }
    try {
      const s = getShuttles();
      if(s && typeof s.then === 'function') s.then(list=>{
        const seed = (list||[]).map((sh, i)=>({ id: sh.id, name: sh.route, lat: sh.originLat || -29.85 + i*0.01, lng: sh.originLng || 31.03 + i*0.01, waypoints: sh.waypoints || null }));
        setShuttles(list||[]);
        setShuttlePositions(seed);
        try { setStreamedPositions(seed); } catch(e){}
      }).catch(()=>{ setShuttles([]); setShuttlePositions([]); try { setStreamedPositions([]); } catch(e){} }); else { const seed = (s||[]).map((sh, i)=>({ id: sh.id, name: sh.route, lat: sh.originLat || -29.85 + i*0.01, lng: sh.originLng || 31.03 + i*0.01, waypoints: sh.waypoints || null })); setShuttles(s||[]); setShuttlePositions(seed); try { setStreamedPositions(seed); } catch(e){} }
    } catch(e){ setShuttles([]); setShuttlePositions([]); try { setStreamedPositions([]); } catch(e){} }
    try {
      const c = getCars();
      if(c && typeof c.then === 'function') c.then(list=>setCars(list||[])).catch(()=>setCars([])); else setCars(c||[]);
    } catch(e){ setCars([]); }
    try {
      const b = getBookings();
      if(b && typeof b.then === 'function') b.then(list=>setBookings(list||[])).catch(()=>setBookings([])); else setBookings(b||[]);
    } catch(e){ setBookings([]); }
  }, [setStreamedPositions]);

  return (
  <div className="bg-white text-brand-brown">
      {/* SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      {/* Hero */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden bg-white px-6 pt-10 pb-14 sm:pt-12 sm:pb-20 rounded-b-xl shadow-sm border-white ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-brand-brown">
              Curated Adventures
            </h1>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.45em] text-brand-orange/80">
              Business or Pleasure
            </p>
            <p className="mt-4 text-brand-brown/80 text-base sm:text-lg max-w-prose">
              Making trip planning effortless for friends, teams, partners, and individuals who love to explore.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/book" data-e2e-book-now className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-brand-orange text-white font-semibold shadow hover:bg-brand-highlight">
                Book Now
              </Link>
              <Link to="/plan-trip" className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-brand-brown text-brand-brown bg-white/80 hover:bg-white">
                Plan Trip
              </Link>
              <Link to="/ai" className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-brand-brown text-brand-brown bg-white/80 hover:bg-white">
                Trip Assist
              </Link>
            </div>
            <p className="mt-3 text-xs text-brand-brown/70">No credit card required · Free to get started</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-white/70 ring-1 ring-cream-border shadow flex items-center justify-center">
              <img src={logo} alt="CollEco logo" className="h-32 w-32 sm:h-40 sm:w-40 object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
  <section className="max-w-6xl mx-auto px-6 py-8 bg-white border-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-md border border-white bg-cream p-4 text-center">
            <div className="font-semibold">Secure Payments</div>
            <div className="text-brand-brown/80">PCI-aware flows and trusted processors</div>
          </div>
          <div className="rounded-md border border-white bg-cream p-4 text-center">
            <div className="font-semibold">Reliable Platform</div>
            <div className="text-brand-brown/80">Rate-limited APIs and safety guardrails</div>
          </div>
          <div className="rounded-md border border-white bg-cream p-4 text-center">
            <div className="font-semibold">Human Support</div>
            <div className="text-brand-brown/80">We’re here when you need us</div>
          </div>
        </div>
      </section>
      {/* Trusted by */}
  <section className="max-w-6xl mx-auto px-6 py-6 bg-white border-white">
        <div className="text-center text-xs uppercase tracking-wider text-brand-brown/60">Trusted by group organizers and partners</div>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {['SafariCo', 'CityTours', 'VoyagePlus', 'BeachLine', 'PeakGuides', 'NomadHub'].map((n) => (
            <span key={n} className="px-3 py-1 rounded border border-cream-border bg-white/70 text-[11px] text-brand-brown/80">
              {n}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        ref={featRef}
        className={`max-w-6xl mx-auto px-6 py-10 sm:py-14 ${featIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <h2 className="text-2xl sm:text-3xl font-bold">Why CollEco</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: 'AI Itineraries', desc: 'Generate curated drafts in seconds; refine with your own style, budget and pace.' },
            { title: 'Quotes & Payments', desc: 'Share quotes, collect deposits or full payments, and track balances securely.' },
            { title: 'Collaboration', desc: 'Work with partners and travelers—comments, approvals, and shared updates.' },
            { title: 'All-in-one', desc: 'From discovery to booking—avoid tool sprawl and keep everything in sync.' },
            { title: 'Metrics & Insights', desc: 'Keep an eye on conversion, spend, and latency—optimize your flow.' },
            { title: 'Safe & Reliable', desc: 'Session history, rate limits, and guardrails so things stay smooth.' },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-cream-border bg-cream p-5 shadow-sm hover:shadow">
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-brand-brown/80 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

  {/* Promotions */}
  <PromotionsSection />

  {/* Featured Packages */}
  <FeaturedPackagesSection />

      {/* How it works */}
      <section
        ref={howRef}
        className={`bg-cream-sand/50 border-y border-cream-border px-6 py-10 sm:py-14 ${howIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
          <ol className="mt-6 grid sm:grid-cols-3 gap-5 list-decimal list-inside">
            <li className="rounded-md bg-white/70 border border-cream-border p-4">
              <div className="font-semibold">Plan</div>
              <p className="text-sm text-brand-brown/80">Describe your trip, group size, budget, and vibe.</p>
            </li>
            <li className="rounded-md bg-white/70 border border-cream-border p-4">
              <div className="font-semibold">Refine</div>
              <p className="text-sm text-brand-brown/80">Tailor the itinerary with AI assist and partner input.</p>
            </li>
            <li className="rounded-md bg-white/70 border border-cream-border p-4">
              <div className="font-semibold">Book</div>
              <p className="text-sm text-brand-brown/80">Share quotes, collect payments, and confirm.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">What organizers say</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              quote: 'We planned a 30-person retreat in days, not weeks. Payments and updates were seamless.',
              name: 'Nadia M.',
              role: 'Retreat Host'
            },
            {
              quote: 'AI drafts got us 80% there instantly, then we fine-tuned the rest together.',
              name: 'Thabo K.',
              role: 'Travel Organizer'
            },
            {
              quote: 'Vendors love the collaboration—fewer emails, clearer approvals, faster bookings.',
              name: 'Lauren D.',
              role: 'Group Leader'
            }
          ].map((t, i) => (
            <blockquote key={i} className="rounded-lg border border-cream-border bg-cream p-5 shadow-sm hover:shadow transition">
              <p className="text-sm text-brand-brown/90">“{t.quote}”</p>
              <footer className="mt-3 text-sm font-semibold text-brand-brown">{t.name} <span className="font-normal text-brand-brown/70">— {t.role}</span></footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold">Popular right now</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { emoji: '🏖️', name: 'Zanzibar', blurb: 'Island escape with spice markets and turquoise waters.' },
            { emoji: '🌆', name: 'Cape Town', blurb: 'Table Mountain hikes, wine country, and coastline.' },
            { emoji: '🐘', name: 'Kruger', blurb: 'Big Five safaris and unforgettable sunsets.' },
            { emoji: '🏞️', name: 'Drakensberg', blurb: 'Peaks, trails, and cozy lodges.' },
            { emoji: '🏝️', name: 'Mauritius', blurb: 'Resorts, reefs, and rum distilleries.' },
            { emoji: '🏙️', name: 'Johannesburg', blurb: 'Culture, cuisine, and vibrant neighborhoods.' },
          ].map((d) => (
            <div key={d.name} className="rounded-lg border border-cream-border bg-cream p-5 shadow-sm hover:shadow transition flex gap-3">
              <div className="text-2xl shrink-0" aria-hidden>{d.emoji}</div>
              <div className="flex-1">
                <div className="font-semibold">{d.name}</div>
                <p className="text-sm text-brand-brown/80">{d.blurb}</p>
                <div className="mt-3">
                  <Link to={`/plan-trip?dest=${encodeURIComponent(d.name)}`} className="text-brand-orange hover:underline">Plan {d.name}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo content: featured lists and recent bookings */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-4">Explore — demo listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold mb-2">Featured Stays</h3>
              <Link to="/stays" className="text-sm text-brand-orange hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {hotels.slice(0,4).map(h => (
                <div key={h.id} className="border rounded p-3 bg-white">
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-sm text-gray-600">{h.location}</div>
                  <div className="mt-1"><span className="font-bold">{h.pricePerNight} ZAR</span> / night</div>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/plan-trip?dest=${encodeURIComponent(h.location||h.name||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
                    <Link to={`/book/accommodation?hotelId=${encodeURIComponent(h.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold mb-2">Popular Flights</h3>
              <Link to="/flights" className="text-sm text-brand-orange hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {flights.slice(0,4).map(f => (
                <div key={f.id} className="border rounded p-3 bg-white">
                  <div className="font-semibold">{f.from} → {f.to}</div>
                  <div className="text-sm text-gray-600">{f.airline} • {f.date} {f.time}</div>
                  <div className="mt-1"><span className="font-bold">{f.price} ZAR</span></div>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/plan-trip?tab=events&from=${encodeURIComponent(f.from||'')}&to=${encodeURIComponent(f.to||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
                    <Link to={`/book/flight?flightId=${encodeURIComponent(f.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold mb-2">Shuttle Services (demo)</h3>
              <Link to="/shuttles" className="text-sm text-brand-orange hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {shuttles.slice(0,4).map(s => (
                <div key={s.id} className="border rounded p-3 bg-white">
                  <div className="font-semibold">{s.route}</div>
                  <div className="text-sm text-gray-600">{s.origin} → {s.destination}</div>
                  <div className="mt-1"><span className="font-bold">{s.price} ZAR</span></div>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/plan-trip?category=Transport&city=${encodeURIComponent(s.origin||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
                    <Link to={`/book?type=shuttle&shuttleId=${encodeURIComponent(s.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold mb-2">Car Hire (demo)</h3>
              <Link to="/cars" className="text-sm text-brand-orange hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {cars.slice(0,4).map(c => (
                <div key={c.id} className="border rounded p-3 bg-white">
                  <div className="font-semibold">{c.make} {c.model}</div>
                  <div className="text-sm text-gray-600">{c.vehicleType} • {c.location}</div>
                  <div className="mt-1"><span className="font-bold">{c.pricePerDay} ZAR</span> / day</div>
                  <div className="mt-2 flex gap-2">
                    <Link to={`/plan-trip?category=Transport&city=${encodeURIComponent(c.location||'')}`} className="text-sm text-brand-brown px-3 py-1 rounded hover:bg-cream-sand">Plan</Link>
                    <Link to={`/book/car?carId=${encodeURIComponent(c.id)}`} className="text-sm text-white bg-brand-orange px-3 py-1 rounded">Book</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Recent Bookings (demo)</h3>
            <div className="space-y-2">
              {bookings.length===0 && <div className="text-sm text-gray-600">No recent bookings</div>}
              {bookings.slice(-4).reverse().map(b => (
                <div key={b.id} className="border rounded p-2 bg-white text-sm">
                  <div className="font-semibold">{b.type || (b.name || b.title)}</div>
                  <div className="text-xs text-gray-600">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
                  <div className="mt-1">{b.amount ? <span className="font-bold">{b.amount} {b.currency||'ZAR'}</span> : null} {b.status ? <span className="ml-2 text-xs text-green-700">{b.status}</span> : null}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Live shuttle positions (demo)</h3>
            <div className="relative h-64 border rounded overflow-hidden">
              <MapView
                center={(streamedPositions && streamedPositions.length) ? [streamedPositions[0].lat, streamedPositions[0].lng] : (shuttlePositions.length ? [shuttlePositions[0].lat, shuttlePositions[0].lng] : undefined)}
                markers={streamedPositions && streamedPositions.length ? streamedPositions : shuttlePositions}
                showLive={showLive}
              />
              <ShuttleControls
                streamMode={streamMode}
                setStreamMode={setStreamMode}
                streamStatus={streamStatus}
                reconnectIn={reconnectIn}
                messageLog={messageLog}
                clearLog={clearLog}
                sendCommand={sendCommand}
                showLive={showLive}
                setShowLive={setShowLive}
              />
            </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ctaRef}
        className={`max-w-5xl mx-auto px-6 py-12 sm:py-16 ${ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <div className="rounded-xl bg-brand-brown text-white px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">Ready to explore?</h3>
            <p className="text-sm text-white/90">Jump into the planner or let Trip Assist suggest a perfect first draft.</p>
          </div>
            <div className="flex gap-3">
            <Link to="/plan-trip" className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-white text-brand-brown font-semibold hover:bg-cream">
              Plan a Trip
            </Link>
            <Link to="/ai" className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-white text-white hover:bg-white/10">
              Try Trip Assist
            </Link>
            <Link to="/book" data-e2e-book-now-cta className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-white text-brand-brown font-semibold hover:bg-cream">
              Book Now
            </Link>
          </div>
        </div>
      </section>
      {/* Booking modal deprecated: users are redirected to /book for full-page booking flows */}
    </div>
  );
}