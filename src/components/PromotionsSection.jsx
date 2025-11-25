import React from "react";
import { Link } from "react-router-dom";

// Simple, image-free promotions grid with discount badges
export default function PromotionsSection() {
  const promos = [
    {
      id: "spring-safari",
      title: "Spring Safari Flash Sale",
      desc: "Save on 3–5 night lodge packages across Southern Africa.",
      discount: 20,
      cta: { to: "/plan-trip?category=Safari&dest=Kruger", label: "Explore Safaris" }
    },
    {
      id: "city-long-weekend",
      title: "City Long‑Weekend Deals",
      desc: "Cape Town and Joburg hotel bundles with activity credits.",
      discount: 15,
      cta: { to: "/plan-trip?category=Hotels&dest=Cape%20Town", label: "View City Deals" }
    },
    {
      id: "island-escape",
      title: "Island Escape Specials",
      desc: "All‑inclusive Mauritius and Zanzibar stays for groups.",
      discount: 18,
      cta: { to: "/plan-trip?category=Resort&dest=Zanzibar", label: "Plan Island Trip" }
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold">Current promotions</h2>
        <Link to="/plan-trip" className="text-brand-orange text-sm hover:underline">See all</Link>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {promos.map((p) => (
          <article key={p.id} className="rounded-lg border border-cream-border bg-cream p-5 shadow-sm hover:shadow transition">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-lg leading-snug flex-1">{p.title}</h3>
              <span className="shrink-0 inline-flex items-center rounded-md bg-brand-orange text-white text-xs font-semibold px-2 py-1">
                -{p.discount}%
              </span>
            </div>
            <p className="mt-2 text-sm text-brand-russty/80">{p.desc}</p>
            <div className="mt-4">
              <Link to={p.cta.to} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-orange text-white text-sm font-semibold hover:bg-brand-highlight">
                {p.cta.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
