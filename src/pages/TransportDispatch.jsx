import React from "react";

export default function TransportDispatch() {
  // This will show a list of requests and allow assignment (stub for now)
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-brand-orange">Transport Dispatch</h1>
      <div className="bg-cream-sand border rounded p-4">
        <p className="mb-2">No active requests yet.</p>
        <p className="text-sm text-brand-brown/70">Requests will appear here for assignment and status updates.</p>
      </div>
    </div>
  );
}
