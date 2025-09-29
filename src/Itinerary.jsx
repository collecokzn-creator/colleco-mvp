import React from "react"
import { generateItineraryPdf } from "./utils/pdfGenerators"
import { mockBookings } from "./mockData"

export default function Itinerary({ setView }) {
  const handleViewPdf = (itinerary) => {
    // This calls the function from your pdfGenerators.js file
    generateItineraryPdf(itinerary.clientName, itinerary.items, itinerary.ref)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🗺️ Itinerary Module</h2>
        <button onClick={() => setView("builder")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create New Itinerary
        </button>
      </div>
      <div className="space-y-4">
        {mockBookings.map((itinerary) => (
          <div key={itinerary.id} className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{itinerary.itineraryName}</p>
              <p className="text-sm text-gray-600">
                For: {itinerary.clientName} (Ref: {itinerary.ref})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{itinerary.items.length} days</span>
              <button onClick={() => handleViewPdf(itinerary)} className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-800">
                View PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}