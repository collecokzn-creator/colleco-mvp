import React, { useEffect, useState } from 'react';
import { loadThreads } from '../utils/collabStore.js';

export default function ZolaAdminDashboard() {
  const [threads, setThreads] = useState({});

  useEffect(() => {
    setThreads(loadThreads());
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-brand-orange">Zola Admin Dashboard</h2>
      <div className="mb-6 text-brand-brown/70 text-sm">View all open conversations, channel status, and unresolved queries.</div>
      <table className="w-full border border-cream-border rounded bg-white">
        <thead>
          <tr className="bg-cream-sand text-brand-brown text-xs">
            <th className="p-2 border-b">Booking ID</th>
            <th className="p-2 border-b">Client</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Last Message</th>
            <th className="p-2 border-b">Channel</th>
            <th className="p-2 border-b">Unread</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(threads).length === 0 ? (
            <tr><td colSpan={6} className="p-4 text-center text-brand-brown/50">No conversations yet.</td></tr>
          ) : (
            Object.values(threads).map(thread => {
              const lastMsg = thread.messages[thread.messages.length - 1] || {};
              const unread = thread.messages.filter(m => m.role === 'productOwner' && !m.read).length;
              return (
                <tr key={thread.bookingId} className="border-b">
                  <td className="p-2 text-xs">{thread.bookingId}</td>
                  <td className="p-2 text-xs">{thread.clientName}</td>
                  <td className="p-2 text-xs">{thread.status}</td>
                  <td className="p-2 text-xs">{lastMsg.text || '-'}</td>
                  <td className="p-2 text-xs">{lastMsg.channel || '-'}</td>
                  <td className="p-2 text-xs">{unread}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
