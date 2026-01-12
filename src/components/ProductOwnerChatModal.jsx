import React, { useEffect, useState, useRef } from 'react';import { motion } from 'framer-motion';import {
  MessageSquare, Phone, Video, Search, BellOff, Bell,
  Shield, Lock, UserPlus, UserMinus, UserCheck, AlertCircle,
  Mic, MicOff, VideoIcon, VideoOff, Heart, Maximize, Minimize,
  Calendar, MonitorUp, X
} from 'lucide-react';
import { ensureThread, ROLES, CHANNELS, loadThreads, saveThreads } from '../utils/collabStore.js';

// Mock contact data
const MOCK_CONTACTS = [
  { id: 'contact-1', name: 'Sarah Johnson', role: ROLES.client, company: 'TechCorp', avatar: 'SJ', status: 'online', lastSeen: null },
  { id: 'contact-2', name: 'Mike Chen', role: ROLES.productOwner, company: 'Adventure Co', avatar: 'MC', status: 'online', lastSeen: null },
  { id: 'contact-3', name: 'Emma Davis', role: ROLES.agent, company: 'Travel Partners', avatar: 'ED', status: 'offline', lastSeen: '2 hours ago' },
  { id: 'contact-4', name: 'James Wilson', role: ROLES.client, company: 'Global Inc', avatar: 'JW', status: 'online', lastSeen: null },
  { id: 'contact-5', name: 'Lisa Martinez', role: ROLES.productOwner, company: 'Luxury Tours', avatar: 'LM', status: 'offline', lastSeen: '1 day ago' }
];

export default function ProductOwnerChatModal({ bookingId, clientName, _productOwnerName, _onClose }) {
  // Open/Close State
  const [open, setOpen] = useState(false);
  
  // Contact & Chat State
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [contacts] = useState(MOCK_CONTACTS);
  
  // Mute State
  const [mutedContacts, setMutedContacts] = useState(() => {
    const saved = localStorage.getItem('colleco.mutedContacts');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Call State
  const [showCallModal, setShowCallModal] = useState(null); // null | 'voice' | 'video'
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | connected | ended
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Schedule & Screen Share State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [scheduledMeetings, setScheduledMeetings] = useState(() => {
    const saved = localStorage.getItem('colleco.scheduledMeetings');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Security & Multi-Person Calling State
  const [callId, setCallId] = useState(null);
  const [callParticipants, setCallParticipants] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isCallHost, setIsCallHost] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Reactions State
  const [showReactions, setShowReactions] = useState(false);
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  // On mobile, show contact list by default; hide it when a contact is selected
  const [showContactList, setShowContactList] = useState(true);
  
  // In-Call Chat State
  const [showInCallChat, setShowInCallChat] = useState(false);
  const [inCallMessage, setInCallMessage] = useState('');
  
  const [_thread, setThread] = useState(null);
  const [receipts, setReceipts] = useState({});
  const dragScopeRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  // Load messages for selected contact
  useEffect(() => {
    if (!selectedContact) return;
    
    // On mobile, hide contact list when a contact is selected
    if (window.innerWidth < 640) {
      setShowContactList(false);
    }
    
    const contactBookingId = `${bookingId}-${selectedContact.id}`;
    const threads = loadThreads();
    let t = threads[contactBookingId];
    if (!t) {
      t = ensureThread({ id: contactBookingId, clientName }, [
        { role: ROLES.client, name: clientName },
        { role: selectedContact.role, name: selectedContact.name }
      ]);
      threads[contactBookingId] = t;
      saveThreads(threads);
    }
    setThread(t);
    setMessages(t.messages || []);
    // Focus the input after selecting a contact (allow layout to settle)
    setTimeout(() => {
      try { inputRef.current?.focus(); } catch {}
      try { messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' }); } catch {}
    }, 0);
  }, [selectedContact, bookingId, clientName]);

  // When modal opens and a contact is already selected, focus the input
  useEffect(() => {
    if (open && selectedContact) {
      setTimeout(() => { try { inputRef.current?.focus(); } catch {} }, 0);
    }
  }, [open, selectedContact]);

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  // Persist muted contacts
  useEffect(() => {
    localStorage.setItem('colleco.mutedContacts', JSON.stringify(mutedContacts));
  }, [mutedContacts]);

  // Security Functions
  function generateSecureCallId() {
    return `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function initiateCall(type) {
    if (!selectedContact) return;
    
    const newCallId = generateSecureCallId();
    setCallId(newCallId);
    setIsCallHost(true);
    setCallParticipants([
      { id: 'you', name: clientName, role: ROLES.client, isHost: true, joinedAt: Date.now() },
      { id: selectedContact.id, name: selectedContact.name, role: selectedContact.role, isHost: false, joinedAt: null }
    ]);
    
    setShowCallModal(type);
    setCallStatus('calling');
    setCallDuration(0);
    setIsVideoEnabled(type === 'video');
    setIsAudioEnabled(true);
    
    // Hide Zola during calls
    localStorage.setItem('colleco.activeCall', 'true');
    
    // Simulate call connection
    setTimeout(() => {
      setCallStatus('connected');
      // Mark invited contact as joined
      setCallParticipants(prev => prev.map(p => 
        p.id === selectedContact.id ? { ...p, joinedAt: Date.now() } : p
      ));
    }, 2000);
  }

  function inviteToCall(contact) {
    if (!isCallHost) return;
    if (callParticipants.find(p => p.id === contact.id)) return;
    
    setCallParticipants(prev => [...prev, {
      id: contact.id,
      name: contact.name,
      role: contact.role,
      isHost: false,
      joinedAt: Date.now()
    }]);
    setShowInviteModal(false);
  }

  function _handleJoinRequest(contactId, approve) {
    if (!isCallHost) return;
    
    const request = joinRequests.find(r => r.id === contactId);
    if (approve && request) {
      setCallParticipants(prev => [...prev, { ...request, joinedAt: Date.now() }]);
    }
    setJoinRequests(prev => prev.filter(r => r.id !== contactId));
  }

  function removeParticipant(participantId) {
    if (!isCallHost) return;
    if (participantId === 'you') return;
    
    setCallParticipants(prev => prev.filter(p => p.id !== participantId));
  }

  function endCall() {
    setCallStatus('ended');
    
    // Show Zola again after call ends
    localStorage.removeItem('colleco.activeCall');
    
    setTimeout(() => {
      setShowCallModal(null);
      setCallStatus('idle');
      setCallDuration(0);
      setCallId(null);
      setCallParticipants([]);
      setIsCallHost(false);
      setShowParticipants(false);
    }, 2000);
  }

  function toggleMute(contactId) {
    setMutedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  }

  function sendMessage() {
    if (!input.trim() || !selectedContact) return;
    const ts = Date.now();
    const msg = {
      sender: clientName,
      role: ROLES.client,
      channel: CHANNELS.inapp,
      text: input.trim(),
      ts
    };
    const contactBookingId = `${bookingId}-${selectedContact.id}`;
    const threads = loadThreads();
    threads[contactBookingId].messages.push(msg);
    saveThreads(threads);
    setMessages([...threads[contactBookingId].messages]);
    setInput('');
    
    setReceipts(r => ({ ...r, [ts]: 'sent' }));
    setTimeout(() => setReceipts(r => ({ ...r, [ts]: 'delivered' })), 1000);
    setTimeout(() => setReceipts(r => ({ ...r, [ts]: 'read' })), 2500);
  }

  function sendReaction(emoji, label) {
    const id = Date.now() + Math.random();
    setFloatingReactions(prev => [...prev, { id, emoji, label }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
    {open && (
      <>
      <div className="fixed inset-0 sm:inset-auto sm:right-4 sm:bottom-4 md:right-6 md:bottom-6 z-toast bg-white sm:rounded-2xl shadow-2xl border-t sm:border border-cream-border/80 w-full sm:w-[90vw] md:w-[600px] lg:w-[800px] h-[100dvh] sm:h-[85vh] md:h-[600px] max-h-[100dvh] sm:max-h-[85vh] flex overflow-hidden safe-area-inset">
          {/* Contact List Sidebar - Full screen on mobile when shown, side panel on desktop */}
          <div className={`${showContactList ? 'absolute inset-0 z-10 sm:relative' : 'hidden'} sm:block sm:w-64 md:w-80 border-r border-cream-border flex flex-col bg-cream-sand`}>
            {/* Header */}
            <div className="p-4 border-b border-cream-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-brand-orange flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contacts
                </h3>
                <div className="flex items-center gap-2">
                  <button className="sm:hidden text-brand-brown hover:text-brand-orange text-sm" onClick={() => setShowContactList(false)}>Back</button>
                  <button className="text-brand-brown hover:text-brand-orange" onClick={() => setOpen(false)}>✕</button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-brand-brown/50" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 border border-cream-border rounded text-sm"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  className={`w-full p-3 flex items-center gap-3 border-b border-cream-border hover:bg-white transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-white' : ''
                  }`}
                  onClick={() => {
                    setSelectedContact(contact);
                    // On mobile, hide contact list when selecting a contact
                    if (window.innerWidth < 640) {
                      setShowContactList(false);
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {contact.avatar}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-brand-brown text-sm truncate">{contact.name}</div>
                    <div className="text-xs text-brand-brown/60 truncate">{contact.company}</div>
                    <div className="text-xs text-brand-brown/50 flex items-center gap-1 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {contact.status === 'online' ? 'Online' : `Last seen ${contact.lastSeen}`}
                    </div>
                  </div>
                  
                  {/* Mute Icon */}
                  {mutedContacts.includes(contact.id) && (
                    <BellOff className="w-4 h-4 text-brand-brown/40 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area - Hidden on mobile when contact list is shown */}
          <div className={`flex-1 flex flex-col ${showContactList && !selectedContact ? 'hidden sm:flex' : 'flex'}`}>
            {!selectedContact ? (
              <div className="flex-1 flex items-center justify-center text-brand-brown/50 bg-cream-sand">
                <div className="text-center px-4">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Select a contact to start messaging</div>
                  <button 
                    className="sm:hidden mt-4 px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold"
                    onClick={() => setShowContactList(true)}
                  >
                    View Contacts
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-cream-border bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button 
                      className="sm:hidden flex-shrink-0 p-2 hover:bg-cream-hover rounded-lg transition-colors"
                      onClick={() => setShowContactList(true)}
                      aria-label="Show contacts"
                    >
                      <MessageSquare className="w-5 h-5 text-brand-orange" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {selectedContact.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-brand-brown truncate">{selectedContact.name}</div>
                      <div className="text-xs text-brand-brown/60 truncate">{selectedContact.company}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Mute Toggle */}
                    <button
                      className="p-2 hover:bg-cream rounded-full transition-colors"
                      onClick={() => toggleMute(selectedContact.id)}
                      title={mutedContacts.includes(selectedContact.id) ? 'Unmute' : 'Mute'}
                    >
                      {mutedContacts.includes(selectedContact.id) ? (
                        <BellOff className="w-5 h-5 text-brand-brown/60" />
                      ) : (
                        <Bell className="w-5 h-5 text-brand-brown/60" />
                      )}
                    </button>
                    
                    {/* Voice Call */}
                    <button
                      className="p-2 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors"
                      onClick={() => initiateCall('voice')}
                      title="Voice Call"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    
                    {/* Video Call */}
                    <button
                      className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
                      onClick={() => initiateCall('video')}
                      title="Video Call"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                    
                    {/* Schedule Meeting */}
                    <button
                      className="p-2 hover:bg-purple-50 hover:text-purple-600 rounded-full transition-colors"
                      onClick={() => setShowScheduleModal(true)}
                      title="Schedule Meeting"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                {!showCallModal && (
                <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 bg-cream-sand min-h-0" onClick={() => { try { inputRef.current?.focus(); } catch {} }}>
                  {messages.length === 0 ? (
                    <div className="text-xs text-brand-brown/50 text-center mt-8">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className={`mb-3 flex ${m.role === ROLES.client ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                          m.role === ROLES.client
                            ? 'bg-brand-orange text-white rounded-br-none'
                            : 'bg-white border border-cream-border text-brand-brown rounded-bl-none'
                        }`}>
                          <div className="font-semibold text-xs mb-1 opacity-90">{m.sender}</div>
                          <div>{m.text}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {m.role === ROLES.client && receipts[m.ts] && (
                              <span className="ml-2">
                                {receipts[m.ts] === 'sent' && '🕑'}
                                {receipts[m.ts] === 'delivered' && '✅'}
                                {receipts[m.ts] === 'read' && '👁️'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                )}

                {/* Input Area */}
                {!showCallModal && (
                <div className="p-4 border-t-2 border-cream-border bg-cream/30 flex-shrink-0">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <button
                      className="px-3 py-1.5 bg-cream border border-cream-border rounded text-xs text-brand-brown hover:bg-brand-orange hover:text-white transition-colors"
                      onClick={() => setInput('Booking confirmed!')}
                    >
                      Booking confirmed
                    </button>
                    <button
                      className="px-3 py-1.5 bg-cream border border-cream-border rounded text-xs text-brand-brown hover:bg-brand-orange hover:text-white transition-colors"
                      onClick={() => setInput('Payment received, thank you!')}
                    >
                      Payment received
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-brand-orange/30 rounded-lg px-4 py-3 text-base font-medium text-brand-brown bg-white focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 placeholder:text-brand-brown/50 shadow-sm"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="on"
                      spellCheck={true}
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type your message here..."
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    />
                    <button
                      className="px-5 py-3 bg-brand-orange text-white font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors flex-shrink-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={sendMessage}
                      disabled={!input.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Call Modal */}
        {showCallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-cream-beige via-cream-sand to-brand-orange">
          <div className="w-full max-w-4xl p-8 text-brand-brown relative">
            {/* Security Banner */}
            {callStatus === 'connected' && (
              <div className="absolute top-2 left-2 bg-green-50 border border-green-400 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <Lock className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-700 font-medium">Secure Call · {callId?.slice(0, 15)}...</span>
              </div>
            )}

            {/* Participants Count */}
            {callStatus === 'connected' && isCallHost && (
              <button
                className="absolute top-2 right-2 bg-white border border-brand-brown/20 rounded-full px-3 py-1.5 flex items-center gap-2 hover:bg-cream-sand transition-colors shadow-sm text-brand-brown"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-sm">{callParticipants.length} {callParticipants.length === 1 ? 'Participant' : 'Participants'}</span>
              </button>
            )}

            {/* Call Status */}
            <div className="text-center mb-8 mt-12">
              {callStatus === 'calling' && (
                <>
                  <div className="text-6xl mb-4">{selectedContact?.avatar}</div>
                  <h3 className="text-2xl font-bold mb-2 text-brand-brown">{selectedContact?.name}</h3>
                  <p className="text-brand-brown/70">Calling...</p>
                  <div className="mt-4 flex justify-center">
                    <div className="animate-pulse text-brand-orange">
                      <Phone className="w-8 h-8" />
                    </div>
                  </div>
                </>
              )}
              
              {callStatus === 'connected' && (
                <>
                  {/* Video View or Avatar */}
                  <div className={`mb-4 ${isFullscreen ? 'fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center' : ''}`}>
                    {showCallModal === 'video' && isVideoEnabled ? (
                      <div className={`${
                        isFullscreen 
                          ? 'w-full h-full' 
                          : 'w-full aspect-video'
                      } bg-brand-brown/10 border-2 border-brand-brown/20 rounded-lg flex items-center justify-center mb-2 relative`}>
                        <div className="text-center text-brand-brown/60">
                          <Video className="w-12 h-12 mx-auto mb-2" />
                          <div className="text-sm">Video feed placeholder</div>
                          {isScreenSharing && (
                            <div className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg inline-flex items-center gap-2 font-semibold">
                              <MonitorUp className="w-4 h-4" />
                              Sharing screen...
                            </div>
                          )}
                        </div>
                        
                        {/* Fullscreen Toggle */}
                        <button
                          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                      </div>
                    ) : (
                      <div className="text-7xl mb-4">{selectedContact?.avatar}</div>
                    )}
                    
                    {/* Call Controls - visible in both normal and fullscreen */}
                    {isFullscreen && (
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center gap-3 md:gap-4">
                        {/* Audio Toggle */}
                        <button
                          className={`p-4 rounded-full transition-colors shadow-lg ${
                            isAudioEnabled ? 'bg-white hover:bg-cream-sand text-brand-brown' : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                          title={isAudioEnabled ? 'Mute' : 'Unmute'}
                        >
                          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </button>

                        {/* Video Toggle */}
                        {showCallModal === 'video' && (
                          <button
                            className={`p-4 rounded-full transition-colors shadow-lg ${
                              isVideoEnabled ? 'bg-white hover:bg-cream-sand text-brand-brown' : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                            title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                          >
                            {isVideoEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                          </button>
                        )}

                        {/* In-Call Chat Toggle */}
                        <button
                          className="p-4 rounded-full bg-white hover:bg-cream-sand text-brand-brown transition-colors shadow-lg relative"
                          onClick={() => setShowInCallChat(!showInCallChat)}
                          title="Chat during call"
                        >
                          <MessageSquare className="w-6 h-6" />
                          {messages.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center font-semibold">
                              {messages.length}
                            </span>
                          )}
                        </button>

                        {/* Hang Up */}
                        <button
                          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg"
                          onClick={endCall}
                          title="End call"
                        >
                          <PhoneOff className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!isFullscreen && (
                    <>
                      <h3 className="text-2xl font-bold mb-2 text-brand-brown">{selectedContact?.name}</h3>
                      <p className="text-brand-brown/70 font-medium">{formatCallDuration(callDuration)}</p>
                      
                      {/* Video/Audio Status */}
                      <div className="mt-2 text-sm text-brand-brown/50">
                        {showCallModal === 'video' && !isVideoEnabled && 'Video disabled'}
                        {!isAudioEnabled && ' · Audio muted'}
                      </div>
                    </>
                  )}
                </>
              )}
              
              {callStatus === 'ended' && (
                <>
                  <div className="text-6xl mb-4 text-green-600">✓</div>
                  <h3 className="text-2xl font-bold mb-2 text-brand-brown">Call Ended</h3>
                  <p className="text-brand-brown/70">Duration: {formatCallDuration(callDuration)}</p>
                </>
              )}
            </div>

            {/* Call Controls - only show when not in fullscreen */}
            {callStatus === 'connected' && !isFullscreen && (
              <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-5 flex-wrap px-4">
                {/* Audio Toggle - PRIMARY */}
                <button
                  className={`p-4 sm:p-5 rounded-full transition-all shadow-xl border-2 ${
                    isAudioEnabled 
                      ? 'bg-white hover:bg-cream-sand text-brand-brown border-brand-brown/20 hover:border-brand-brown/40' 
                      : 'bg-red-500 hover:bg-red-600 text-white border-red-600'
                  }`}
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  title={isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                  {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                {/* Video Toggle (for video calls) - PRIMARY */}
                {showCallModal === 'video' && (
                  <button
                    className={`p-4 sm:p-5 rounded-full transition-all shadow-xl border-2 ${
                      isVideoEnabled 
                        ? 'bg-white hover:bg-cream-sand text-brand-brown border-brand-brown/20 hover:border-brand-brown/40' 
                        : 'bg-red-500 hover:bg-red-600 text-white border-red-600'
                    }`}
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                  >
                    {isVideoEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </button>
                )}

                {/* Visual Separator */}
                <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-brand-brown/20 to-transparent"></div>

                {/* In-Call Chat Toggle - SECONDARY */}
                <button
                  className="p-3 rounded-full bg-white hover:bg-cream-sand text-brand-brown transition-colors shadow-md relative"
                  onClick={() => setShowInCallChat(!showInCallChat)}
                  title="Chat during call"
                >
                  <MessageSquare className="w-5 h-5" />
                  {messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                      {messages.length}
                    </span>
                  )}
                </button>

                {/* Screen Share - SECONDARY */}
                <button
                  className={`p-3 rounded-full transition-colors shadow-md ${
                    isScreenSharing ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white hover:bg-cream-sand text-brand-brown'
                  }`}
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  <MonitorUp className="w-5 h-5" />
                </button>

                {/* Reactions - SECONDARY */}
                <div className="relative">
                  <button
                    className="p-3 rounded-full bg-white hover:bg-cream-sand text-brand-brown transition-colors shadow-md"
                    onClick={() => setShowReactions(!showReactions)}
                    title="Send reaction"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  
                  {showReactions && (
                    <div className="absolute bottom-full mb-2 right-0 bg-white rounded-full px-2 py-1.5 shadow-2xl border border-gray-200">
                      <div className="flex items-center gap-1">
                        {/* Default 6 Reactions */}
                        {[
                          { emoji: '👍', label: 'Thumbs up' },
                          { emoji: '❤️', label: 'Love' },
                          { emoji: '😂', label: 'Laugh' },
                          { emoji: '🎉', label: 'Celebrate' },
                          { emoji: '✨', label: 'Sparkles' },
                          { emoji: '🔥', label: 'Fire' }
                        ].map(({ emoji, label }) => (
                          <button
                            key={emoji}
                            className="text-lg hover:scale-110 transition-transform p-0.5 rounded hover:bg-gray-100"
                            onClick={() => {
                              sendReaction(emoji, label);
                              setShowReactions(false);
                              setShowAllReactions(false);
                            }}
                            title={label}
                          >
                            {emoji}
                          </button>
                        ))}
                        
                        {/* Plus Button for More Reactions */}
                        <button
                          className="text-sm font-bold hover:scale-110 transition-transform rounded-full hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-brand-brown"
                          onClick={() => setShowAllReactions(!showAllReactions)}
                          title="More reactions"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Expanded Reactions Menu */}
                      {showAllReactions && (
                        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-2xl px-3 py-2 shadow-2xl border border-gray-200 w-64">
                          <div className="grid grid-cols-6 gap-1.5">
                            {[
                              { emoji: '👍', label: 'Thumbs up' },
                              { emoji: '❤️', label: 'Love' },
                              { emoji: '👏', label: 'Applause' },
                              { emoji: '✅', label: 'Agree' },
                              { emoji: '🎉', label: 'Celebrate' },
                              { emoji: '💯', label: 'Perfect' },
                              { emoji: '✈️', label: 'Flight' },
                              { emoji: '🌍', label: 'Travel' },
                              { emoji: '🏨', label: 'Hotel' },
                              { emoji: '🚗', label: 'Car' },
                              { emoji: '⭐', label: 'Star' },
                              { emoji: '😊', label: 'Happy' },
                              { emoji: '🤔', label: 'Thinking' },
                              { emoji: '👋', label: 'Wave' },
                              { emoji: '💪', label: 'Strong' },
                              { emoji: '🔥', label: 'Fire' },
                              { emoji: '😂', label: 'Laugh' },
                              { emoji: '✨', label: 'Sparkles' }
                            ].map(({ emoji, label }) => (
                              <button
                                key={emoji}
                                className="text-lg hover:scale-110 transition-transform p-0.5 rounded hover:bg-gray-100"
                                onClick={() => {
                                  sendReaction(emoji, label);
                                  setShowReactions(false);
                                  setShowAllReactions(false);
                                }}
                                title={label}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Invite (host only) - SECONDARY */}
                {isCallHost && (
                  <button
                    className="p-3 rounded-full bg-white hover:bg-cream-sand text-brand-brown transition-colors shadow-md"
                    onClick={() => setShowInviteModal(true)}
                    title="Invite to call"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}

                {/* End Call - CRITICAL ACTION */}
                <button
                  className="p-4 sm:p-5 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-xl border-2 border-red-600 scale-105 hover:scale-110"
                  onClick={endCall}
                  title="End call"
                >
                  <Phone className="w-6 h-6 transform rotate-135" />
                </button>
              </div>
            )}

            {/* Floating Reactions */}
            {floatingReactions.map(reaction => (
              <div
                key={reaction.id}
                className="absolute text-4xl animate-float-up"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  bottom: '20%',
                  animation: 'float-up 3s ease-out forwards'
                }}
              >
                {reaction.emoji}
              </div>
            ))}
            
            {/* In-Call Chat Overlay */}
            {showInCallChat && callStatus === 'connected' && (
              <div className="absolute right-4 bottom-24 w-80 max-h-96 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-cream-border overflow-hidden flex flex-col">
                {/* Chat Header */}
                <div className="p-3 bg-brand-orange text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-semibold text-sm">Chat with {selectedContact?.name}</span>
                  </div>
                  <button
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    onClick={() => setShowInCallChat(false)}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-60 bg-cream-sand">
                  {messages.length === 0 ? (
                    <div className="text-xs text-brand-brown/50 text-center py-4">
                      No messages yet. Send a message during the call!
                    </div>
                  ) : (
                    messages.slice(-5).map((m, i) => (
                      <div key={i} className={`flex ${m.role === ROLES.client ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-2 py-1.5 rounded text-xs ${
                          m.role === ROLES.client
                            ? 'bg-brand-orange text-white rounded-br-none'
                            : 'bg-white border border-cream-border text-brand-brown rounded-bl-none'
                        }`}>
                          <div className="font-semibold opacity-90 text-[10px] mb-0.5">{m.sender}</div>
                          <div>{m.text}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Input */}
                <div className="p-2 border-t border-cream-border bg-white">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-cream-border rounded px-2 py-1.5 text-xs text-brand-brown bg-white focus:outline-none focus:border-brand-orange placeholder:text-brand-brown/40"
                      type="text"
                      value={inCallMessage}
                      onChange={e => setInCallMessage(e.target.value)}
                      placeholder="Type message..."
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey && inCallMessage.trim()) {
                          e.preventDefault();
                          const ts = Date.now();
                          const msg = {
                            sender: clientName,
                            role: ROLES.client,
                            channel: CHANNELS.inapp,
                            text: inCallMessage.trim(),
                            ts
                          };
                          const contactBookingId = `${bookingId}-${selectedContact.id}`;
                          const threads = loadThreads();
                          threads[contactBookingId].messages.push(msg);
                          saveThreads(threads);
                          setMessages([...threads[contactBookingId].messages]);
                          setInCallMessage('');
                          setReceipts(r => ({ ...r, [ts]: 'sent' }));
                        }
                      }}
                    />
                    <button
                      className="px-3 py-1.5 bg-brand-orange text-white text-xs font-semibold rounded hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
                      onClick={() => {
                        if (!inCallMessage.trim()) return;
                        const ts = Date.now();
                        const msg = {
                          sender: clientName,
                          role: ROLES.client,
                          channel: CHANNELS.inapp,
                          text: inCallMessage.trim(),
                          ts
                        };
                        const contactBookingId = `${bookingId}-${selectedContact.id}`;
                        const threads = loadThreads();
                        threads[contactBookingId].messages.push(msg);
                        saveThreads(threads);
                        setMessages([...threads[contactBookingId].messages]);
                        setInCallMessage('');
                        setReceipts(r => ({ ...r, [ts]: 'sent' }));
                      }}
                      disabled={!inCallMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Participants Panel */}
          {showParticipants && callStatus === 'connected' && (
            <div className="absolute right-4 top-20 w-64 bg-white/10 backdrop-blur-md rounded-lg p-4 max-h-96 overflow-y-auto">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Participants ({callParticipants.length})
              </h4>
              
              {callParticipants.map(participant => (
                <div key={participant.id} className="flex items-center justify-between mb-2 p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-semibold">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm text-white">{participant.name}</div>
                      {participant.isHost && (
                        <div className="text-xs text-white/60 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Host
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isCallHost && !participant.isHost && (
                    <button
                      className="p-1 hover:bg-red-500/20 rounded"
                      onClick={() => removeParticipant(participant.id)}
                      title="Remove participant"
                    >
                      <UserMinus className="w-4 h-4 text-red-300" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-96 max-h-[500px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-brand-brown">Invite to Call</h4>
                  <button
                    className="text-brand-brown/60 hover:text-brand-brown"
                    onClick={() => setShowInviteModal(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Secure Call</strong>
                      <div className="mt-1">Only invited participants can join. Call ID: {callId?.slice(0, 20)}...</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {contacts
                    .filter(c => !callParticipants.find(p => p.id === c.id))
                    .map(contact => (
                      <button
                        key={contact.id}
                        className="w-full p-3 flex items-center gap-3 border border-cream-border rounded hover:bg-cream transition-colors"
                        onClick={() => inviteToCall(contact)}
                      >
                        <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold text-sm">
                          {contact.avatar}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-brand-brown text-sm">{contact.name}</div>
                          <div className="text-xs text-brand-brown/60">{contact.company}</div>
                        </div>
                        <UserPlus className="w-4 h-4 text-brand-orange" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Floating Reaction Animation Styles */}
        <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(1.5);
          }
        }
      `}</style>
      </>
    )}
    
    {/* Schedule Meeting Modal */}
    {showScheduleModal && (
      <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-brand-brown flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-orange" />
              Schedule Meeting
            </h3>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const meeting = {
              id: Date.now(),
              contactId: selectedContact?.id,
              contactName: selectedContact?.name,
              title: formData.get('title'),
              date: formData.get('date'),
              time: formData.get('time'),
              type: formData.get('type'),
              notes: formData.get('notes'),
              createdAt: new Date().toISOString()
            };
            const updated = [...scheduledMeetings, meeting];
            setScheduledMeetings(updated);
            localStorage.setItem('colleco.scheduledMeetings', JSON.stringify(updated));
            setShowScheduleModal(false);
            
            // Send notification message
            const msg = {
              sender: clientName,
              role: ROLES.client,
              channel: CHANNELS.inapp,
              text: `📅 Scheduled ${meeting.type} meeting: "${meeting.title}" on ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time}`,
              ts: Date.now()
            };
            const contactBookingId = `${bookingId}-${selectedContact.id}`;
            const threads = loadThreads();
            threads[contactBookingId].messages.push(msg);
            saveThreads(threads);
            setMessages([...threads[contactBookingId].messages]);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-brown mb-1">Meeting With</label>
              <input
                type="text"
                value={selectedContact?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-brand-brown mb-1">Meeting Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g., Project Review"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-brand-brown mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-brand-brown mb-1">Time</label>
                <input
                  type="time"
                  name="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-brand-brown mb-1">Meeting Type</label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              >
                <option value="video">Video Call</option>
                <option value="voice">Voice Call</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-brand-brown mb-1">Notes (Optional)</label>
              <textarea
                name="notes"
                rows="3"
                placeholder="Add agenda or notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent resize-none"
              ></textarea>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-brand-brown hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
              >
                Schedule Meeting
              </button>
            </div>
          </form>
          
          {/* Scheduled Meetings List */}
          {scheduledMeetings.filter(m => m.contactId === selectedContact?.id).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-brand-brown mb-3">Upcoming Meetings</h4>
              <div className="space-y-2">
                {scheduledMeetings
                  .filter(m => m.contactId === selectedContact?.id)
                  .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
                  .slice(0, 3)
                  .map(meeting => (
                    <div key={meeting.id} className="p-3 bg-cream-sand rounded-lg text-sm">
                      <div className="font-semibold text-brand-brown">{meeting.title}</div>
                      <div className="text-xs text-brand-brown/70 mt-1">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time} · {meeting.type}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )}
    
    {!open && (
      <div ref={dragScopeRef} className="fixed inset-0 z-toast pointer-events-none">
        <motion.div 
          className="fixed right-4 sm:right-6 bottom-20 sm:bottom-6 pointer-events-auto"
          drag
          dragElastic={0.2}
          dragMomentum={false}
          dragConstraints={dragScopeRef}
        >
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setOpen(true)}
              className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-2xl shadow-brand-brown/25 backdrop-blur hover:scale-105 transition-transform"
              aria-label="Open Messenger"
              title="Open Messenger"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-orange/40 via-transparent to-brand-brown/40 blur-xl" aria-hidden></span>
              <MessageSquare className="relative w-8 h-8 text-brand-orange" />
            </button>

            <span className="text-xs font-semibold text-brand-brown bg-white/90 px-2 py-0.5 rounded-full shadow-sm">Messages</span>
          </div>
        </motion.div>
      </div>
    )}
    </>
 );
}
