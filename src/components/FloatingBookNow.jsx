import React from 'react'

export default function FloatingBookNow({ onClick }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 pointer-events-auto">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center h-14 w-14 rounded-full bg-brand-brown text-white shadow-lg border border-cream-border hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-brand-brown/40"
        aria-label="Book Now"
        title="Book Now"
      >
        Book
      </button>
    </div>
  )
}
