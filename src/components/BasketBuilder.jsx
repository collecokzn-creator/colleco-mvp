import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const icons = {
  flight: "🛫",
  hotel: "🏨",
  car: "🚗",
  hike: "🥾",
  dining: "🍽️",
  activity: "🎉",
};

export default function BasketBuilder({
  catalog,
  basket,
  setBasket,
  itineraryName,
  setItineraryName,
  total,
  showAllInQuote,
  setShowAllInQuote,
  onGenerateItinerary,
  onGenerateQuote,
}) {
  const inc = (id) =>
    setBasket((b) =>
      b.map((i) => (i.id === id ? { ...i, qty: (i.qty ?? 1) + 1 } : i))
    );
  const dec = (id) =>
    setBasket((b) =>
      b.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, (i.qty ?? 1) - 1) } : i
      )
    );
  const remove = (id) => setBasket((b) => b.filter((i) => i.id !== id));
  const add = (p) =>
    setBasket((b) => {
      const idx = b.findIndex((i) => i.id === p.id);
      if (idx >= 0) {
        const copy = [...b];
        copy[idx].qty = (copy[idx].qty ?? 1) + 1;
        return copy;
      }
      return [...b, { ...p, qty: 1 }];
    });

  return (
    <motion.div className="max-w-4xl mx-auto p-6 border rounded-xl bg-white/80 shadow-lg"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4">Basket Builder</h2>
      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="Itinerary / Destination name (optional)"
        value={itineraryName}
        onChange={(e) => setItineraryName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Catalog */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-medium mb-2">Browse Products</h3>
          <ul className="space-y-2">
            {catalog.map((p) => (
              <motion.li
                key={p.id}
                className="flex items-center justify-between border rounded p-2 bg-cream-sand hover:bg-cream-hover transition"
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <div className="font-medium">
                    {icons[p.category]} {p.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {p.price ? `R${p.price.toFixed(2)}` : "Not Priced"}
                  </div>
                </div>
                <button onClick={() => add(p)} className="bg-brand-orange text-white px-3 py-1 rounded shadow hover:bg-brand-gold transition">Add</button>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Basket */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-medium mb-2">Your Basket</h3>
          <AnimatePresence>
            {basket.length === 0 ? (
              <motion.p exit={{ opacity: 0 }} className="text-gray-500">No items yet. Add from the catalog.</motion.p>
            ) : (
              <ul className="space-y-2 mb-4">
                {basket.map((item) => (
                  <motion.li
                    key={item.id}
                    className="flex items-center justify-between border rounded p-2 bg-yellow-50 hover:bg-yellow-100 transition"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <div className="font-medium">{icons[item.category]} {item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.price ? (
                          <>R{item.price.toFixed(2)} × {item.qty ?? 1} = R{(item.price * (item.qty ?? 1)).toFixed(2)}</>
                        ) : (
                          <>Not Priced × {item.qty ?? 1}</>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => dec(item.id)} className="px-2 border rounded">-</button>
                      <span>{item.qty ?? 1}</span>
                      <button onClick={() => inc(item.id)} className="px-2 border rounded">+</button>
                      <button onClick={() => remove(item.id)} className="text-brand-russty hover:text-brand-brown">Remove</button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>
          <div className="font-semibold mb-4">Total: R{total.toFixed(2)}</div>
          <div className="mb-2">
            <label>
              <input type="checkbox" checked={showAllInQuote} onChange={(e) => setShowAllInQuote(e.target.checked)} />{" "}
              Include non-priced items in Quote
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={onGenerateItinerary} className="bg-brand-orange text-white px-3 py-2 rounded hover:bg-brand-gold transition">Generate Itinerary</button>
            <button onClick={onGenerateQuote} className="bg-brand-gold text-white px-3 py-2 rounded hover:bg-brand-orange transition">Generate Quote</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
