import React from "react";
import { Link } from "react-router-dom";

export default function ModuleTile({ to = "#", icon: Icon, title, description, cta = "Open" }) {
  return (
    <Link to={to} className="block rounded border border-cream-border bg-cream p-3 hover:border-brand-orange transition text-brand-brown">
      <div className="flex items-center gap-2 mb-1">
        {Icon ? <Icon className="h-5 w-5 text-brand-brown" /> : null}
        <span className="font-semibold">{title}</span>
      </div>
      {description ? <p className="text-sm text-brand-brown/80">{description}</p> : null}
      <div className="mt-2 text-sm font-semibold text-brand-orange">{cta} →</div>
    </Link>
  );
}
