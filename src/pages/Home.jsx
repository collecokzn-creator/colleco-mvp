import React from "react";
import { Link } from "react-router-dom";
import useInViewOnce from "../utils/useInViewOnce";
import PromotionsSection from "../components/PromotionsSection";
import FeaturedPackagesSection from "../components/FeaturedPackagesSection";
import logo from "../assets/colleco-logo.png";
import birdLogo from "../assets/Globeicon.png";

export default function Home() {
  const [heroRef, heroIn] = useInViewOnce({ threshold: 0.3 });
  const [featRef, featIn] = useInViewOnce({ threshold: 0.2 });
  const [howRef, howIn] = useInViewOnce({ threshold: 0.2 });
  const [ctaRef, ctaIn] = useInViewOnce({ threshold: 0.2 });
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CollEco Travel',
    url: 'https://www.travelcolleco.com',
    logo: 'https://www.travelcolleco.com/logo.png'
  };

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
  <div className="bg-white text-brand-brown">
      {/* SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      {/* Hero */}
    <section
      ref={heroRef}
      className={`relative overflow-hidden bg-white px-4 pt-8 pb-10 rounded-b-xl ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
    >
  <div className="max-w-3xl mx-0 flex flex-col gap-6 items-start relative">
  <div className="w-full flex flex-col items-start">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-orange text-left">Curated Adventure</h1>
          <h2 className="mt-2 text-lg font-semibold text-brand-orange/90 text-left">Business or Pleasure</h2>
          <p className="mt-3 text-brand-russty text-base text-left">Making trip planning effortless for friends, teams, partners, and individuals who love to explore.</p>
          <div className="mt-5 flex flex-col gap-3 w-full max-w-md">
            <Link to="/plan-trip" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-brand-orange text-white font-semibold shadow hover:bg-brand-orange/90 w-full">Start Planning <span aria-hidden>→</span></Link>
            <Link to="/ai" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-brand-orange text-brand-orange bg-white hover:bg-brand-orange/10 w-full">Try Trip Assist</Link>
          </div>
          <p className="mt-3 text-xs text-brand-orange/80 text-left">No credit card required · Free to get started</p>
        </div>
        <div className="flex items-center justify-center gap-3 mt-6 w-full">
          <div className="flex flex-col items-center leading-tight">
            <img src={logo} alt="CollEco Travel logo" className="w-16 h-16 object-contain" />
            <span className="text-lg font-bold tracking-tight text-brand-orange -mt-1">CollEco Travel</span>
          </div>
          <img src={birdLogo} alt="CollEco globe icon" className="h-16 w-auto opacity-90" />
        </div>
      </div>
    </section>
  {/* Feature Cards Section removed as requested */}

      {/* Trust badges */}
  <section className="max-w-xl mx-auto px-4 py-6">
    <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="rounded-md border border-brand-gold bg-white p-4 text-center">
            <div className="font-semibold text-brand-orange">Secure Payments</div>
            <div className="text-brand-orange/80">PCI-aware flows and trusted processors</div>
          </div>
          <div className="rounded-md border border-brand-gold bg-white p-4 text-center">
            <div className="font-semibold text-brand-orange">Reliable Platform</div>
            <div className="text-brand-orange/80">Rate-limited APIs and safety guardrails</div>
          </div>
          <div className="rounded-md border border-brand-gold bg-white p-4 text-center">
            <div className="font-semibold text-brand-orange">Human Support</div>
            <div className="text-brand-orange/80">We’re here when you need us</div>
          </div>
        </div>
      </section>
      {/* Trusted by */}
  <section className="max-w-xl mx-auto px-4 py-4">
      <div className="text-center text-xs uppercase tracking-wider text-brand-brown/60">Trusted by group organizers and partners</div>
  <div className="mt-3 flex flex-wrap justify-center gap-2">
          {['SafariCo', 'CityTours', 'VoyagePlus', 'BeachLine', 'PeakGuides', 'NomadHub'].map((n) => (
                <span key={n} className="px-3 py-1 rounded border border-cream-border bg-white text-[11px] text-brand-brown/70">
              {n}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        ref={featRef}
        className={`max-w-xl mx-auto px-4 py-6 ${featIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <h2 className="text-xl font-bold text-center">Why CollEco</h2>
        <div className="mt-6 grid grid-cols-1 gap-4">
          {[
            { title: 'AI Itineraries', desc: 'Generate curated drafts in seconds; refine with your own style, budget and pace.' },
            { title: 'Quotes & Payments', desc: 'Share quotes, collect deposits or full payments, and track balances securely.' },
            { title: 'Collaboration', desc: 'Work with partners and travelers—comments, approvals, and shared updates.' },
            { title: 'All-in-one', desc: 'From discovery to booking—avoid tool sprawl and keep everything in sync.' },
            { title: 'Metrics & Insights', desc: 'Keep an eye on conversion, spend, and latency—optimize your flow.' },
            { title: 'Safe & Reliable', desc: 'Session history, rate limits, and guardrails so things stay smooth.' },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-cream-border bg-white p-5 shadow-sm hover:shadow">
              <h3 className="font-semibold text-lg text-brand-orange">{f.title}</h3>
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
        className={`bg-cream-sand/50 border-y border-cream-border px-4 py-6 ${howIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-center">How it works</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 list-decimal list-inside">
            <li className="rounded-md bg-white border border-cream-border p-4">
              <div className="font-semibold">Plan</div>
              <p className="text-sm text-brand-brown/80">Describe your trip, group size, budget, and vibe.</p>
            </li>
            <li className="rounded-md bg-white border border-cream-border p-4">
              <div className="font-semibold">Refine</div>
              <p className="text-sm text-brand-brown/80">Tailor the itinerary with AI assist and partner input.</p>
            </li>
            <li className="rounded-md bg-white border border-cream-border p-4">
              <div className="font-semibold">Book</div>
              <p className="text-sm text-brand-brown/80">Share quotes, collect payments, and confirm.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-center">What organizers say</h2>
        <div className="mt-6 grid grid-cols-1 gap-4">
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
            <blockquote key={i} className="rounded-lg border border-cream-border bg-white p-5 shadow-sm hover:shadow transition">
              <p className="text-sm text-brand-brown">“{t.quote}”</p>
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
            <div key={d.name} className="rounded-lg border border-cream-border bg-white p-5 shadow-sm hover:shadow transition flex gap-3">
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

      {/* CTA */}
      <section
        ref={ctaRef}
        className={`max-w-5xl mx-auto px-6 py-12 sm:py-16 ${ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <div className="rounded-xl bg-cream border border-brand-orange text-brand-brown px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">Ready to explore?</h3>
            <p className="text-sm text-brand-brown/80">Jump into the planner or let Trip Assist suggest a perfect first draft.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/plan-trip" className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-brand-orange text-white font-semibold hover:bg-brand-orange/90">
              Plan a Trip
            </Link>
            <Link to="/ai" className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-brand-orange text-brand-orange hover:bg-brand-orange/10">
              Try Trip Assist
            </Link>
          </div>
        </div>
      </section>

      {/* Footer is rendered globally by RootLayout; remove page-level footer to avoid duplication */}
    </div>
  );
}