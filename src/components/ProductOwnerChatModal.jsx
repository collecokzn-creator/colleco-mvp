import React, { useEffect, useState } from 'react';
import {
  MessageSquare, Phone, Video, Search, BellOff, Bell,
  Shield, Lock, UserPlus, UserMinus, UserCheck, AlertCircle,
  Mic, MicOff, VideoIcon, VideoOff,
  Heart, ThumbsUp, Laugh, PartyPopper, Sparkles, Flame
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

export default function ProductOwnerChatModal({ bookingId, clientName, productOwnerName, onClose }) {
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
  
  // Security & Multi-Person Calling State
  const [callId, setCallId] = useState(null);
  const [callParticipants, setCallParticipants] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isCallHost, setIsCallHost] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Reactions State
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  
  const [_thread, setThread] = useState(null);
  const [receipts, setReceipts] = useState({});

  // Load messages for selected contact
  useEffect(() => {
    if (!selectedContact) return;
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
  }, [selectedContact, bookingId, clientName]);

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

  function handleJoinRequest(contactId, approve) {
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
    <div className="fixed inset-0 z-toast pointer-events-none">
      <div className="absolute right-24 sm:right-28 bottom-24 sm:bottom-16 lg:bottom-6 pointer-events-auto">
      {open ? (
        <>
        <div className="bg-white rounded-2xl shadow-2xl border border-cream-border/80 w-[95vw] sm:w-[600px] lg:w-[800px] h-[80vh] sm:h-[600px] flex relative">
          {/* Contact List Sidebar */}
          <div className="w-80 border-r border-cream-border flex flex-col bg-cream-sand">
            {/* Header */}
            <div className="p-4 border-b border-cream-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-brand-orange flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contacts
                </h3>
                <button className="text-brand-brown hover:text-brand-orange" onClick={() => setOpen(false)}>✕</button>
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
                  onClick={() => setSelectedContact(contact)}
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

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!selectedContact ? (
              <div className="flex-1 flex items-center justify-center text-brand-brown/50">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Select a contact to start messaging</div>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-cream-border bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold">
                      {selectedContact.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-brand-brown">{selectedContact.name}</div>
                      <div className="text-xs text-brand-brown/60">{selectedContact.company}</div>
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
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-cream-sand">
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

                {/* Input Area */}
                <div className="p-4 border-t border-cream-border bg-white">
                  <div className="flex gap-2 mb-2">
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
                      className="flex-1 border border-cream-border rounded px-3 py-2 text-sm"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                    />
                    <button
                      className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange/90 transition-colors"
                      onClick={sendMessage}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Call Modal */}
        {showCallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-brand-brown/95 to-brand-orange/95">
          <div className="w-full max-w-4xl p-8 text-white relative">
            {/* Security Banner */}
            {callStatus === 'connected' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-400/30 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <Lock className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-100">Secure Call · {callId?.slice(0, 15)}...</span>
              </div>
            )}

            {/* Participants Count */}
            {callStatus === 'connected' && isCallHost && (
              <button
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-colors"
                onClick={() => setShowParticipants(!showParticipants)}
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-sm">{callParticipants.length} {callParticipants.length === 1 ? 'Participant' : 'Participants'}</span>
              </button>
            )}

            {/* Call Status */}
            <div className="text-center mb-8">
              {callStatus === 'calling' && (
                <>
                  <div className="text-6xl mb-4">{selectedContact?.avatar}</div>
                  <h3 className="text-2xl font-bold mb-2">{selectedContact?.name}</h3>
                  <p className="text-white/80">Calling...</p>
                  <div className="mt-4 flex justify-center">
                    <div className="animate-pulse">
                      <Phone className="w-8 h-8" />
                    </div>
                  </div>
                </>
              )}
              
              {callStatus === 'connected' && (
                <>
                  {/* Video View or Avatar */}
                  <div className="mb-4">
                    {showCallModal === 'video' && isVideoEnabled ? (
                      <div className="w-full aspect-video bg-black/30 rounded-lg flex items-center justify-center mb-2">
                        <div className="text-center">
                          <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <div className="text-sm opacity-70">Video feed placeholder</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-7xl mb-4">{selectedContact?.avatar}</div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{selectedContact?.name}</h3>
                  <p className="text-white/80">{formatCallDuration(callDuration)}</p>
                  
                  {/* Video/Audio Status */}
                  <div className="mt-2 text-sm text-white/60">
                    {showCallModal === 'video' && !isVideoEnabled && 'Video disabled'}
                    {!isAudioEnabled && ' · Audio muted'}
                  </div>
                </>
              )}
              
              {callStatus === 'ended' && (
                <>
                  <div className="text-6xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold mb-2">Call Ended</h3>
                  <p className="text-white/80">Duration: {formatCallDuration(callDuration)}</p>
                </>
              )}
            </div>

            {/* Call Controls */}
            {callStatus === 'connected' && (
              <div className="flex justify-center gap-4">
                {/* Audio Toggle */}
                <button
                  className={`p-4 rounded-full transition-colors ${
                    isAudioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  title={isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                  {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                {/* Video Toggle (for video calls) */}
                {showCallModal === 'video' && (
                  <button
                    className={`p-4 rounded-full transition-colors ${
                      isVideoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                    }`}
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                  >
                    {isVideoEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </button>
                )}

                {/* Reactions */}
                <div className="relative">
                  <button
                    className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    onClick={() => setShowReactions(!showReactions)}
                    title="Send reaction"
                  >
                    <Heart className="w-6 h-6" />
                  </button>
                  
                  {showReactions && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-2 flex gap-2 shadow-lg">
                      {[
                        { emoji: '❤️', label: 'Heart', icon: Heart },
                        { emoji: '👍', label: 'Thumbs up', icon: ThumbsUp },
                        { emoji: '😂', label: 'Laugh', icon: Laugh },
                        { emoji: '🎉', label: 'Party', icon: PartyPopper },
                        { emoji: '✨', label: 'Sparkles', icon: Sparkles },
                        { emoji: '🔥', label: 'Fire', icon: Flame }
                      ].map(({ emoji, label }) => (
                        <button
                          key={emoji}
                          className="text-2xl hover:scale-125 transition-transform"
                          onClick={() => {
                            sendReaction(emoji, label);
                            setShowReactions(false);
                          }}
                          title={label}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invite (host only) */}
                {isCallHost && (
                  <button
                    className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    onClick={() => setShowInviteModal(true)}
                    title="Invite to call"
                  >
                    <UserPlus className="w-6 h-6" />
                  </button>
                )}

                {/* End Call */}
                <button
                  className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
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
      ) : (
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
      )}
    </div>
  </div>
 );
}
