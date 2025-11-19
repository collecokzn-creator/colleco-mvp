import React, { useState } from 'react';
import { RefundStatus } from '../components/mvp/EnhancementStubs';

export default function Refunds() {
  const [refunds] = useState([
    { id: 'REF001', bookingId: 'BK123', amount: 350, status: 'In Review', requestedAt: Date.now() - 86400000 },
    { id: 'REF002', bookingId: 'BK124', amount: 1200, status: 'Approved', requestedAt: Date.now() - 172800000 },
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Refund Tracking</h1>
      
      <div className="space-y-4">
        {refunds.map(refund => (
          <div key={refund.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold">Refund {refund.id}</h3>
                <p className="text-sm text-gray-600">Booking: {refund.bookingId}</p>
              </div>
              <span className="text-lg font-bold text-brand-orange">R {refund.amount}</span>
            </div>
            <RefundStatus status={refund.status} />
            <p className="text-xs text-gray-500 mt-2">
              Requested: {new Date(refund.requestedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold mb-2">Refund Process</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Requested - Your refund request has been submitted</li>
          <li>In Review - Our team is reviewing your request</li>
          <li>Approved - Refund has been approved</li>
          <li>Paid - Refund has been processed to your account</li>
        </ol>
      </div>
    </div>
  );
}
