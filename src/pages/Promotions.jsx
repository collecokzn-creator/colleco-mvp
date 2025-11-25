import React from "react";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import PromotionsBalanceCard from "../components/ui/PromotionsBalanceCard";
import Button from "../components/ui/Button.jsx";

export default function Promotions() {
  return (
    <div className="bg-cream min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-brand-brown">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown">📣 Promotions Hub</h1>
          <p className="mt-2 text-sm sm:text-base text-brand-russty max-w-prose">Manage visibility boosters: featured placements, sponsored spots and seasonal bundles.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" variant="primary">Create Campaign</Button>
            <Button size="sm" variant="outline">View History</Button>
          </div>
        </div>

        {/* Sync Banner */}
        <div className="mb-6">
          <AutoSyncBanner message="Self-serve promotions sync to search and category pages in real time." />
        </div>

        {/* Balance & Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand-brown mb-4">Account Balance</h2>
          <PromotionsBalanceCard balance={0} />
        </section>

        {/* Guidance */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-brand-brown mb-4">Placement Options</h2>
          <div className="bg-white p-5 border border-cream-border rounded-lg shadow-sm">
            <p className="mb-3 text-sm text-brand-brown/80">Boost your visibility across CollEco Travel:</p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-brand-brown/80">
              <li>Featured placements on category pages</li>
              <li>Sponsored spots in search results</li>
              <li>Seasonal campaigns and bundles</li>
            </ul>
            <p className="mt-4 text-xs text-brand-brown/70">Pricing & performance analytics coming soon. This area will surface spend rate, CTR and booking lift.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
