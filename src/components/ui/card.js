// src/components/ui/card.js
import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`bg-white ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
