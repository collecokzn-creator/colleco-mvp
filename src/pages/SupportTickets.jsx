import React, { useState } from 'react';
import { SupportTicketForm } from '../components/mvp/EnhancementStubs';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), email: 'user@example.com' })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTickets(prev => [data.ticket, ...prev]);
        setMessage('');
        alert('Ticket submitted successfully!');
      } else {
        alert('Failed to submit ticket');
      }
    } catch (e) {
      alert('Error submitting ticket');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>
      
      <div className="mb-8 p-4 border rounded-xl">
        <h3 className="text-lg font-semibold mb-3">Submit a Support Ticket</h3>
        <form onSubmit={handleSubmit}>
          <textarea 
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full border rounded p-2 h-32"
            placeholder="Describe your issue..."
            required
          />
          <button 
            type="submit"
            disabled={submitting}
            className="mt-3 bg-blue-600 text-white p-2 rounded-xl w-full disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      {tickets.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Tickets</h3>
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="p-4 border rounded-xl bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Ticket #{ticket.id}</p>
                    <p className="text-sm text-gray-600 mt-1">{ticket.message}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-200">New</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
