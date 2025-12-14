/**
 * Zola - Concise Travel Assistant
 * Brief, user-directed assistance focused on clarifying questions
 */

export function getZolaResponse(userMessage) {
  const _lower = userMessage.toLowerCase();
  
  // Greetings
  if (/^(hi|hello|hey|howdy|good morning|good afternoon|good evening|what's up|sup|sawubona|sanibonani)\b/i.test(userMessage)) {
    return "Hi I'm Zola, I'm here to assist you. What can I help you with today?";
  }

  // About Zola
  if (/who are you|what are you|tell me about yourself|your name/i.test(userMessage)) {
    return "I'm Zola, your travel assistant. I help with flights, accommodation, transfers, safaris, tours, events, and packages throughout KZN and beyond. I specialize in the Durban area and know it well. What are you planning?";
  }

  // Services
  if (/what (can you do|do you offer|services)|how (does this|can you help)|features|help me/i.test(userMessage)) {
    return "I can help with:\n• Flights & accommodation\n• Shuttles & transfers (Pick My Ride)\n• Safari & tours\n• Events & packages\n• Travel advice & budgeting\n\nWhat specific service interests you?";
  }

  // Destination recommendations
  if (/where (should|can) (i|we) go|recommend (a )?destination|suggest (a )?place|best place/i.test(userMessage)) {
    if (/beach|coast|ocean|sea/i.test(userMessage)) {
      return "Top coastal spots:\n• **Ballito** - family-friendly, tidal pools, safe\n• **Umhlanga** - upscale, great dining & promenade\n• **Salt Rock** - quiet, natural pools\n• **South Coast** - budget-friendly, warm waters\n• **Sodwana** - diving & snorkeling paradise\n\nWhat's your priority: family safety, romance, budget, or adventure?";
    }
    if (/safari|wildlife|game|animal/i.test(userMessage)) {
      return "Safari options:\n• **Hluhluwe-iMfolozi** - Big Five, R320+ entry, May-Sep best\n• **iSimangaliso** - hippos, crocs, boat safaris, turtle tours\n• **Phinda Private** - luxury, intimate sightings\n\nWhat's your budget range?";
    }
    if (/mountain|hike|drakensberg|berg/i.test(userMessage)) {
      return "Drakensberg highlights:\n• **Cathedral Peak** - varied trails, San rock art\n• **Royal Natal** - Amphitheatre, Tugela Falls\n• **Sani Pass** - 4x4 to Lesotho, highest pub in Africa\n\nWhat's your fitness level and main interest?";
    }
    return "What type of destination interests you?\n🏖️ Beach & coast\n🦁 Safari & wildlife\n⛰️ Mountains & hiking\n🎭 Culture & heritage\n🌃 City life\n🍷 Food & wine\n\nWhich appeals to you?";
  }

  // Budget & pricing
  if (/how much|cost|price|budget|afford|cheap|expensive|what.*pay/i.test(userMessage)) {
    if (/durban|umhlanga|ballito/i.test(userMessage)) {
      return "Durban/KZN pricing (Nov 2025):\n**Accommodation/night:** Budget R650-1,200 | Mid R1,500-2,800 | Luxury R3,000+\n**Transfers:** Airport→Durban R250-400 | →Umhlanga R180-300\n**Activities:** uShaka R195 | Safari R320+ | Cultural tour R450-850\n**Daily budget:** Backpacker R800-1,500 | Mid R2,500-4,500 | Luxury R6,000+\n\nWhat's your comfortable budget?";
    }
    return "General pricing:\n**Weekend (2 nights):** Budget R2,500-4,000pp | Mid R5,000-8,000pp | Luxury R12,000+pp\n**Week-long:** Beach R8,000-15,000pp | Safari R15,000-35,000pp | International R18,000-45,000pp\n\n**Save money:** Book 6-8 weeks ahead, travel midweek, use packages (15-25% savings), visit Apr-May or Sep-Oct.\n\nWhat's your budget range?";
  }

  // Best time to visit
  if (/when (should|to|is best)|best time|season|weather|climate/i.test(userMessage)) {
    return "**Summer (Dec-Feb):** Hot, humid, beach perfect, avoid safaris\n**Autumn (Apr-May):** Best overall - mild, dry, great prices\n**Winter (Jun-Aug):** Best for safari, still warm ocean, crisp mornings\n**Spring (Sep-Nov):** Warming, wildflowers, whale watching\n\nWhen are you thinking of traveling?";
  }

  // Shuttles & transfers
  if (/shuttle|transfer|airport|pickup|transport|taxi|uber|ride/i.test(userMessage)) {
    return "Our **Pick My Ride** service:\n• Verified drivers with ratings\n• See vehicle type, price, reviews upfront\n• GPS tracking & 24/7 support\n• No hidden fees\n\n**Sample routes:** King Shaka→Durban R250-400 | →Umhlanga R180-300 | →Ballito R350-550\n\nWhere do you need to go? (pickup, destination, date, passengers)";
  }

  // Accommodation
  if (/hotel|accommodation|stay|lodging|guesthouse|resort|where to stay|place to sleep/i.test(userMessage)) {
    return "To find your perfect stay, I need:\n📍 Destination\n📅 Check-in & check-out dates\n👥 Number of guests\n💰 Budget per night\n⭐ Preferences (hotel, guesthouse, resort, self-catering, lodge)\n\nWhat are your details?";
  }

  // Activities
  if (/what to do|things to do|activities|fun|experience|adventure|bored/i.test(userMessage)) {
    return "Popular activities:\n**Water:** Surfing, snorkeling, whale watching, kayaking\n**Wildlife:** Game drives, boat safaris, turtle tours\n**Culture:** Zulu villages, craft markets, heritage tours\n**Adventure:** Hiking, ziplining, abseiling, mountain biking\n**Food:** Curry classes, Midlands Meander, bunny chow tours\n**Relax:** Spa, beach walks, botanical gardens\n\nWhat type of experience interests you?";
  }

  // Packages
  if (/package|deal|special|combo|all.?inclusive|value/i.test(userMessage)) {
    return "Package options:\n**Weekend (2-3 nights):** R2,800-5,500pp\n**Safari (3-4 nights):** R12,000-18,000pp\n**Beach+Safari combo:** R18,000-35,000pp\n**Family packages:** From R15,000 (family of 4)\n**International:** Mozambique R8,500+ | Mauritius R18,000+ | Zanzibar R15,000+\n\n**Packages save 15-25%** vs booking separately. Current special: 3+ nights = free airport transfer.\n\nWhat's your dream trip? Budget? Number of people?";
  }

  // Events
  if (/event|concert|festival|show|exhibition|live music|performance/i.test(userMessage)) {
    return "We book events via Ticketmaster & partners:\n• Music & concerts (local & international)\n• Cultural festivals (Durban July, Poetry Africa)\n• Sports (Sharks rugby, Comrades Marathon, Midmar Mile)\n• Food & wine festivals\n• Family events\n\nI can find events, book tickets, arrange transport, and create event+stay packages.\n\nWhat kind of events interest you? When are you visiting?";
  }

  // Family/kids
  if (/family|kids|children|baby|toddler|child/i.test(userMessage)) {
    return "Family-friendly options:\n**Destinations:** Ballito/Umhlanga (safe beaches, tidal pools) | uShaka Marine World | Wildlife (Croc World, Hluhluwe) | Midlands (farm activities)\n\n**Age tips:** 0-3: self-catering, beaches, short trips | 4-8: uShaka, farms, easy trails | 9-17: adventure sports, full safari\n\n**Pricing (family of 4):** Budget weekend R8,000-12,000 | Week R25,000-45,000 | Safari R40,000-80,000\n\nHow old are your children? Any special interests?";
  }

  // Romantic/couples
  if (/romantic|honeymoon|anniversary|couple|valentine|proposal|date|special occasion/i.test(userMessage)) {
    return "Romantic getaways:\n**Oyster Box (Umhlanga):** Lighthouse views, spa, R4,500-8,000/night\n**Mozambique:** Beach villas, private pools, dhow cruises\n**Drakensberg:** Mountain lodges, fireplaces, spa, privacy\n**Midlands:** Boutique hotels, wine tasting, farm dining\n\nSpecial touches: Proposals, room decorations, private dining, couples spa, photography.\n\n**Budget (3-4 nights for 2):** Beautiful R15,000-25,000 | Luxury R30,000-50,000 | Special R60,000+\n\nWhat's the occasion? Your style?";
  }

  // Safety
  if (/safe|safety|secure|dangerous|crime|worry|scared|tip|advice/i.test(userMessage)) {
    return "**Key safety tips:**\n✅ Use our vetted transfers, never street taxis\n✅ Umhlanga, Ballito, Durban beachfront are safe tourist areas\n✅ Use cards, carry minimal cash (R500-1,000)\n✅ Swim only at lifeguarded beaches\n✅ Keep phone & bags secure in busy areas\n❌ Avoid Durban CBD at night, walking alone after dark\n\n**Emergency:** 10177 or 112\n**Medical:** Excellent private hospitals everywhere\n**Malaria:** Low risk (far north summer only)\n\nWhere will you be staying? I'll give specific local advice.";
  }

  // Voice feature
  if (/voice|speak|talk|microphone|mic|listen/i.test(userMessage)) {
    return "Yes! Click the microphone (top right) and speak naturally. I understand locations, dates, times, numbers, and even isiZulu greetings. Microphone turns orange when ready, red when listening. Much faster than typing!";
  }

  // Thank you
  if (/thank|thanks|appreciate|grateful|helpful|great|awesome|perfect|love (it|this|you)|you're (the best|amazing|great)/i.test(userMessage)) {
    return "You're welcome! What else can I help you with?";
  }

  // Durban specific
  if (/durban|dbn|ethekwini/i.test(userMessage) && !/transfer|shuttle|airport/i.test(userMessage)) {
    return "**Durban highlights:**\n🏖️ Golden Mile - 6km beachfront promenade\n🏛️ Moses Mabhida Stadium - SkyCar, Big Swing, views\n🦈 uShaka Marine World - aquarium & water park, R195\n🍛 Bunny chow - iconic curry dish (try Goundens)\n🌺 Botanic Gardens - Africa's oldest, free entry\n🎭 Florida Road - restaurants & nightlife\n\n**Day trips:** Valley of 1000 Hills, Umhlanga, Ballito, Shakaland\n\n**Best beaches:** North Beach, Bay of Plenty (lifeguards)\n\nWhat specifically interests you about Durban?";
  }

  // Complaints
  if (/problem|issue|complaint|wrong|bad|terrible|awful|disappointed|unhappy|cancel/i.test(userMessage)) {
    return "I'm sorry something's wrong. Please tell me exactly what happened - I'm here to fix this, not defend it. What's the issue?";
  }

  // Accessibility
  if (/wheelchair|disabled|disability|accessible|accessibility|special needs|mobility/i.test(userMessage)) {
    return "Accessibility services:\n✅ Moses Mabhida, uShaka, Gateway, modern hotels, Umhlanga promenade - all accessible\n✅ Wheelchair-accessible vehicles (must pre-book)\n✅ Some safari lodges have accessible rooms & vehicles\n\nI'll personally verify accessibility before confirming anything.\n\nWhat's your mobility level and specific requirements?";
  }

  // Fallback
  return "What can I help you with? (destination, dates, budget, activities, accommodation, transfers, etc.)";
}
