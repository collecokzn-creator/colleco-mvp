import React, { useState } from 'react';

export default function AdminChat() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'Client', text: 'Hi, I need help with my booking', timestamp: Date.now() - 3600000 },
    { id: 2, from: 'Admin', text: 'Hello! I can help. What is your booking ID?', timestamp: Date.now() - 3500000 },
  ]);
  const [newMessage, setNewMessage] = useState('');

  function sendMessage() {
    if (!newMessage.trim()) return;
    
    const msg = {
      id: Date.now(),
      from: 'Admin',
      text: newMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Chat</h1>
      
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded mb-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'Admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${msg.from === 'Admin' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <p className="text-sm font-semibold mb-1">{msg.from}</p>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border p-2 rounded"
          />
          <button 
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
