/**
 * Voice-Powered AI Booking Agent
 * Natural language conversation for hands-free booking
 */

class VoiceBookingAgent {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.conversationContext = {};
    this.currentBooking = {};
    this.conversationHistory = [];
    this.wakePhrases = ['hey colleco', 'hello colleco', 'hi colleco'];
     this.onTranscript = null; // Callback for when transcript is received
    this.initializeSpeechRecognition();
  }

  // Initialize speech recognition
  initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
     this.recognition.continuous = false; // Wait for complete utterance
     this.recognition.interimResults = false; // Only final results
    this.recognition.lang = 'en-ZA'; // South African English
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event) => this.handleSpeechResult(event);
    this.recognition.onerror = (event) => this.handleSpeechError(event);
    this.recognition.onend = () => {
       // Don't auto-restart - let speech synthesis complete first
    };
  }

  // Start listening
  startListening() {
    if (!this.recognition) {
      this.speak("Sorry, voice commands are not supported in your browser.");
      return false;
    }

    try {
      this.recognition.start();
      this.isListening = true;
       // Only speak greeting if not using callback mode (old booking mode)
       if (!this.onTranscript) {
         this.speak("Hi! I'm Zola, your CollEco Travel assistant. How can I help you today?");
       }
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Handle speech recognition results
  handleSpeechResult(event) {
    const results = event.results;
    const lastResult = results[results.length - 1];
    
    if (lastResult.isFinal) {
       const transcript = lastResult[0].transcript.trim();
      console.log('User said:', transcript);
      
      // Add to conversation history
      this.conversationHistory.push({
        speaker: 'user',
        text: transcript,
        timestamp: new Date().toISOString()
      });

       // Use callback if provided (for conversational mode)
       if (this.onTranscript) {
         this.onTranscript(transcript);
       } else {
         // Fallback to command processing
         this.processCommand(transcript);
       }
    }
  }

  // Handle speech recognition errors
  handleSpeechError(event) {
    console.error('Speech recognition error:', event.error);
    
    if (event.error === 'no-speech') {
      this.speak("I didn't catch that. Could you please repeat?");
    } else if (event.error === 'not-allowed') {
      this.speak("Please enable microphone permissions to use voice commands.");
    }
  }

  // Clean text for natural speech synthesis
  cleanTextForSpeech(text) {
    if (!text) return '';
    
    let cleaned = text;
    
    // Remove emojis and symbols
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emojis
    cleaned = cleaned.replace(/[🔍✅❌📍💬📞🚗]/g, ''); // Common symbols
    
    // Replace common patterns with natural speech
    cleaned = cleaned.replace(/:\)/g, ''); // Smileys
    cleaned = cleaned.replace(/;\)/g, '');
    cleaned = cleaned.replace(/:\(/g, '');
    cleaned = cleaned.replace(/&apos;/g, "'");
    cleaned = cleaned.replace(/&quot;/g, '"');
    cleaned = cleaned.replace(/&/g, ' and ');
    
    // Remove excessive punctuation
    cleaned = cleaned.replace(/\.{2,}/g, '.'); // Multiple periods
    cleaned = cleaned.replace(/!{2,}/g, '!'); // Multiple exclamations
    cleaned = cleaned.replace(/\?{2,}/g, '?'); // Multiple questions
    
    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*/g, ''); // Bold
    cleaned = cleaned.replace(/\*/g, ''); // Italic
    cleaned = cleaned.replace(/_/g, ''); // Underscore
    cleaned = cleaned.replace(/`/g, ''); // Code blocks
    
    // Remove special characters at start of sentences
    cleaned = cleaned.replace(/^[-•●○◆◇■□▪▫]\s*/gm, '');
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  // Text-to-speech
   speak(text, options = { skipHistory: false }) {
    // Clean text for natural speech
    const cleanedText = this.cleanTextForSpeech(text);
    
    if (!cleanedText) return; // Don't speak empty text
    
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'en-ZA';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Add original text to conversation history (not cleaned version)
     if (!options.skipHistory) {
       this.conversationHistory.push({
         speaker: 'assistant',
         text: text, // Store original with formatting
         timestamp: new Date().toISOString()
       });

       // Dispatch event for UI update
       window.dispatchEvent(new CustomEvent('colleco:voice-response', { 
         detail: { text, timestamp: new Date().toISOString() }
       }));
     }

    this.synthesis.speak(utterance);
   
     // Restart listening after speech completes (if still in listening mode)
     utterance.onend = () => {
       if (this.isListening) {
         setTimeout(() => {
           try {
             this.recognition.start();
           } catch (e) {
             console.log('[VoiceAgent] Recognition already started');
           }
         }, 500); // Wait 500ms before listening again
       }
     };
  }

  // Process voice command
  async processCommand(transcript) {
    const intent = this.detectIntent(transcript);
    
    switch (intent.type) {
      case 'BOOK_SHUTTLE':
        await this.handleShuttleBooking(intent, transcript);
        break;
      case 'BOOK_ACCOMMODATION':
        await this.handleAccommodationBooking(intent, transcript);
        break;
      case 'BOOK_FLIGHT':
        await this.handleFlightBooking(intent, transcript);
        break;
      case 'CHECK_STATUS':
        await this.handleStatusCheck(intent, transcript);
        break;
      case 'CANCEL_BOOKING':
        await this.handleCancellation(intent, transcript);
        break;
      case 'GET_HELP':
        this.handleHelp();
        break;
      case 'CONFIRM':
        await this.handleConfirmation();
        break;
      case 'MODIFY':
        await this.handleModification(transcript);
        break;
      default:
        this.handleUnknownIntent(transcript);
    }
  }

  // Detect user intent using NLP
  detectIntent(transcript) {
    const lower = transcript.toLowerCase();

    // Shuttle/Transfer booking
    if (this.matchesPattern(lower, ['shuttle', 'transfer', 'ride', 'transport', 'drive'])) {
      return {
        type: 'BOOK_SHUTTLE',
        entities: this.extractShuttleEntities(transcript)
      };
    }

    // Accommodation booking
    if (this.matchesPattern(lower, ['hotel', 'accommodation', 'room', 'stay', 'lodge'])) {
      return {
        type: 'BOOK_ACCOMMODATION',
        entities: this.extractAccommodationEntities(transcript)
      };
    }

    // Flight booking
    if (this.matchesPattern(lower, ['flight', 'fly', 'plane', 'airline'])) {
      return {
        type: 'BOOK_FLIGHT',
        entities: this.extractFlightEntities(transcript)
      };
    }

    // Status check
    if (this.matchesPattern(lower, ['status', 'check', 'where is', 'what is'])) {
      return { type: 'CHECK_STATUS' };
    }

    // Cancellation
    if (this.matchesPattern(lower, ['cancel', 'delete', 'remove'])) {
      return { type: 'CANCEL_BOOKING' };
    }

    // Help
    if (this.matchesPattern(lower, ['help', 'what can you do', 'how do'])) {
      return { type: 'GET_HELP' };
    }

    // Confirmation
    if (this.matchesPattern(lower, ['yes', 'correct', 'confirm', 'proceed', 'continue', 'okay', 'sure'])) {
      return { type: 'CONFIRM' };
    }

    // Modification
    if (this.matchesPattern(lower, ['change', 'modify', 'update', 'different', 'instead'])) {
      return { type: 'MODIFY' };
    }

    return { type: 'UNKNOWN' };
  }

  // Pattern matching helper
  matchesPattern(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  // Extract shuttle booking entities
  extractShuttleEntities(transcript) {
    const entities = {
      from: null,
      to: null,
      date: null,
      time: null,
      passengers: 1,
      vehicleType: 'sedan'
    };

    // Extract locations (from/to pattern)
    const fromToPattern = /from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s+on|\s+at|$)/i;
    const match = transcript.match(fromToPattern);
    if (match) {
      entities.from = this.cleanLocation(match[1]);
      entities.to = this.cleanLocation(match[2]);
    }

    // Extract date
    entities.date = this.extractDate(transcript);

    // Extract time
    entities.time = this.extractTime(transcript);

    // Extract passenger count
    const passengersPattern = /(\d+)\s+(passenger|person|people)/i;
    const passengersMatch = transcript.match(passengersPattern);
    if (passengersMatch) {
      entities.passengers = parseInt(passengersMatch[1]);
    }

    // Extract vehicle type
    if (transcript.includes('suv')) entities.vehicleType = 'suv';
    else if (transcript.includes('van') || transcript.includes('minibus')) entities.vehicleType = 'van';
    else if (transcript.includes('luxury')) entities.vehicleType = 'luxury';

    return entities;
  }

  // Extract accommodation entities
  extractAccommodationEntities(transcript) {
    return {
      location: this.extractLocation(transcript),
      checkIn: this.extractDate(transcript),
      checkOut: this.extractCheckoutDate(transcript),
      guests: this.extractGuestCount(transcript),
      roomType: this.extractRoomType(transcript)
    };
  }

  // Extract flight entities
  extractFlightEntities(transcript) {
    return {
      from: this.extractDepartureCity(transcript),
      to: this.extractArrivalCity(transcript),
      date: this.extractDate(transcript),
      passengers: this.extractGuestCount(transcript),
      class: this.extractFlightClass(transcript)
    };
  }

  // Date extraction with natural language support
  extractDate(text) {
    const today = new Date();
    
    // Check for "today"
    if (text.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    
    // Check for "tomorrow"
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    // Check for specific date formats
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // DD/MM/YYYY or MM/DD/YYYY
      /(\d{4})-(\d{2})-(\d{2})/,        // YYYY-MM-DD
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('january')) {
          // Month name format
          const months = {
            january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
            july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
          };
          const month = months[match[1].toLowerCase()];
          const day = parseInt(match[2]);
          const date = new Date(today.getFullYear(), month, day);
          return date.toISOString().split('T')[0];
        } else if (match[0].includes('-')) {
          return match[0]; // YYYY-MM-DD
        } else {
          // DD/MM/YYYY format
          const day = match[1];
          const month = match[2];
          const year = match[3];
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }

    return null;
  }

  // Time extraction
  extractTime(text) {
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
      /(\d{1,2})\s*(am|pm)/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? match[2] : '00';
        const meridiem = match[3] || match[2];

        if (meridiem && meridiem.toLowerCase() === 'pm' && hours !== 12) {
          hours += 12;
        } else if (meridiem && meridiem.toLowerCase() === 'am' && hours === 12) {
          hours = 0;
        }

        return `${String(hours).padStart(2, '0')}:${minutes}`;
      }
    }

    return null;
  }

  // Clean location name
  cleanLocation(location) {
    return location.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Extract general location
  extractLocation(text) {
    const inPattern = /in\s+([a-z\s]+?)(?:\s+on|\s+from|$)/i;
    const match = text.match(inPattern);
    return match ? this.cleanLocation(match[1]) : null;
  }

  extractCheckoutDate(text) {
    const checkoutPattern = /checkout\s+on\s+([^,]+)/i;
    const match = text.match(checkoutPattern);
    return match ? this.extractDate(match[1]) : null;
  }

  extractGuestCount(text) {
    const guestPattern = /(\d+)\s+(guest|person|people|passenger)/i;
    const match = text.match(guestPattern);
    return match ? parseInt(match[1]) : 1;
  }

  extractRoomType(text) {
    if (text.includes('suite')) return 'suite';
    if (text.includes('deluxe')) return 'deluxe';
    if (text.includes('family')) return 'family';
    return 'standard';
  }

  extractDepartureCity(text) {
    const fromPattern = /from\s+([a-z\s]+?)\s+to/i;
    const match = text.match(fromPattern);
    return match ? this.cleanLocation(match[1]) : null;
  }

  extractArrivalCity(text) {
    const toPattern = /to\s+([a-z\s]+?)(?:\s+on|$)/i;
    const match = text.match(toPattern);
    return match ? this.cleanLocation(match[1]) : null;
  }

  extractFlightClass(text) {
    if (text.includes('business')) return 'business';
    if (text.includes('first')) return 'first';
    return 'economy';
  }

  // Handle shuttle booking conversation
  async handleShuttleBooking(intent, transcript) {
    const entities = intent.entities;

    // Initialize booking if new
    if (!this.currentBooking.type) {
      this.currentBooking = {
        type: 'shuttle',
        from: entities.from,
        to: entities.to,
        date: entities.date,
        time: entities.time,
        passengers: entities.passengers,
        vehicleType: entities.vehicleType,
        step: 'collecting'
      };
    }

    // Check what information we have
    const missing = this.getMissingFields();

    if (missing.length === 0) {
      // All information collected, confirm booking
      await this.confirmShuttleBooking();
    } else {
      // Ask for missing information
      this.askForMissingInfo(missing[0]);
    }
  }

  // Get missing required fields
  getMissingFields() {
    const required = ['from', 'to', 'date', 'time'];
    const missing = [];

    for (const field of required) {
      if (!this.currentBooking[field]) {
        missing.push(field);
      }
    }

    return missing;
  }

  // Ask for missing information
  askForMissingInfo(field) {
    const questions = {
      from: "Where would you like to be picked up from?",
      to: "And where are you heading to?",
      date: "What date would you like to travel? You can say today, tomorrow, or a specific date.",
      time: "What time would you like to be picked up?",
      passengers: "How many passengers will be traveling?",
      vehicleType: "What type of vehicle would you prefer? We have sedans, SUVs, vans, and luxury vehicles."
    };

    this.currentBooking.step = `waiting_for_${field}`;
    this.speak(questions[field]);
  }

  // Confirm shuttle booking
  async confirmShuttleBooking() {
    const { from, to, date, time, passengers, vehicleType } = this.currentBooking;

    const confirmation = `Great! Let me confirm your shuttle booking. 
      You want to travel from ${from} to ${to} on ${this.formatDate(date)} at ${time}.
      ${passengers > 1 ? `${passengers} passengers` : '1 passenger'}, using a ${vehicleType}.
      The estimated cost will be calculated shortly. Should I proceed with this booking?`;

    this.speak(confirmation);
    this.currentBooking.step = 'awaiting_confirmation';

    // Get price estimate
    try {
      const estimate = await this.getShuttleEstimate(this.currentBooking);
      this.currentBooking.estimate = estimate;
      
      setTimeout(() => {
        this.speak(`The estimated cost for this trip is ${this.formatCurrency(estimate.totalPrice)}. Would you like to confirm?`);
      }, 3000);
    } catch (error) {
      console.error('Failed to get estimate:', error);
    }
  }

  // Handle confirmation
  async handleConfirmation() {
    if (this.currentBooking.step === 'awaiting_confirmation') {
      this.speak("Perfect! I'm processing your booking now. Please wait a moment.");

      try {
        const result = await this.submitShuttleBooking(this.currentBooking);
        
        this.speak(`Your booking has been confirmed! Your reference number is ${result.bookingRef}. 
          You'll receive a confirmation email shortly. Is there anything else I can help you with?`);
        
        // Reset for next booking
        this.resetConversation();
      } catch (error) {
        this.speak("I'm sorry, there was an issue processing your booking. Please try again or contact support.");
      }
    } else {
      this.speak("I'm not sure what you'd like me to confirm. Could you please clarify?");
    }
  }

  // Handle modification
  async handleModification(transcript) {
    if (!this.currentBooking.type) {
      this.speak("There's no active booking to modify. Would you like to make a new booking?");
      return;
    }

    // Extract what to change
    if (transcript.includes('time')) {
      const newTime = this.extractTime(transcript);
      if (newTime) {
        this.currentBooking.time = newTime;
        this.speak(`Okay, I've changed the time to ${newTime}. Let me recalculate the estimate.`);
        await this.confirmShuttleBooking();
      } else {
        this.speak("What time would you like instead?");
      }
    } else if (transcript.includes('date')) {
      const newDate = this.extractDate(transcript);
      if (newDate) {
        this.currentBooking.date = newDate;
        this.speak(`Okay, I've changed the date to ${this.formatDate(newDate)}. Let me recalculate.`);
        await this.confirmShuttleBooking();
      } else {
        this.speak("What date would you prefer?");
      }
    } else {
      this.speak("What would you like to change? You can modify the time, date, pickup location, or destination.");
    }
  }

  // Handle help request
  handleHelp() {
    this.speak(`I can help you with:
      Booking shuttles and transfers between cities,
      Booking hotels and accommodation,
      Booking flights,
      Checking your booking status,
      Or canceling bookings.
      Just tell me what you'd like to do!`);
  }

  // Handle unknown intent
  handleUnknownIntent(transcript) {
    this.speak("I didn't quite understand that. Could you please rephrase, or say 'help' to hear what I can do?");
  }

  // Handle status check
  async handleStatusCheck() {
    this.speak("To check your booking status, please provide your booking reference number.");
  }

  // Handle cancellation
  async handleCancellation() {
    this.speak("To cancel a booking, please provide your booking reference number.");
  }

  // Get shuttle price estimate
  async getShuttleEstimate(booking) {
    const response = await fetch('/api/transfers/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: booking.from,
        dropoff: booking.to,
        vehicleType: booking.vehicleType,
        pax: booking.passengers,
        luggage: booking.passengers,
        isRoundTrip: false,
        additionalStops: []
      })
    });

    return await response.json();
  }

  // Submit shuttle booking
  async submitShuttleBooking(booking) {
    const response = await fetch('/api/transfers/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: booking.from,
        dropoff: booking.to,
        pax: booking.passengers,
        vehicleType: booking.vehicleType,
        luggage: booking.passengers,
        bookingType: 'instant',
        isRoundTrip: false,
        isMultiStop: false,
        additionalStops: [],
        scheduledDate: booking.date,
        scheduledTime: booking.time
      })
    });

    return await response.json();
  }

  // Format date for speech
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-ZA', options);
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Reset conversation
  resetConversation() {
    this.currentBooking = {};
    this.conversationContext = {};
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Singleton instance
const voiceAgent = new VoiceBookingAgent();

export default voiceAgent;
export { VoiceBookingAgent };
