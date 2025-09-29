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

export default function ItinerariesPage({ itineraries, onOpen }) {
  return (
    <motion.div className="max-w-2xl mx-auto p-6 border rounded-xl bg-white/80 shadow-lg"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold mb-4">My Saved Itineraries</h3>
      <AnimatePresence>
        {itineraries.length === 0 ? (
          <motion.p exit={{ opacity: 0 }} className="text-gray-500">No itineraries saved yet. Generate one from your basket.</motion.p>
        ) : (
          <ul className="space-y-4">
            {itineraries.map((it, idx) => (
              <motion.li
                key={idx}
                className="border rounded p-3 bg-yellow-50 hover:bg-yellow-100 transition shadow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-500">
                      Ref: {it.ref} | {new Date(it.created).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpen(it.name, it.items, it.ref)}
                    className="bg-blue-700 text-white px-3 py-1 rounded shadow hover:bg-blue-900 transition"
                  >
                    Download PDF
                  </button>
                </div>
                <ul className="text-sm list-disc ml-5 text-gray-700">
                  {it.items.map((item, i) => (
                    <li key={i}>
                      {icons[item.category]} {item.name} x{item.qty ?? 1}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
