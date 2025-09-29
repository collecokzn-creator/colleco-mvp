import React from "react";
import { Megaphone, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export default function PromotionsBalanceCard({ balance = 0, currency = "R", to = "/promotions" }) {
  return (
    <Link to={to} className="block rounded border border-cream-border bg-cream p-3 hover:border-brand-orange transition text-brand-brown">
      <div className="flex items-center gap-2 mb-1">
        <Megaphone className="h-5 w-5 text-brand-orange" />
        <span className="font-semibold">Promotions Balance</span>
      </div>
      <div className="text-xl font-bold">{currency} {balance.toLocaleString()}</div>
      <div className="flex items-center gap-1 text-sm mt-1 text-brand-brown/80">
        <CreditCard className="h-4 w-4" />
        <span>Top-up credits or set monthly budget</span>
      </div>
      <p className="text-[11px] text-brand-brown/60 mt-2">Self-serve ad placements and featured listings are managed here.</p>
    </Link>
  );
}
