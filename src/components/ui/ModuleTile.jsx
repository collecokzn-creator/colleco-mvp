import React from "react";
import { Link } from "react-router-dom";

export default function ModuleTile({ to = "#", icon: Icon, title, description, cta = "Open" }) {
  return (
    <Link to={to} className="block rounded border border-brand-gold bg-white p-3 hover:border-brand-orange transition text-brand-orange">
      <div className="flex items-center gap-2 mb-1">
        {Icon ? <Icon className="h-5 w-5 text-brand-orange" /> : null}
        <span className="font-semibold text-brand-orange">{title}</span>
      </div>
      {description ? <p className="text-sm text-brand-gold">{description}</p> : null}
      <div className="mt-2 text-sm font-semibold text-brand-gold">{cta} →</div>
    </Link>
  );
}
