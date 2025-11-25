import React from "react"
import { icons } from "./mockData"
import { generateItineraryPdf, generateQuotePdf } from "./utils/pdfGenerators"

export default function Builder({ basket, setBasket, catalog, itineraryName, setItineraryName, setView }) {
  const inc = (id) => setBasket((b) => b.map((i) => (i.id === id ? { ...i, qty: (i.qty ?? 1) + 1 } : i)))
  const dec = (id) => setBasket((b) => b.map((i) => (i.id === id ? { ...i, qty: Math.max(1, (i.qty ?? 1) - 1) } : i)))
  const remove = (id) => setBasket((b) => b.filter((i) => i.id !== id))

  const add = (product) => {
    setBasket((b) => {
      const existing = b.find((i) => i.id === product.id)
      if (existing) {
        return b.map((i) => (i.id === product.id ? { ...i, qty: (i.qty ?? 1) + 1 } : i))
      }
      // Create a clean object for the basket, excluding the description
      const { id, name, category, price } = product
      const newItem = { id, name, category, price, qty: 1 }
      if (!price) {
        delete newItem.price // Ensure non-priced items are consistent
      }
      return [...b, newItem]
    })
  }

  const total = basket.reduce((s, i) => s + (i.price ? i.price * (i.qty ?? 1) : 0), 0)

  const handleGenerateQuote = () => {
    if (basket.length === 0) return alert("Basket is empty!")
    const ref = `CE-${Date.now().toString().slice(-8)}`
    // Set showAll to false to ensure only priced items are included in the quote table,
    // preventing errors with jspdf-autotable. The `true` flag is for special cases
    // where a pre-made package might intentionally show non-priced items.
    generateQuotePdf(itineraryName || "Valued Client", basket, ref, false);

    // Clear the basket and navigate to the quotes page
    setBasket([]);
    setItineraryName("");
    setView("quotes");
  }

  const handleGenerateItinerary = () => {
    if (basket.length === 0) return alert("Basket is empty!")
    const ref = `CE-${Date.now().toString().slice(-8)}`
    generateItineraryPdf(itineraryName || "Valued Client", basket, ref);
    // Clear the basket and navigate to the itinerary page
    setBasket([]);
    setItineraryName("");
    setView("itinerary");
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🛠️ Basket Builder</h2>
      <input
        className="w-full mb-4 p-2 border rounded"
        placeholder="e.g., John Smith, Cape Town Vacation"
        value={itineraryName}
        onChange={(e) => setItineraryName(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Catalog */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Product Catalog</h3>
          <div className="space-y-2">
            {catalog.map((p) => (
              <div key={p.id} className="p-3 bg-gray-50 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {icons[p.category] || icons.default} {p.name}
                  </p>
                  <p className="text-sm text-gray-600">{p.price ? `R${p.price.toFixed(2)}` : "Price on request"}</p>
                </div>
                <button onClick={() => add(p)} className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Basket */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Your Basket</h3>
          {basket.length === 0 ? (
            <div className="p-4 text-center border-2 border-dashed rounded-lg text-gray-500">
              <p>Your basket is empty.</p>
              <p className="text-sm">Add products from the catalog.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {basket.map((item) => (
                <div key={item.id} className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {icons[item.category] || icons.default} {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.price ? `R${(item.price * item.qty).toFixed(2)}` : "Not Priced"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => dec(item.id)} className="px-2 font-mono border rounded hover:bg-gray-100">
                        -
                      </button>
                      <span className="font-semibold">{item.qty}</span>
                      <button onClick={() => inc(item.id)} className="px-2 font-mono border rounded hover:bg-gray-100">
                        +
                      </button>
                      <button onClick={() => remove(item.id)} className="text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4 text-right font-bold text-lg">Total: R{total.toFixed(2)}</div>
            </div>
          )}
          {basket.length > 0 && (
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={handleGenerateQuote} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Generate Quote
              </button>
              <button onClick={handleGenerateItinerary} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate Itinerary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}