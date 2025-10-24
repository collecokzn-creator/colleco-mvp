import React, { useState } from "react";

export default function Transfers() {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(1);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  async function requestQuote(e) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setQuote({
        price: 350,
        eta: "15 min",
        vehicle: "Toyota Quantum",
        driver: "Sipho M.",
      });
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-brand-orange">Request a Transfer</h1>
      <form className="space-y-4" onSubmit={requestQuote}>
        <div>
          <label className="block mb-1 font-semibold">Pickup Location</label>
          <input type="text" value={pickup} onChange={e => setPickup(e.target.value)} required className="w-full border rounded px-3 py-2" placeholder="e.g. King Shaka Airport" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Dropoff Location</label>
          <input type="text" value={dropoff} onChange={e => setDropoff(e.target.value)} required className="w-full border rounded px-3 py-2" placeholder="e.g. Oyster Box Hotel" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Date & Time</label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Passengers</label>
          <input type="number" min={1} max={12} value={pax} onChange={e => setPax(Number(e.target.value))} required className="w-24 border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-brand-orange text-white px-4 py-2 rounded font-semibold" disabled={loading}>{loading ? "Getting Quote..." : "Get Quote"}</button>
      </form>
      {quote && (
        <div className="mt-6 p-4 border rounded bg-cream-sand">
          <h2 className="font-bold text-lg mb-2 text-brand-brown">Your Quote</h2>
          <p><span className="font-semibold">Price:</span> R{quote.price}</p>
          <p><span className="font-semibold">ETA:</span> {quote.eta}</p>
          <p><span className="font-semibold">Vehicle:</span> {quote.vehicle}</p>
          <p><span className="font-semibold">Driver:</span> {quote.driver}</p>
          <button className="mt-4 bg-brand-brown text-white px-4 py-2 rounded">Book Now</button>
        </div>
      )}
    </div>
  );
}
