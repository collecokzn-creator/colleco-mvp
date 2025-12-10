import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MessageSquare, X, Volume2, VolumeX } from 'lucide-react';
import voiceAgent from '../utils/voiceAgent';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen for voice responses
    const handleVoiceResponse = (event) => {
      setTranscript(prev => [...prev, {
        speaker: 'assistant',
        text: event.detail.text,
        timestamp: event.detail.timestamp
      }]);
    };

    window.addEventListener('colleco:voice-response', handleVoiceResponse);

    return () => {
      window.removeEventListener('colleco:voice-response', handleVoiceResponse);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      voiceAgent.stopListening();
      setIsListening(false);
    } else {
      const started = voiceAgent.startListening();
      if (started) {
        setIsListening(true);
        if (!isOpen) setIsOpen(true);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  const handleTextInput = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to transcript
    setTranscript(prev => [...prev, {
      speaker: 'user',
      text: userInput,
      timestamp: new Date().toISOString()
    }]);

    // Process command
    voiceAgent.processCommand(userInput);
    setUserInput('');
  };

  const clearHistory = () => {
    setTranscript([]);
    voiceAgent.clearHistory();
    voiceAgent.resetConversation();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-ZA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Floating voice button */}
      <button
        onClick={toggleListening}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-brand-orange hover:bg-orange-600'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice assistant'}
      >
        {isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Conversation panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-brand-orange to-orange-600">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Voice Assistant</h3>
              {isListening && (
                <span className="flex items-center gap-1 text-xs text-white/90">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Listening...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-50">
            {transcript.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Mic className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  Click the microphone button or type below to start a conversation
                </p>
                <p className="text-xs mt-2 text-gray-400">
                  Try: &quot;Book a shuttle from Durban to Port Shepstone on 27/11/2025 at 10am&quot;
                </p>
              </div>
            ) : (
              <>
                {transcript.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.speaker === 'user'
                          ? 'bg-brand-orange text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.speaker === 'user' ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleTextInput} className="p-3 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
              />
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Send
              </button>
            </div>
            {transcript.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700 mt-2"
              >
                Clear conversation
              </button>
            )}
          </form>
        </div>
      )}

      {/* Toggle conversation panel button */}
      {!isOpen && transcript.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-24 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          title="Show conversation"
        >
          <MessageSquare className="h-5 w-5 text-brand-orange" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {transcript.length}
          </span>
        </button>
      )}
    </>
  );
}
