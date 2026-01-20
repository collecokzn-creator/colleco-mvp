import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  PhoneOff,
  Video,
  Search,
  BellOff,
  Bell,
  Shield,
  Lock,
  UserPlus,
  UserMinus,
  UserCheck,
  AlertCircle,
  Mic,
  MicOff,
  Heart,
  Maximize,
  Minimize,
  Calendar,
  MonitorUp,
  X,
  FileText,
  Upload,
  Image as ImageIcon,
  Paintbrush,
  Disc,
  StickyNote,
  BarChart3,
  MapPin,
  PictureInPicture,
  Subtitles,
  Download,
  ExternalLink,
  Trash2
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
  
  // New Collaboration Features State
  const [showFileShare, setShowFileShare] = useState(false);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardColor, setWhiteboardColor] = useState('#000000');
  const whiteboardCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [_activePoll, _setActivePoll] = useState(null);
  const [showTravelShare, setShowTravelShare] = useState(false);
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [isPiPMode, setIsPiPMode] = useState(false);
  const [showLocationShare, setShowLocationShare] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState([]);
  
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

  // Whiteboard drawing initialization
  useEffect(() => {
    if (!showWhiteboard || !whiteboardCanvasRef.current) return;
    
    const canvas = whiteboardCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseDown = (e) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
    };
    
    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = whiteboardColor;
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    
    const handleMouseUp = () => setIsDrawing(false);
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', () => setIsDrawing(false));
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [showWhiteboard, whiteboardColor, isDrawing]);

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

  // Recording timer effect
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulated transcription effect
  useEffect(() => {
    if (showTranscription && callStatus === 'connected') {
      const sampleTranscripts = [
        { speaker: 'You', text: 'What are the best travel options for next month?' },
        { speaker: 'Agent', text: 'Let me share some wonderful safari packages and hotel options...' },
        { speaker: 'You', text: 'How much would the total cost be?' },
        { speaker: 'Agent', text: 'For the full package, including flights and accommodation...' }
      ];
      const timer = setTimeout(() => {
        setTranscriptLines(sampleTranscripts);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTranscription, callStatus]);

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
      // Now hide Zola (persist for cross-tab) and notify other components
      try { localStorage.setItem('colleco.activeCall', 'true'); } catch {}
      try { localStorage.setItem('colleco.activeCallStartedAt', String(Date.now())); } catch {}
      try { window.dispatchEvent(new CustomEvent('colleco:call-start', { detail: { callId: newCallId } })); } catch {}
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
    
    // Show Zola again after call ends (persist change + notify listeners)
    const _currentCallId = callId;
    try { localStorage.removeItem('colleco.activeCall'); } catch {}
    try { localStorage.removeItem('colleco.activeCallStartedAt'); } catch {}
    try {
      window.dispatchEvent(new CustomEvent('colleco:call-end', { detail: { callId: _currentCallId } }));
    } catch (e) {
      // ignore
    }
    
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
                      <div key={i} className={`mb-3 flex ${m.role === ROLES.client ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm relative ${
                          m.role === ROLES.client
                            ? 'bg-brand-orange text-white rounded-br-none'
                            : 'bg-white border border-cream-border text-brand-brown rounded-bl-none'
                        }`}>
                          <div className="font-semibold text-xs mb-1 opacity-90 pr-6">{m.sender}</div>
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
                          {m.role === ROLES.client && (
                            <button
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-white/60 hover:text-white hover:bg-white/10"
                              onClick={() => {
                                const contactBookingId = `${bookingId}-${selectedContact.id}`;
                                const threads = loadThreads();
                                threads[contactBookingId].messages = threads[contactBookingId].messages.filter(msg => msg.ts !== m.ts);
                                saveThreads(threads);
                                setMessages([...threads[contactBookingId].messages]);
                              }}
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

        {/* Fullscreen Call Overlay */}
        {showCallModal && isFullscreen && callStatus === 'connected' && (
          <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center pointer-events-none">
            {/* Fullscreen Top-Left Toolbar (always visible in fullscreen) */}
            <div className="absolute top-3 left-3 flex gap-2 z-[130] pointer-events-auto">
              <button
                type="button"
                className={`p-2 rounded-lg transition-colors shadow-md pointer-events-auto ${
                  backgroundBlur ? 'bg-blue-500 text-white' : 'bg-white/90 hover:bg-white text-brand-brown'
                }`}
                onClick={() => setBackgroundBlur(!backgroundBlur)}
                title="Blur background"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                className={`p-2 rounded-lg transition-colors shadow-md pointer-events-auto ${
                  showTranscription ? 'bg-purple-500 text-white' : 'bg-white/90 hover:bg-white text-brand-brown'
                }`}
                onClick={() => setShowTranscription(!showTranscription)}
                title="Toggle captions"
              >
                <Subtitles className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-2 rounded-lg bg-white/90 hover:bg-white text-brand-brown transition-colors shadow-md pointer-events-auto"
                onClick={() => setIsPiPMode(!isPiPMode)}
                title="Picture-in-Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>

              <button
                type="button"
                className={`p-2 rounded-lg transition-colors shadow-md pointer-events-auto ${
                  showLocationShare ? 'bg-green-500 text-white' : 'bg-white/90 hover:bg-white text-brand-brown'
                }`}
                onClick={() => setShowLocationShare(!showLocationShare)}
                title="Share location"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
            {showCallModal === 'video' && isVideoEnabled ? (
              <div className="w-full h-full bg-black flex items-center justify-center relative">
                <div className="text-center text-white/60">
                  <Video className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <div className="text-lg opacity-50">Video feed placeholder</div>
                </div>
                
                {/* Video Controls Toolbar moved to top-level so it's always visible in fullscreen */}

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white rounded-full flex items-center gap-2 animate-pulse">
                    <Disc className="w-3 h-3 fill-white" />
                    <span className="text-xs font-semibold">REC {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}</span>
                  </div>
                )}

              </div>
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-9xl mb-4">{selectedContact?.avatar}</div>
                  <div className="text-lg opacity-80">Video disabled</div>
                </div>
              </div>
            )}

            {/* Exit Fullscreen Button (always visible in fullscreen) */}
            <button
              className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-[130] pointer-events-auto"
              onClick={() => setIsFullscreen(false)}
              title="Exit fullscreen"
            >
              <Minimize className="w-5 h-5" />
            </button>

            {/* Call Controls - Bottom (always visible in fullscreen) */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-2 md:gap-3 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 shadow-2xl z-[130] pointer-events-auto">
              {/* Primary Controls */}
              <button
                type="button"
                className={`p-3 rounded-full transition-colors shadow-lg pointer-events-auto ${
                  isAudioEnabled ? 'bg-white hover:bg-cream-sand text-brand-brown' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                title={isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                type="button"
                className={`p-3 rounded-full transition-colors shadow-lg pointer-events-auto ${
                  isVideoEnabled ? 'bg-white hover:bg-cream-sand text-brand-brown' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
              >
                {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Screen Share */}
              <button
                type="button"
                className={`p-3 rounded-full transition-colors shadow-lg pointer-events-auto ${
                  isScreenSharing ? 'bg-green-500 text-white hover:bg-green-600 animate-pulse' : 'bg-white hover:bg-cream-sand text-brand-brown'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsScreenSharing(!isScreenSharing);
                }}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                <MonitorUp className="w-5 h-5" />
              </button>

              {/* Reactions */}
              <div className="relative z-[140]">
                <button
                  type="button"
                  className="p-3 rounded-full bg-white hover:bg-cream-sand text-brand-brown transition-colors shadow-lg pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReactions(!showReactions);
                  }}
                  title="Send reaction"
                >
                  <Heart className="w-5 h-5" />
                </button>
                
                {showReactions && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-1.5 shadow-2xl border border-gray-200 whitespace-nowrap z-[150] max-w-xs overflow-x-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                          type="button"
                          className="text-lg hover:scale-110 transition-transform p-0.5 rounded hover:bg-gray-100 pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendReaction(emoji, label);
                            setShowReactions(false);
                            setShowAllReactions(false);
                          }}
                          title={label}
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="text-sm font-bold hover:scale-110 transition-transform rounded-full hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-brand-brown pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllReactions(!showAllReactions);
                        }}
                        title="More reactions"
                      >
                        +
                      </button>
                    </div>
                    {showAllReactions && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-3 py-2 shadow-2xl border border-gray-200 w-72 sm:w-64 z-[160] max-h-96 overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
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
                              type="button"
                              className="text-lg hover:scale-110 transition-transform p-0.5 rounded hover:bg-gray-100 pointer-events-auto"
                              onClick={(e) => {
                                e.stopPropagation();
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

              {/* Chat Toggle */}
              <button
                type="button"
                className="p-3 rounded-full bg-white hover:bg-cream-sand text-brand-brown transition-colors shadow-lg relative pointer-events-auto"
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

              {/* End Call - Critical Action */}
              <button
                type="button"
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-lg scale-110 hover:scale-125 pointer-events-auto"
                onClick={endCall}
                title="End call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Call Modal */}
        {showCallModal && !isFullscreen && (
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
                  {showCallModal === 'video' && isVideoEnabled ? (
                    <div className={`w-full aspect-video bg-brand-brown/10 border-2 border-brand-brown/20 rounded-lg flex items-center justify-center mb-4 relative`}>
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
                      
                      {/* Video Controls Toolbar */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {/* Background Blur */}
                        <button
                          className={`p-2 rounded-lg transition-colors shadow-md ${
                            backgroundBlur ? 'bg-blue-500 text-white' : 'bg-white/90 hover:bg-white text-brand-brown'
                          }`}
                          onClick={() => setBackgroundBlur(!backgroundBlur)}
                          title={backgroundBlur ? 'Disable blur' : 'Blur background'}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>

                        {/* Transcription/Captions */}
                        <button
                          className={`p-2 rounded-lg transition-colors shadow-md ${
                            showTranscription ? 'bg-purple-500 text-white' : 'bg-white/90 hover:bg-white text-brand-brown'
                          }`}
                          onClick={() => setShowTranscription(!showTranscription)}
                          title="Toggle captions"
                        >
                          <Subtitles className="w-4 h-4" />
                        </button>

                        {/* Picture-in-Picture */}
                        <button
                          className="p-2 rounded-lg bg-white/90 hover:bg-white text-brand-brown transition-colors shadow-md"
                          onClick={() => setIsPiPMode(!isPiPMode)}
                          title="Picture-in-Picture"
                        >
                          <PictureInPicture className="w-4 h-4" />
                        </button>

                        {/* Location Share */}
                        <button
                          className={`p-2 rounded-lg transition-colors shadow-md ${
                            showLocationShare ? 'bg-green-500 text-white' : 'bg-white/90 hover:bg-white text-brand-brown'
                          }`}
                          onClick={() => setShowLocationShare(!showLocationShare)}
                          title="Share location"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Recording Indicator */}
                      {isRecording && (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white rounded-full flex items-center gap-2 animate-pulse">
                          <Disc className="w-3 h-3 fill-white" />
                          <span className="text-xs font-semibold">REC {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}</span>
                        </div>
                      )}

                      {/* Live Transcription Overlay */}
                      {showTranscription && transcriptLines.length > 0 && (
                        <div className="absolute bottom-3 left-3 right-3 bg-black/80 text-white px-4 py-2 rounded-lg text-sm max-h-24 overflow-y-auto">
                          {transcriptLines.slice(-3).map((line, idx) => (
                            <div key={idx} className="mb-1">
                              <span className="text-gray-400">{line.speaker}:</span> {line.text}
                            </div>
                          ))}
                        </div>
                      )}
                      
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

            {/* Call Controls - show appropriate layout based on mode */}
            {callStatus === 'connected' && (
              <>
                {!isFullscreen && (
                  <>
                    {/* Secondary Controls Sidebar - Right Side (only in regular mode) */}
                    <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 max-h-[calc(100vh-200px)] overflow-y-auto">
                      {/* In-Call Chat Toggle */}
                      <button
                        className="p-2.5 sm:p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown transition-all shadow-lg hover:shadow-xl border border-brand-brown/10 relative"
                        onClick={() => setShowInCallChat(!showInCallChat)}
                        title="Chat during call"
                      >
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                        {messages.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                            {messages.length}
                          </span>
                        )}
                      </button>

                      {/* Reactions */}
                      <div className="relative z-[140]">
                        <button
                          type="button"
                          className="p-2.5 sm:p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown transition-all shadow-lg hover:shadow-xl border border-brand-brown/10 pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReactions(!showReactions);
                          }}
                          title="Send reaction"
                        >
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        {showReactions && (
                          <div className="absolute right-full mr-2 top-0 bg-white rounded-full px-2 py-1.5 shadow-2xl border border-gray-200 z-[150] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
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
                                  type="button"
                                  className="text-lg hover:scale-110 transition-transform p-0.5 rounded hover:bg-gray-100 pointer-events-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendReaction(emoji, label);
                                    setShowReactions(false);
                                    setShowAllReactions(false);
                                  }}
                                  title={label}
                                >
                                  {emoji}
                                </button>
                              ))}
                              
                              <button
                                type="button"
                                className="text-sm font-bold hover:scale-110 transition-transform rounded-full hover:bg-gray-100 w-6 h-6 flex items-center justify-center text-brand-brown pointer-events-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAllReactions(!showAllReactions);
                                }}
                                title="More reactions"
                              >
                                +
                              </button>
                            </div>
                            
                            {showAllReactions && (
                              <div className="absolute right-full mr-2 top-0 bg-white rounded-2xl px-3 py-2 shadow-2xl border border-gray-200 w-64 z-[160] max-h-96 overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
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
                                      type="button"
                                      className="text-lg hover:scale-110 transition-transform p-0.5 rounded hover:bg-gray-100 pointer-events-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
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

                      {isCallHost && (
                        <button
                          className="p-2.5 sm:p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown transition-all shadow-lg hover:shadow-xl border border-brand-brown/10"
                          onClick={() => setShowInviteModal(true)}
                          title="Invite to call"
                        >
                          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}

                      <button
                        className={`p-2.5 sm:p-3 rounded-full transition-all shadow-lg hover:shadow-xl border ${
                          showFileShare 
                            ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-600' 
                            : 'bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown border-brand-brown/10'
                        }`}
                        onClick={() => setShowFileShare(!showFileShare)}
                        title="Share files"
                      >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        className={`p-2.5 sm:p-3 rounded-full transition-all shadow-lg hover:shadow-xl border ${
                          showNotes 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-600' 
                            : 'bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown border-brand-brown/10'
                        }`}
                        onClick={() => setShowNotes(!showNotes)}
                        title="Take notes"
                      >
                        <StickyNote className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        className={`p-2.5 sm:p-3 rounded-full transition-all shadow-lg hover:shadow-xl border ${
                          showWhiteboard 
                            ? 'bg-purple-500 text-white hover:bg-purple-600 border-purple-600' 
                            : 'bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown border-brand-brown/10'
                        }`}
                        onClick={() => setShowWhiteboard(!showWhiteboard)}
                        title="Open whiteboard"
                      >
                        <Paintbrush className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        className="p-2.5 sm:p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown transition-all shadow-lg hover:shadow-xl border border-brand-brown/10"
                        onClick={() => setShowPoll(true)}
                        title="Create poll"
                      >
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      <button
                        className={`p-2.5 sm:p-3 rounded-full transition-all shadow-lg hover:shadow-xl border ${
                          isRecording 
                            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse border-red-600' 
                            : 'bg-white/90 backdrop-blur-sm hover:bg-cream-sand text-brand-brown border-brand-brown/10'
                        }`}
                        onClick={() => setIsRecording(!isRecording)}
                        title={isRecording ? 'Stop recording' : 'Start recording'}
                      >
                        <Disc className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Primary Controls - Bottom Center (regular mode) */}
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 sm:py-4 shadow-2xl border border-brand-brown/10 max-w-[95vw]">
                      <button
                        className={`p-3 sm:p-4 rounded-full transition-all shadow-lg hover:shadow-xl ${
                          isAudioEnabled 
                            ? 'bg-cream-sand hover:bg-cream-light text-brand-brown' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        title={isAudioEnabled ? 'Mute' : 'Unmute'}
                      >
                        {isAudioEnabled ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </button>

                      {showCallModal === 'video' && (
                        <button
                          className={`p-3 sm:p-4 rounded-full transition-all shadow-lg hover:shadow-xl ${
                            isVideoEnabled 
                              ? 'bg-cream-sand hover:bg-cream-light text-brand-brown' 
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                          onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                          title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                        >
                          {isVideoEnabled ? <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                      )}

                      <button
                        className={`p-3 sm:p-4 rounded-full transition-all shadow-lg hover:shadow-xl ${
                          isScreenSharing 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-cream-sand hover:bg-cream-light text-brand-brown'
                        }`}
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                      >
                        <MonitorUp className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>

                      <div className="w-px h-8 sm:h-10 bg-brand-brown/20"></div>

                      <button
                        className="p-3 sm:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-white"
                        onClick={endCall}
                        title="End call"
                      >
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 transform rotate-135" />
                      </button>
                    </div>
                  </>
                )}
              </>
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
              <div className="absolute right-2 sm:right-4 bottom-20 sm:bottom-24 w-72 sm:w-80 max-h-80 sm:max-h-96 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-cream-border overflow-hidden flex flex-col z-50">
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
                      <div key={i} className={`flex ${m.role === ROLES.client ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[75%] px-3 py-1.5 rounded text-xs relative ${
                          m.role === ROLES.client
                            ? 'bg-brand-orange text-white rounded-br-none'
                            : 'bg-white border border-cream-border text-brand-brown rounded-bl-none'
                        }`}>
                          <div className="font-semibold opacity-90 text-[10px] mb-0.5 pr-5">{m.sender}</div>
                          <div>{m.text}</div>
                          {m.role === ROLES.client && (
                            <button
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-white/60 hover:text-white hover:bg-white/10"
                              onClick={() => {
                                const contactBookingId = `${bookingId}-${selectedContact.id}`;
                                const threads = loadThreads();
                                threads[contactBookingId].messages = threads[contactBookingId].messages.filter(msg => msg.ts !== m.ts);
                                saveThreads(threads);
                                setMessages([...threads[contactBookingId].messages]);
                              }}
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                      type="button"
                      className="px-3 py-1.5 bg-brand-orange text-white text-xs font-semibold rounded hover:bg-brand-orange/90 transition-colors disabled:opacity-50 pointer-events-auto"
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
              <div className="bg-white rounded-lg p-6 w-96 max-h-[500px] overflow-y-auto shadow-2xl">
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

    {/* File Share Panel */}
    {showFileShare && callStatus === 'connected' && (
      <div className="fixed right-4 bottom-32 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-[100]">
        <div className="p-3 bg-blue-500 text-white flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="font-semibold text-sm">Share Files</span>
          </div>
          <button onClick={() => setShowFileShare(false)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto">
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <FileUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600">Drop files here or click to browse</span>
            <input type="file" className="hidden" multiple onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setSharedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: f.size, type: f.type, uploadedAt: Date.now() }))]);
            }} />
          </label>
          {sharedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Shared Files ({sharedFiles.length})</h4>
              {sharedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Live Notes Panel */}
    {showNotes && callStatus === 'connected' && (
      <div className="fixed left-4 bottom-32 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 z-[100]">
        <div className="p-3 bg-yellow-500 text-white flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            <span className="font-semibold text-sm">Call Notes</span>
          </div>
          <button onClick={() => setShowNotes(false)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <textarea
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm"
            placeholder="Take notes during the call...&#10;&#10;• Key decisions&#10;• Travel preferences&#10;• Budget discussions&#10;• Action items"
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold">
              Save Notes
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Export PDF
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Whiteboard Panel */}
    {showWhiteboard && callStatus === 'connected' && (
      <div className="fixed inset-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-[110] flex flex-col pointer-events-auto">
        <div className="p-3 bg-purple-500 text-white flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            <span className="font-semibold text-sm">Collaborative Whiteboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => {
                if (whiteboardCanvasRef.current) {
                  const ctx = whiteboardCanvasRef.current.getContext('2d');
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, whiteboardCanvasRef.current.width, whiteboardCanvasRef.current.height);
                }
              }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors pointer-events-auto"
            >
              Clear
            </button>
            <button 
              type="button"
              onClick={() => setShowWhiteboard(false)} 
              className="p-1 hover:bg-white/20 rounded transition-colors pointer-events-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 rounded-b-lg relative overflow-hidden">
          <canvas 
            ref={whiteboardCanvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair bg-white pointer-events-auto"
            style={{ touchAction: 'none' }}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white rounded-full px-3 py-2 shadow-lg pointer-events-auto z-[120]">
            {[
              { color: '#000000', label: 'Black' },
              { color: '#ef4444', label: 'Red' },
              { color: '#3b82f6', label: 'Blue' },
              { color: '#22c55e', label: 'Green' },
              { color: '#eab308', label: 'Yellow' },
              { color: '#ec4899', label: 'Pink' }
            ].map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => setWhiteboardColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all pointer-events-auto ${whiteboardColor === color ? 'border-black scale-110' : 'border-gray-300'}`}
                style={{ backgroundColor: color }}
                title={label}
              />
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Poll Creation Modal */}
    {showPoll && (
      <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPoll(false)}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-brand-brown flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-orange" />
              Create Quick Poll
            </h3>
            <button onClick={() => setShowPoll(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-brown mb-1">Question</label>
              <input
                type="text"
                placeholder="e.g., Which hotel do you prefer?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-brown mb-1">Options</label>
              <input type="text" placeholder="Option 1" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="text" placeholder="Option 2" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="text" placeholder="Option 3 (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <button className="w-full px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 font-semibold">
              Launch Poll
            </button>
          </div>
        </motion.div>
      </div>
    )}

    {/* Travel Content Share Panel */}
    {showTravelShare && callStatus === 'connected' && (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200 z-[100] p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-brand-brown flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Share Travel Options
          </h4>
          <button onClick={() => setShowTravelShare(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-lg p-3 hover:border-brand-orange hover:bg-orange-50 cursor-pointer">
            <div className="text-xs text-gray-500 mb-1">Hotel</div>
            <div className="font-semibold text-sm">Luxury Resort</div>
            <div className="text-brand-orange font-bold text-sm">$299/night</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 hover:border-brand-orange hover:bg-orange-50 cursor-pointer">
            <div className="text-xs text-gray-500 mb-1">Flight</div>
            <div className="font-semibold text-sm">Direct to JNB</div>
            <div className="text-brand-orange font-bold text-sm">$650</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 hover:border-brand-orange hover:bg-orange-50 cursor-pointer">
            <div className="text-xs text-gray-500 mb-1">Activity</div>
            <div className="font-semibold text-sm">Safari Tour</div>
            <div className="text-brand-orange font-bold text-sm">$180</div>
          </div>
        </div>
      </div>
    )}

    {/* Location Share Indicator */}
    {showLocationShare && callStatus === 'connected' && (
      <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-[100]">
        <MapPin className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-semibold">Sharing live location</span>
        <button onClick={() => setShowLocationShare(false)} className="ml-2 p-0.5 hover:bg-white/20 rounded">
          <X className="w-3 h-3" />
        </button>
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
