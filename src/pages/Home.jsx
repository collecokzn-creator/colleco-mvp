import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import useInViewOnce from "../utils/useInViewOnce";
import PromotionsSection from "../components/PromotionsSection";
import FeaturedPackagesSection from "../components/FeaturedPackagesSection";
import logo from "../assets/colleco-logo.png";

export default function Home() {
  const [heroRef, heroIn] = useInViewOnce({ threshold: 0.3 });
  const [featRef, featIn] = useInViewOnce({ threshold: 0.2 });
  const [howRef, howIn] = useInViewOnce({ threshold: 0.2 });
  const [ctaRef, ctaIn] = useInViewOnce({ threshold: 0.2 });
  const [hasDraft, setHasDraft] = useState(false);
  const [hasBasket, setHasBasket] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const ctaImages = [
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=2400&h=1200&fit=crop&q=90", // Zanzibar beach
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2400&h=1200&fit=crop&q=90", // Safari elephants
    "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=2400&h=1200&fit=crop&q=90", // Cape Town
    "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=2400&h=1200&fit=crop&q=90", // Mauritius
  ];

  useEffect(() => {
    try {
      const draft = localStorage.getItem('colleco.aiDraft');
      const basket = localStorage.getItem('colleco.basket');
      setHasDraft(!!draft);
      setHasBasket(basket ? JSON.parse(basket).length > 0 : false);
    } catch {}
  }, []);

  // Auto-slide images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ctaImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [ctaImages.length]);
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CollEco Travel',
    url: 'https://www.collecotravel.com',
    logo: 'https://www.collecotravel.com/logo.png'
  };

  return (
  <div className="overflow-x-hidden">
    <div className="max-w-full bg-white text-brand-brown">
      {/* SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      
      {/* Hero with Video Background */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden bg-white px-6 pt-10 pb-14 sm:pt-12 sm:pb-20 rounded-b-xl shadow-sm border-white ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            poster="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=90"
          >
            <source src="https://assets.mixkit.co/active_storage/videos/47066/47066-720.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
            <div className="mt-5 flex flex-wrap gap-3 items-center">
              <Button as={Link} to="/book" variant="primary" size="md" data-e2e="open-booking" aria-label="Book now">
                Book Now
              </Button>
              <Button as={Link} to="/plan-trip" variant="outline" size="md" aria-label="Plan a trip">
                Plan a Trip
              </Button>
              <Button as={Link} to="/ai" variant="outline" size="md" aria-label="Try Trip Assist AI">
                Try Trip Assist
              </Button>
            </div>
            <p className="mt-3 text-xs text-brand-brown/70">No credit card required • Free to get started</p>
            {(hasDraft || hasBasket) && (
              <div className="mt-4 p-3 rounded-lg bg-brand-orange/10 border border-brand-orange/30">
                <div className="text-sm font-semibold text-brand-brown mb-1 flex items-center gap-2">
                  <span>🎯</span> Continue Planning
                </div>
                <p className="text-xs text-brand-brown/70 mb-2">
                  {hasDraft && hasBasket ? 'You have a draft and items in your basket.' : hasDraft ? 'You have an AI-generated draft ready.' : 'You have items in your basket.'}
                </p>
                <div className="flex gap-2">
                  {hasDraft && <Button as={Link} to="/itinerary" size="xs" variant="primary">View Draft</Button>}
                  {hasBasket && <Button as={Link} to="/plan-trip" size="xs" variant="outline">My Basket</Button>}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-white shadow-lg border border-cream-border flex items-center justify-center overflow-hidden">
              {/* Background image behind logo */}
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=90" 
                  alt="Travel destination"
                  className="w-full h-full object-cover opacity-10"
                />
              </div>
              <img src={logo} alt="CollEco logo" className="relative z-10 h-32 w-32 sm:h-40 sm:w-40 object-contain" />
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
            <div className="text-brand-brown/80">We're here when you need us</div>
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
            { 
              title: 'AI Itineraries', 
              desc: 'Generate curated drafts in seconds; refine with your own style, budget and pace.',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            },
            { 
              title: 'Quotes & Payments', 
              desc: 'Share quotes, collect deposits or full payments, and track balances securely.',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            },
            { 
              title: 'Collaboration', 
              desc: 'Work with partners and travelers—comments, approvals, and shared updates.',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            },
            { 
              title: 'All-in-one', 
              desc: 'From discovery to booking—avoid tool sprawl and keep everything in sync.',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            },
            { 
              title: 'Metrics & Insights', 
              desc: 'Keep an eye on conversion, spend, and latency—optimize your flow.',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            },
            { 
              title: 'Safe & Reliable', 
              desc: 'Session history, rate limits, and guardrails so things stay smooth.',
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-cream-border bg-cream p-5 shadow-sm hover:shadow transition">
              <div className="mb-3 w-12 h-12 rounded bg-brand-orange flex items-center justify-center text-white shadow-sm">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg text-brand-brown mb-2">{f.title}</h3>
              <p className="text-sm text-brand-brown/70">{f.desc}</p>
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

      {/* Popular destinations with background images */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-14 bg-white">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Popular right now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: '🏖️', name: 'Zanzibar', blurb: 'Island escape with spice markets and turquoise waters.', img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=90' },
            { emoji: '🌆', name: 'Cape Town', blurb: 'Table Mountain hikes, wine country, and coastline.', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=90' },
            { emoji: '🐘', name: 'Kruger', blurb: 'Big Five safaris and unforgettable sunsets.', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=90' },
            { emoji: '🏞️', name: 'Drakensberg', blurb: 'Peaks, trails, and cozy lodges.', img: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=90' },
            { emoji: '🏝️', name: 'Mauritius', blurb: 'Resorts, reefs, and rum distilleries.', img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=90' },
            { emoji: '🏙️', name: 'Johannesburg', blurb: 'Culture, cuisine, and vibrant neighborhoods.', img: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1200&q=90' },
          ].map((d) => (
            <div key={d.name} className="group relative rounded-lg overflow-hidden border border-cream-border bg-white shadow-sm hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={d.img} 
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-brand-brown mb-1">{d.name}</h3>
                <p className="text-sm text-brand-brown/70 mb-3">{d.blurb}</p>
                <Link 
                  to={`/plan-trip?dest=${encodeURIComponent(d.name)}`} 
                  className="inline-block text-sm text-brand-orange hover:text-brand-brown font-semibold transition-colors"
                >
                  Plan {d.name} →
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA with Sliding Images */}
      <section
        ref={ctaRef}
        className={`max-w-6xl mx-auto px-6 py-16 sm:py-20 ${ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <Link 
          to="/plan-trip"
          className="relative block rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group h-[400px] sm:h-[500px]"
        >
          {/* Sliding Images */}
          <div className="absolute inset-0">
            {ctaImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Destination ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
          </div>

          {/* Strategic Text Placement */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-8 py-12">
            <h3 className="text-5xl sm:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Ready to explore?
            </h3>
            <p className="text-xl sm:text-2xl text-white/95 max-w-2xl leading-relaxed drop-shadow-lg">
              Start planning your perfect adventure
            </p>
            
            {/* Subtle indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
              {ctaImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white w-8' 
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </Link>
      </section>
    </div>
    </div>
  );
}