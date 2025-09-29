import React from "react";
import { Link } from "react-router-dom";

export default function LiveStatCard({ title, value = "—", subtext, to, icon: Icon, highlight }) {
  const Wrapper = to ? Link : "div";
  return (
    <Wrapper to={to} className="rounded border border-cream-border bg-cream p-3 hover:border-brand-orange transition block text-brand-brown">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-brown/70">{title}</p>
          <div className="text-xl font-bold flex items-center gap-2">
            <span>{value}</span>
            {highlight ? <span className={`inline-block h-2.5 w-2.5 rounded-full ${highlight}`} /> : null}
          </div>
          {subtext ? <p className="text-xs text-brand-brown/70 mt-0.5">{subtext}</p> : null}
        </div>
        {Icon ? <Icon className="h-5 w-5 text-brand-orange" /> : null}
      </div>
      <p className="text-[11px] text-brand-brown/60 mt-2">Live data placeholder — this will auto-refresh via API.</p>
    </Wrapper>
  );
}
