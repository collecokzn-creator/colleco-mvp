import React from "react";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function ComplianceStatusCard({ valid = 0, expiring = 0, missing = 0, to = "/compliance" }) {
  return (
    <Link to={to} className="block rounded border border-cream-border bg-cream p-3 hover:border-brand-orange transition text-brand-brown">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-5 w-5 text-brand-orange" />
        <span className="font-semibold">Compliance Status</span>
      </div>
      <div className="text-sm flex gap-4">
        <span className="text-emerald-700">{valid} valid</span>
        <span className="text-yellow-700">{expiring} expiring</span>
        <span className="text-red-700">{missing} missing</span>
      </div>
      <p className="text-[11px] text-brand-brown/60 mt-2">Documents are checked automatically and reminders are sent before expiry.</p>
    </Link>
  );
}
