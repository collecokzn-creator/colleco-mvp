import React from "react";

const Icon = ({ name, className = "w-6 h-6" }) => {
  const base = "stroke-current";
  if (name === "progress")
    return (
      <svg className={`${className} ${base}`} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
        <path d="M12 7v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (name === "quotes")
    return (
      <svg className={`${className} ${base}`} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth="1.5" />
        <path d="M8 8h8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  if (name === "itinerary")
    return (
      <svg className={`${className} ${base}`} viewBox="0 0 24 24" fill="none">
        <path d="M3 7h18" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 11h12" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 15h6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  if (name === "book")
    return (
      <svg className={`${className} ${base}`} viewBox="0 0 24 24" fill="none">
        <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 21V7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return null;
};

export default function FeatureCards({
  onTrip,
  onQuotes,
  onItinerary,
  onBook,
}) {
  // safe fallback navigation if no handlers provided
  const safeNavigate = (href) => {
    if (typeof href !== "string") return;
    window.location.href = href;
  };

  const handleTrip = () => {
    if (onTrip) return onTrip();
    return safeNavigate("/trip");
  };
  const handleQuotes = () => {
    if (onQuotes) return onQuotes();
    return safeNavigate("/quotes");
  };
  const handleItinerary = () => {
    if (onItinerary) return onItinerary();
    return safeNavigate("/itinerary");
  };
  const handleBook = () => {
    if (onBook) return onBook();
    // Default: navigate to the unified Book page
    return safeNavigate('/book');
  };

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trip Progress */}
        <article className="bg-white dark:bg-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Trip Progress</h3>
              <p className="mt-2 text-sm text-amber-700">
                Select products (Basket), draft itinerary, confirm bookings & pay.
              </p>
            </div>
            <div className="bg-amber-100 p-2 rounded-md">
              <Icon name="progress" />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleTrip}
              className="relative z-10 inline-block px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Open Trip Progress"
              type="button"
            >
              View Progress
            </button>
          </div>
        </article>

        {/* Quotes */}
        <article className="bg-white dark:bg-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Quotes</h3>
              <p className="mt-2 text-sm text-amber-700">
                Generate a proposal from paid basket items.
              </p>
            </div>
            <div className="bg-amber-100 p-2 rounded-md">
              <Icon name="quotes" />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleQuotes}
              className="relative z-10 inline-block px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Open Quotes"
              type="button"
            >
              Generate Quote
            </button>
          </div>
        </article>

        {/* Itinerary */}
        <article className="bg-white dark:bg-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Itinerary</h3>
              <p className="mt-2 text-sm text-amber-700">
                All basket items populate your day plan.
              </p>
            </div>
            <div className="bg-amber-100 p-2 rounded-md">
              <Icon name="itinerary" />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleItinerary}
              className="relative z-10 inline-block px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Open Itinerary"
              type="button"
            >
              View Itinerary
            </button>
          </div>
        </article>

        {/* Book Direct */}
        <article className="bg-white dark:bg-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Book Direct</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-md">
              <Icon name="book" />
            </div>
          </div>

          <div className="mt-4">
            {/* CTA text intentionally different from the heading to avoid duplicate/overlapping words */}
            <button
              onClick={handleBook}
              className="relative z-10 inline-block px-4 py-2 bg-amber-900 text-white text-sm rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              aria-label="Book Now"
              type="button"
            >
              Book Now
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
