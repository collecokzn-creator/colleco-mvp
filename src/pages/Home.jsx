import React from "react";
import { Link } from "react-router-dom";
import useInViewOnce from "../utils/useInViewOnce";
import PromotionsSection from "../components/PromotionsSection";
import FeaturedPackagesSection from "../components/FeaturedPackagesSection";
import logo from "../assets/colleco-logo.png";

export default function Home() {
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

  return (
    <div className="text-brand-brown">
      {/* SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      {/* Hero */}
      <section
        ref={heroRef}
        className={`relative overflow-hidden bg-gradient-to-b from-cream to-cream-sand/60 px-6 pt-10 pb-14 sm:pt-12 sm:pb-20 rounded-b-xl shadow-sm ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition duration-700`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-brand-brown">
              Plan unforgettable group adventures
            </h1>
            <p className="mt-3 text-brand-brown/80 text-base sm:text-lg max-w-prose">
              CollEco makes trip planning effortless—co-create itineraries, generate quotes, collect payments, and collaborate with partners, all in one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/plan-trip" className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-brand-orange text-white font-semibold shadow hover:bg-brand-highlight">
                Start Planning
                <span aria-hidden>→</span>
              </Link>
              <Link to="/ai" className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-brand-brown text-brand-brown bg-white/80 hover:bg-white">
                Try Trip Assist
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
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-md border border-cream-border bg-cream p-4 text-center">
            <div className="font-semibold">Secure Payments</div>
            <div className="text-brand-brown/80">PCI-aware flows and trusted processors</div>
          </div>
          <div className="rounded-md border border-cream-border bg-cream p-4 text-center">
            <div className="font-semibold">Reliable Platform</div>
            <div className="text-brand-brown/80">Rate-limited APIs and safety guardrails</div>
          </div>
          <div className="rounded-md border border-cream-border bg-cream p-4 text-center">
            <div className="font-semibold">Human Support</div>
            <div className="text-brand-brown/80">We’re here when you need us</div>
          </div>
        </div>
      </section>
      {/* Trusted by */}
      <section className="max-w-6xl mx-auto px-6 py-6">
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
          </div>
        </div>
      </section>
    </div>
  );
}