import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { markAsRead } from '../api/messaging';

/**
 * ChatBox Component
 * Real-time messaging interface for partner-to-partner and partner-to-client communication
 * 
 * Features:
 * - Thread-based conversations
 * - Real-time message updates (WebSocket ready)
 * - File attachments (images, PDFs)
 * - Typing indicators
 * - Read receipts
 * - Message search
 * - Emoji support
 */

const ChatBox = ({ conversationId, recipientId, recipientName, onClose }) => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, _setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load conversation history
  const loadMessages = React.useCallback(async () => {
    setLoading(true);
    try {
      const mockMessages = JSON.parse(localStorage.getItem(`chat_${conversationId}`) || '[]');
      setMessages(mockMessages);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    if (conversationId) {
      markAsRead(conversationId, user.id);
    }
  }, [conversationId, user.id, loadMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket listener for real-time messages (to be implemented with backend)
  useEffect(() => {
    // TODO: WebSocket connection
    // const ws = new WebSocket(`wss://api.colleco.com/chat?userId=${user.id}`);
    // ws.onmessage = (event) => {
    //   const message = JSON.parse(event.data);
    //   if (message.conversationId === conversationId) {
    //     setMessages(prev => [...prev, message]);
    //   }
    // };
    // return () => ws.close();
  }, [conversationId, user.id]);

  // loadMessages defined above with useCallback for stable reference

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !attachment) return;

    const messageData = {
      id: Date.now().toString(),
      conversationId,
      senderId: user.id,
      senderName: user.name || 'You',
      recipientId,
      content: newMessage,
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        url: attachment.url // Base64 or cloud URL
      } : null,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      // Optimistic update
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      setAttachment(null);

      // Save to localStorage (mock persistence)
      const allMessages = [...messages, messageData];
      localStorage.setItem(`chat_${conversationId}`, JSON.stringify(allMessages));

      // TODO: Send via API
      // await sendMessage(messageData);
      
      // TODO: Send via WebSocket for real-time delivery
      // ws.send(JSON.stringify(messageData));

    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Convert to base64 for preview/storage
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: file.type,
        url: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // TODO: Send typing indicator via WebSocket
    // if (!isTyping) {
    //   setIsTyping(true);
    //   ws.send(JSON.stringify({ type: 'typing', conversationId, userId: user.id }));
    // }
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {recipientName?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{recipientName || 'Partner'}</h3>
            <p className="text-xs text-gray-500">
              {isTyping ? 'typing...' : 'Active now'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isOwn = message.senderId === user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <p className="text-sm break-words">{message.content}</p>
                      
                      {message.attachment && (
                        <div className="mt-2 p-2 bg-white bg-opacity-20 rounded-lg">
                          {message.attachment.type.startsWith('image/') ? (
                            <img
                              src={message.attachment.url}
                              alt={message.attachment.name}
                              className="max-w-full rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs">{message.attachment.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-sm text-gray-700">{attachment.name}</span>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <textarea
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() && !attachment}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  );
};

export default ChatBox;
