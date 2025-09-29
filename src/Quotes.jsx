import React from "react"
import { generateQuotePdf } from "./utils/pdfGenerators"
import { mockBookings } from "./mockData"

// Helper to get styles for status badges
const getStatusClasses = (status) => {
  const base = "px-2 py-0.5 text-xs font-medium rounded-full"
  switch (status) {
    case "Accepted":
      return `${base} bg-green-100 text-green-800`
    case "Sent":
      return `${base} bg-blue-100 text-blue-800`
    case "Draft":
    default:
      return `${base} bg-yellow-100 text-yellow-800`
  }
}

export default function Quotes({ setView }) {
  // In a real app, this would likely come from props or a data fetching hook
  const quotes = mockBookings

  const handleViewPdf = (quote) => {
    // This now calls the function from your pdfGenerators.js file
    generateQuotePdf(quote.clientName, quote.items, quote.ref, true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">💼 Quotes Module</h2>
        <button onClick={() => setView("builder")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create New Quote
        </button>
      </div>
      <div className="space-y-4">
        {quotes.map((quote) => (
          <div key={quote.id} className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{quote.ref}</p>
              <p className="text-sm text-gray-600">{quote.clientName}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={getStatusClasses(quote.status)}>{quote.status}</span>
              <button onClick={() => handleViewPdf(quote)} className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-800">
                View PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}