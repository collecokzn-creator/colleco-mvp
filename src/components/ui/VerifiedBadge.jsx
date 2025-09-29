import React from "react";

export default function VerifiedBadge({ verified }) {
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12 17.385 21.75 12 21.75 2.25 17.385 2.25 12zm13.36-1.28a.75.75 0 10-1.22-.9l-3.136 4.255-1.76-1.76a.75.75 0 10-1.06 1.061l2.25 2.25a.75.75 0 001.14-.094l3.786-5.812z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}
