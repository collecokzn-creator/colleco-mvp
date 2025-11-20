import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function TransferChat({ requestId, role = 'customer' }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:${window.location.port || '4000'}/ws/transfer/${requestId}`;
    
    // Fallback: Use polling if WebSocket not available
    if (!window.WebSocket) {
      startPolling();
      return;
    }

    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'join', requestId, role }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setMessages(prev => [...prev, data.message]);
          } else if (data.type === 'history') {
            setMessages(data.messages || []);
          }
        } catch (e) {
          // Ignore parse errors
        }
      };
      
      socket.onerror = () => {
        startPolling();
      };
      
      setWs(socket);
      
      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (e) {
      startPolling();
    }
  }, [requestId, role, startPolling]);

  const startPolling = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transfers/request/${requestId}/messages`);
        const data = await res.json();
        if (data.ok && data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error('[chat] poll failed', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      requestId,
      from: role,
      text: newMessage,
      timestamp: Date.now()
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', message }));
    } else {
      // Fallback: HTTP POST
      try {
        await fetch(`/api/transfers/request/${requestId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
      } catch (e) {
        console.error('[chat] send failed', e);
      }
    }

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-800">
          {role === 'customer' ? '💬 Chat with Driver' : '💬 Chat with Customer'}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start chatting!</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.from === role ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.from === role
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
