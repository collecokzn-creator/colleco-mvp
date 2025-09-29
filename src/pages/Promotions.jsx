import React from "react";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import PromotionsBalanceCard from "../components/ui/PromotionsBalanceCard";

export default function Promotions() {
  return (
    <div className="text-brand-brown">
      <h2 className="text-xl font-bold mb-4">📣 Promotions Hub</h2>
      <div className="mb-3"><AutoSyncBanner message="Self-serve promotions sync to search and category pages in real time." /></div>
      <div className="mb-4"><PromotionsBalanceCard balance={0} /></div>
      <div className="bg-cream-sand p-4 border border-cream-border rounded">
        <p className="mb-2">Boost your visibility across CollEco Travel.</p>
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li>Featured placements on category pages</li>
          <li>Sponsored spots in search results</li>
          <li>Seasonal campaigns and bundles</li>
        </ul>
        <p className="mt-3 text-brand-brown/70 text-sm">Automation-ready placeholder — pricing and campaign tools will appear here, with live spend and performance.</p>
      </div>
    </div>
  );
}
