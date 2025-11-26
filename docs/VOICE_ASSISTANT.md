# Voice-Powered AI Booking Assistant

## Overview

CollEco Travel's Voice Assistant enables hands-free booking through natural language conversation. Users can speak commands to book shuttles, accommodation, flights, and manage their travel plans - making the booking process as simple as having a conversation.

## Features

### 🎤 Voice Commands
- **Multi-modal Input**: Voice commands via microphone OR text input
- **Continuous Listening**: Always-on mode for hands-free operation
- **Natural Language Processing**: Understands conversational requests
- **South African English**: Optimized for SA accent and terminology

### 🤖 AI-Powered Conversation
- **Intent Detection**: Automatically identifies what you want to do
- **Entity Extraction**: Pulls locations, dates, times, passenger counts from speech
- **Context Awareness**: Remembers conversation flow and missing information
- **Smart Prompting**: Asks clarifying questions when information is missing

### 🚐 Supported Services

#### Shuttle/Transfer Bookings
Example: *"Book a shuttle from Durban to Port Shepstone on 27/11/2025 at 10am"*

**Extracted Information:**
- Pickup location
- Dropoff location
- Date (supports "today", "tomorrow", or specific dates)
- Time (12-hour or 24-hour format)
- Passenger count
- Vehicle type (sedan, SUV, van, luxury)

#### Accommodation Bookings
Example: *"Book a hotel in Cape Town from December 1st to December 5th for 2 guests"*

**Extracted Information:**
- Location
- Check-in date
- Check-out date
- Number of guests
- Room type preference

#### Flight Bookings
Example: *"Book a flight from Johannesburg to Durban on Friday"*

**Extracted Information:**
- Departure city
- Arrival city
- Travel date
- Passenger count
- Class preference (economy, business, first)

### 💬 Conversation Features

#### Natural Date Recognition
- "today" → Current date
- "tomorrow" → Next day
- "Friday" → Next Friday
- "December 1st" → Specific date
- "27/11/2025" → DD/MM/YYYY format

#### Flexible Time Input
- "10am" → 10:00
- "3:30pm" → 15:30
- "14:00" → 14:00

#### Modification Support
- "Change the time to 2pm"
- "Make it tomorrow instead"
- "I need 3 passengers"

#### Confirmation Flow
- Agent confirms all details before booking
- Calculates price estimate
- Asks for final confirmation
- Provides booking reference on success

## Usage Guide

### Starting a Voice Conversation

**Option 1: Voice Command**
1. Click the orange microphone button (bottom-right corner)
2. Grant microphone permission when prompted
3. Speak your request clearly
4. Wait for the assistant's response

**Option 2: Text Input**
1. Click the microphone button to open the panel
2. Type your request in the text box
3. Press Enter or click Send
4. The assistant processes it the same way

### Example Conversations

#### Shuttle Booking (Complete)
```
User: "Book a shuttle from Durban to Port Shepstone on 27/11/2025 at 10am"