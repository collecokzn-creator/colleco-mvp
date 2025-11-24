import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import ChatBox from './ChatBox';

/**
 * MessagingCenter Component
 * Central hub for all partner communications
 * 
 * Features:
 * - Conversation list with unread counts
 * - Partner directory for starting new chats
 * - Group conversations for multi-partner bookings
 * - Quick actions (send quote, share itinerary)
 * - Conversation search and filtering
 */

const MessagingCenter = () => {
  const { user } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [partnerDirectory, setPartnerDirectory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, partners, clients
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    loadConversations();
    loadPartnerDirectory();
  }, []);

  const loadConversations = () => {
    // Mock data - replace with API call
    const mockConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    setConversations(mockConversations);

    // TODO: Replace with API
    // const data = await getConversations(user.id);
    // setConversations(data);
  };

  const loadPartnerDirectory = () => {
    // Mock partner directory
    const mockPartners = [
      { id: 'p1', name: 'Sunshine Hotels', type: 'hotel', location: 'Durban', verified: true },
      { id: 'p2', name: 'Safari Adventures', type: 'tour_operator', location: 'Johannesburg', verified: true },
      { id: 'p3', name: 'Cape Town DMC', type: 'dmc', location: 'Cape Town', verified: true },
      { id: 'p4', name: 'Luxury Car Rentals', type: 'transport', location: 'Pretoria', verified: false },
    ];
    setPartnerDirectory(mockPartners);

    // TODO: Replace with API
    // const data = await getPartners();
    // setPartnerDirectory(data);
  };

  const startNewConversation = (partner) => {
    const newConversation = {
      id: `conv_${Date.now()}`,
      participantId: partner.id,
      participantName: partner.name,
      participantType: partner.type,
      lastMessage: '',
      timestamp: new Date().toISOString(),
      unreadCount: 0
    };

    setConversations(prev => [newConversation, ...prev]);
    localStorage.setItem('conversations', JSON.stringify([newConversation, ...conversations]));
    
    setActiveChat(newConversation);
    setShowNewChat(false);
  };

  const filteredConversations = conversations
    .filter(conv => {
      if (filter === 'unread' && conv.unreadCount === 0) return false;
      if (filter === 'partners' && conv.participantType === 'client') return false;
      if (filter === 'clients' && conv.participantType !== 'client') return false;
      
      if (searchQuery) {
        return conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getPartnerTypeIcon = (type) => {
    const icons = {
      hotel: '🏨',
      tour_operator: '🗺️',
      dmc: '🌍',
      transport: '🚗',
      activity: '🎯',
      conference: '🏢',
      client: '👤'
    };
    return icons[type] || '💼';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Conversation List */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {['all', 'unread', 'partners', 'clients'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => setShowNewChat(true)}
          className="m-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
        >
          + New Conversation
        </button>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-center">No conversations yet</p>
              <p className="text-sm text-center mt-1">Start chatting with partners!</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveChat(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                  activeChat?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                      {getPartnerTypeIcon(conv.participantType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.participantName}
                        </h3>
                        {conv.verified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <span className="text-xs text-gray-500">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatBox
            conversationId={activeChat.id}
            recipientId={activeChat.participantId}
            recipientName={activeChat.participantName}
            onClose={() => setActiveChat(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Start New Conversation</h3>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search partners..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {partnerDirectory.map(partner => (
                <div
                  key={partner.id}
                  onClick={() => startNewConversation(partner)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                    {getPartnerTypeIcon(partner.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                      {partner.verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{partner.type.replace('_', ' ')} • {partner.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenter;
