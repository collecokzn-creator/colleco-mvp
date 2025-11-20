import React from "react";
import { Link } from "react-router-dom";
import { WishlistButton } from "./mvp/EnhancementStubs";

// Lightweight featured packages; images omitted for now to keep bundle slim
export default function FeaturedPackagesSection() {
  const packages = [
    {
      id: "cape-winelands-getaway",
      title: "Cape Town + Winelands Getaway",
      highlights: ["Table Mountain", "Stellenbosch tastings", "Atlantic seaboard"],
      nights: 4,
      priceFrom: 899,
      to: "/plan-trip?dest=Cape%20Town&category=Tour"
    },
    {
      id: "kruger-big5-lodge",
      title: "Kruger Big 5 Lodge Stay",
      highlights: ["Private game drives", "Sundowners", "Bush braai"],
      nights: 3,
      priceFrom: 1199,
      to: "/plan-trip?dest=Kruger&category=Safari"
    },
    {
      id: "zanzibar-group-retreat",
      title: "Zanzibar Group Beach Retreat",
      highlights: ["Stone Town tour", "Reef snorkelling", "Spice farm"],
      nights: 5,
      priceFrom: 1290,
      to: "/plan-trip?dest=Zanzibar&category=Resort"
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-orange">Featured packages</h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <article key={pkg.id} className="rounded-lg border border-brand-gold bg-white p-5 shadow-sm hover:shadow transition">
            <h3 className="font-semibold text-lg leading-snug text-brand-orange">{pkg.title}</h3>
            <ul className="mt-2 text-sm text-brand-gold list-disc list-inside">
              {pkg.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="mt-3 text-sm text-brand-orange flex items-center gap-3">
              <span className="inline-flex items-center rounded bg-brand-gold/20 px-2 py-1 border border-brand-gold">{pkg.nights} nights</span>
              <span className="inline-flex items-center text-brand-gold">From ${pkg.priceFrom} pp</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link to={pkg.to} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-brand-orange text-white text-sm font-semibold hover:bg-brand-highlight transition-colors shadow-sm">
                See details
                <span aria-hidden>→</span>
              </Link>
              <div className="flex gap-2">
                <Link to="/book" className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-md bg-white text-brand-gold border-2 border-brand-gold text-sm font-semibold hover:bg-cream transition-colors shadow-sm">
                  Quick Book
                </Link>
                <WishlistButton itemId={pkg.id} itemTitle={pkg.title} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
