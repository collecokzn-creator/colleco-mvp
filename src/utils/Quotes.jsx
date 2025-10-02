import React from "react"
import { FileText } from 'lucide-react'
import { generateQuotePdf } from './pdfGenerators'

const mockQuotes = [
  { id: 1, ref: 'CE-2025-001', clientName: 'Alice Johnson', status: 'Accepted', items: [{name:'Safari',price:5000}] },
  { id: 2, ref: 'CE-2025-002', clientName: 'Bob Williams', status: 'Sent', items: [{name:'Hike',price:1200}] },
  { id: 3, ref: 'CE-2025-003', clientName: 'Charlie', status: 'Draft', items: [{name:'City Tour',price:800}] }
]

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

export default function Quotes() {
  // In a real app, this would likely come from props or a data fetching hook
  const [quotes] = React.useState(mockQuotes)
  const [_active, _setActive] = React.useState(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quotes</h2>
      </div>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <div key={quote.id} className="p-4 bg-white border rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold">{quote.ref}</div>
              <div className="text-sm text-gray-600">{quote.clientName}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className={getStatusClasses(quote.status)}>{quote.status}</span>
              <button onClick={() => generateQuotePdf(quote.clientName, quote.items, quote.ref, true)} className="px-3 py-1 bg-gray-800 text-white rounded flex items-center gap-2">
                <FileText className="w-4 h-4" /> View PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}