import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle, XCircle, RefreshCw, Loader, Calendar, Users, MapPin, Clock, Share2, Save, Download, Sparkles, MessageSquare } from 'lucide-react';
import { useBasketState } from '../utils/useBasketState';

/**
 * Trip Assist - AI Travel Planner
 * Matches Home page and Plan Trip design patterns
 */
export default function TripAssist() {
  const navigate = useNavigate();
  const { basket, addToBasket } = useBasketState();
  
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  // Quick Filters State
  const [budget, setBudget] = useState('mid-range');
  const [travelStyle, setTravelStyle] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [pace, setPace] = useState('moderate');

  const quickStartPackages = [
    { 
      title: 'Cape Town Explorer', 
      subtitle: '3-5 days', 
      prompt: '3 days in Cape Town',
      image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&h=400&fit=crop'
    },
    { 
      title: 'Kruger Big 5 Safari', 
      subtitle: '3-4 days', 
      prompt: '3 days Kruger safari adventure',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop'
    },
    { 
      title: 'Garden Route Adventure', 
      subtitle: '5-7 days', 
      prompt: '5 days Garden Route coastal trip',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop'
    },
    { 
      title: 'Durban Beach Bliss', 
      subtitle: '3-4 days', 
      prompt: '3 days in Durban to relax',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop'
    },
  ];

  const travelStyles = ['Adventure', 'Relaxation', 'Culture', 'Foodie', 'Romance', 'Family'];

  const toggleTravelStyle = (style) => {
    setTravelStyle(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  useEffect(() => {
    document.title = 'Trip Assist - AI Travel Planner | CollEco Travel';
    // Load recent searches from localStorage
    try {
      const recent = JSON.parse(localStorage.getItem('colleco.recentSearches') || '[]');
      setRecentSearches(recent.slice(0, 5));
    } catch {}
  }, []);

  const generateItinerary = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    // Save to recent searches
    try {
      const recent = JSON.parse(localStorage.getItem('colleco.recentSearches') || '[]');
      const updated = [prompt, ...recent.filter(s => s !== prompt)].slice(0, 5);
      localStorage.setItem('colleco.recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
    
    setLoadingStage('Analyzing preferences...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setLoadingStage('Finding best hotels...');
    await new Promise(resolve => setTimeout(resolve, 700));
    
    setLoadingStage('Curating activities...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setLoadingStage('Optimizing package...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const services = analyzePromptAndSelectServices(prompt);
    setSelectedServices(services);
    setLoading(false);
    
    // Generate AI suggestions
    setAiSuggestions([
      'Make it more budget-friendly',
      'Add adventure activities',
      'Include wine tasting experience',
      'Switch to beachfront hotel'
    ]);
    
    setTimeout(() => {
      document.getElementById('package-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const analyzePromptAndSelectServices = (description) => {
    const lower = description.toLowerCase();
    
    const nightsMatch = lower.match(/(\d+)\s*(day|night)/i);
    const nights = nightsMatch ? parseInt(nightsMatch[1]) : 3;
    
    const peopleMatch = lower.match(/(\d+)\s*(adult|people)/i);
    const adults = peopleMatch ? parseInt(peopleMatch[1]) : (lower.includes('family') ? 4 : 2);
    
    let budget = 10000;
    if (lower.includes('kruger') || lower.includes('safari')) budget = 15000;
    if (lower.includes('luxury') || lower.includes('premium')) budget *= 2;
    if (lower.includes('budget') || lower.includes('cheap')) budget *= 0.6;
    budget = budget * (nights / 3) * (adults / 2);
    
    const isRelaxing = /relax|beach|chill|spa|wine/i.test(lower);
    
    const services = [];
    let serviceId = 1;
    
    if (lower.includes('cape town')) {
      services.push({
        id: serviceId++,
        type: 'hotel',
        title: 'The Table Bay Hotel',
        location: 'V&A Waterfront, Cape Town',
        description: '5-star luxury with stunning Table Mountain views. Includes breakfast and spa access.',
        price: 4500,
        category: 'accommodation',
        day: 1,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop'
      });
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'Table Mountain Cable Car & Guided Tour',
        location: 'Table Mountain',
        description: 'Return cable car tickets with guided summit tour. Weather guarantee included.',
        price: 1300,
        category: 'sightseeing',
        day: 2,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1583427053379-c797ecc35dd8?w=300&h=200&fit=crop'
      });
      
      if (isRelaxing) {
        services.push({
          id: serviceId++,
          type: 'activity',
          title: 'Constantia Wine Tasting Experience',
          location: 'Constantia Valley',
          description: 'Premium wine estate tour with cellar tour, 5 wine tastings, and gourmet lunch.',
          price: 2200,
          category: 'experience',
          day: 3,
          status: 'pending',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=200&fit=crop'
        });
      } else {
        services.push({
          id: serviceId++,
          type: 'activity',
          title: 'Shark Cage Diving Adventure',
          location: 'Gansbaai',
          description: 'Full-day great white shark diving experience with breakfast and lunch included.',
          price: 2800,
          category: 'adventure',
          day: 3,
          status: 'pending',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop'
        });
      }
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'Penguin Colony & Chapman\'s Peak Drive',
        location: 'Boulders Beach & Chapman\'s Peak',
        description: 'Private guided tour to Simon\'s Town penguins and scenic coastal drive.',
        price: 1800,
        category: 'sightseeing',
        day: 2,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=300&h=200&fit=crop'
      });
    } else if (lower.includes('kruger') || lower.includes('safari')) {
      services.push({
        id: serviceId++,
        type: 'hotel',
        title: 'Protea Hotel Kruger Gate',
        location: 'Kruger National Park Gate',
        description: 'Safari lodge with game viewing deck, pool, and authentic African cuisine.',
        price: 6750,
        category: 'accommodation',
        day: 1,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=300&h=200&fit=crop'
      });
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'Sunrise Game Drive',
        location: 'Kruger National Park',
        description: 'Professional ranger-led 3-hour morning safari. Big 5 viewing opportunities.',
        price: 2200,
        category: 'safari',
        day: 2,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=300&h=200&fit=crop'
      });
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'Sunset Game Drive',
        location: 'Kruger National Park',
        description: 'Evening safari with sundowner drinks. Nocturnal animal spotting.',
        price: 2200,
        category: 'safari',
        day: 2,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1535338454770-7a710e69dfb9?w=300&h=200&fit=crop'
      });
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'Bush Walk with Tracker',
        location: 'Kruger National Park',
        description: 'Guided walking safari learning animal tracking and bush survival skills.',
        price: 1800,
        category: 'adventure',
        day: 3,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=300&h=200&fit=crop'
      });
    } else if (lower.includes('durban')) {
      services.push({
        id: serviceId++,
        type: 'hotel',
        title: 'Southern Sun Elangeni & Maharani',
        location: 'Durban Golden Mile',
        description: 'Beachfront luxury hotel with ocean views, pools, and direct beach access.',
        price: 3600,
        category: 'accommodation',
        day: 1,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop'
      });
      
      if (isRelaxing) {
        services.push({
          id: serviceId++,
          type: 'activity',
          title: 'Full Day Spa & Wellness Package',
          location: 'Beverly Hills Hotel Spa',
          description: 'Luxury spa day with massage, facial, mani-pedi, and spa lunch.',
          price: 3600,
          category: 'relaxation',
          day: 2,
          status: 'pending',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&h=200&fit=crop'
        });
      } else {
        services.push({
          id: serviceId++,
          type: 'activity',
          title: 'uShaka Marine World Experience',
          location: 'uShaka Marine World',
          description: 'Full-day aquarium and water park access with dolphin show.',
          price: 1100,
          category: 'entertainment',
          day: 2,
          status: 'pending',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop'
        });
      }
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'Moses Mabhida Stadium SkyCar',
        location: 'Moses Mabhida Stadium',
        description: 'SkyCar ride to stadium arch with 360° city views and adventure walk option.',
        price: 850,
        category: 'sightseeing',
        day: 3,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=300&h=200&fit=crop'
      });
    } else {
      services.push({
        id: serviceId++,
        type: 'hotel',
        title: 'Premium City Hotel',
        location: 'City Center',
        description: 'Upscale accommodation with modern amenities, breakfast included.',
        price: 4050,
        category: 'accommodation',
        day: 1,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop'
      });
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'City Walking Tour',
        location: 'Historic District',
        description: 'Guided 3-hour cultural and historical walking tour with local expert.',
        price: 900,
        category: 'sightseeing',
        day: 2,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=200&fit=crop'
      });
      
      services.push({
        id: serviceId++,
        type: 'activity',
        title: 'Local Cuisine Experience',
        location: 'Premium Restaurant',
        description: '5-course tasting menu showcasing regional specialties with wine pairing.',
        price: 1800,
        category: 'dining',
        day: 2,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop'
      });
    }
    
    services.push({
      id: serviceId++,
      type: 'transfer',
      title: 'Airport Transfer (Arrival)',
      location: 'Airport to Hotel',
      description: 'Private luxury vehicle transfer with meet & greet service.',
      price: 450,
      category: 'transport',
      day: 1,
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&h=200&fit=crop'
    });
    
    services.push({
      id: serviceId++,
      type: 'transfer',
      title: 'Airport Transfer (Departure)',
      location: 'Hotel to Airport',
      description: 'Return private transfer with luggage assistance.',
      price: 450,
      category: 'transport',
      day: nights,
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=200&fit=crop'
    });
    
    return services;
  };

  const acceptService = (serviceId) => {
    setSelectedServices(prev =>
      prev.map(s => s.id === serviceId ? { ...s, status: 'accepted' } : s)
    );
  };

  const removeService = (serviceId) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleReplaceService = (serviceId) => {
    alert('Alternative service suggestions coming soon!');
  };


  const handleSaveTrip = () => {
    try {
      const savedTrips = JSON.parse(localStorage.getItem('colleco.savedTrips') || '[]');
      const newTrip = {
        id: Date.now(),
        prompt,
        services: selectedServices,
        createdAt: new Date().toISOString()
      };
      savedTrips.push(newTrip);
      localStorage.setItem('colleco.savedTrips', JSON.stringify(savedTrips));
      alert('Trip saved successfully!');
      setShowSaveModal(false);
    } catch (e) {
      alert('Failed to save trip');
    }
  };

  const handleShareTrip = () => {
    const shareText = `Check out my ${prompt} itinerary on CollEco Travel!`;
    if (navigator.share) {
      navigator.share({ title: 'My Trip', text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    setShowShareModal(false);
  };

  const handleExportPDF = () => {
    alert('PDF export coming soon!');
  };

  const handleAiRefine = (suggestion) => {
    setPrompt(`${prompt} - ${suggestion}`);
    alert(`AI refinement: "${suggestion}" - This feature is coming soon!`);
  };

  const groupServicesByDay = () => {
    const grouped = {};
    selectedServices.forEach(service => {
      const day = service.day || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(service);
    });
    return grouped;
  };
  const handleBookTrip = () => {
    selectedServices.forEach(service => {
      addToBasket({
        id: `trip-assist-${service.id}`,
        title: service.title,
        type: service.type,
        description: service.description,
        price: service.price,
        quantity: 1,
        category: service.category,
        location: service.location,
        day: service.day
      });
    });
    navigate('/trip-basket');
  };

  const acceptedCount = selectedServices.filter(s => s.status === 'accepted').length;
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        {/* Header - Left Aligned */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-brand-brown">Trip Assist</h1>
          <p className="mt-2 text-brand-brown/80 max-w-2xl">
            Tell us your travel vision. Our AI curates the perfect itinerary with handpicked hotels, activities, and experiences.
          </p>
        </div>

        {/* Quick Filters */}
        <div className="mb-8 bg-cream rounded-lg border border-cream-border p-6">
          <h3 className="text-sm font-semibold text-brand-brown mb-4">Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Budget */}
            <div>
              <label className="block text-xs font-semibold text-brand-brown mb-2">Budget</label>
              <div className="flex gap-2">
                {['budget', 'mid-range', 'luxury'].map(level => (
                  <button
                    key={level}
                    onClick={() => setBudget(level)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold capitalize transition-all ${
                      budget === level
                        ? 'bg-brand-orange text-white'
                        : 'bg-white border border-cream-border text-brand-brown hover:border-brand-orange'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-xs font-semibold text-brand-brown mb-2">Travel Dates</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-cream-border rounded-md text-xs focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                  placeholder="Start"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-cream-border rounded-md text-xs focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none"
                  placeholder="End"
                />
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-xs font-semibold text-brand-brown mb-2 flex items-center gap-2">
                <Users className="w-3 h-3" />
                Travelers
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}                onFocus={(e) => e.target.select()}                className="w-full px-3 py-2 border border-cream-border rounded-md text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-center font-semibold text-brand-brown"
                placeholder="Number of travelers"
              />
            </div>
          </div>

          {/* Travel Style Tags */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-brand-brown mb-2">Travel Style</label>
            <div className="flex flex-wrap gap-2">
              {travelStyles.map(style => (
                <button
                  key={style}
                  onClick={() => toggleTravelStyle(style)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    travelStyle.includes(style)
                      ? 'bg-brand-orange text-white'
                      : 'bg-white border border-cream-border text-brand-brown hover:border-brand-orange'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Pace */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-brand-brown mb-2">Trip Pace</label>
            <div className="flex gap-2">
              {['relaxed', 'moderate', 'packed'].map(level => (
                <button
                  key={level}
                  onClick={() => setPace(level)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold capitalize transition-all ${
                    pace === level
                      ? 'bg-brand-orange text-white'
                      : 'bg-white border border-cream-border text-brand-brown hover:border-brand-orange'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ssName="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        {/* Header - Left Aligned */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-brand-brown">Trip Assist</h1>
          <p className="mt-2 text-brand-brown/80 max-w-2xl">
            Tell us your travel vision. Our AI curates the perfect itinerary with handpicked hotels, activities, and experiences.
          </p>
        </div>

        {/* Prompt Input - Left Aligned */}
        <div className="mb-12">
          <div className="bg-cream rounded-lg border border-cream-border p-6">
            <label className="block text-sm font-semibold text-brand-brown mb-2">
              Describe Your Trip
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  generateItinerary();
                }
              }}
              placeholder="e.g., Romantic weekend in Cape Town with wine tasting and sunset views"
              rows={3}
              className="w-full px-4 py-3 border border-cream-border rounded-md focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-brand-brown resize-none placeholder:text-brand-brown/40"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-brand-brown/60">Press Ctrl+Enter to submit</span>
              <button
                onClick={generateItinerary}
                disabled={!prompt.trim() || loading}
                className="px-6 py-2 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>{loadingStage}</span>
                  </>
                ) : (
                  'Create Itinerary'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && selectedServices.length === 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-brand-brown mb-3">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(search);
                    setTimeout(() => generateItinerary(), 100);
                  }}
                  className="px-3 py-1.5 bg-white border border-cream-border rounded-full text-sm text-brand-brown hover:border-brand-orange transition-all"
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start - Image Cards like Home page */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-brown mb-6">Popular right now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickStartPackages.map((pkg, index) => (
              <button
                key={index}
                onClick={() => {
                  setPrompt(pkg.prompt);
                  setTimeout(() => generateItinerary(), 100);
                }}
                className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-base text-white mb-1">{pkg.title}</h3>
                    <p className="text-sm text-white/90">{pkg.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results Package */}
        {selectedServices.length > 0 && (
          <div id="package-results" className="mt-12">
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-brand-orange text-white' 
                      : 'bg-white border border-cream-border text-brand-brown hover:border-brand-orange'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    viewMode === 'timeline' 
                      ? 'bg-brand-orange text-white' 
                      : 'bg-white border border-cream-border text-brand-brown hover:border-brand-orange'
                  }`}
                >
                  Timeline View
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="p-2 bg-white border border-cream-border rounded-md text-brand-brown hover:border-brand-orange transition-all"
                  title="Save Trip"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 bg-white border border-cream-border rounded-md text-brand-brown hover:border-brand-orange transition-all"
                  title="Share Trip"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExportPDF}
                  className="p-2 bg-white border border-cream-border rounded-md text-brand-brown hover:border-brand-orange transition-all"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Refinement Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mb-6 bg-cream-sand/30 border border-cream-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  <h3 className="text-sm font-semibold text-brand-brown">AI Suggestions</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAiRefine(suggestion)}
                      className="px-3 py-1.5 bg-white border border-cream-border rounded-full text-sm text-brand-brown hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all"
                    >
                      <MessageSquare className="w-3 h-3 inline mr-1" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-cream-sand/50 border border-cream-border rounded-lg p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-brown mb-6">Your Curated Package</h2>

              {viewMode === 'timeline' ? (
                /* Timeline View */
                <div className="space-y-8 mb-8">
                  {Object.entries(groupServicesByDay()).map(([day, services]) => (
                    <div key={day} className="relative pl-8 border-l-2 border-brand-orange/30">
                      <div className="absolute -left-3 top-0 w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {day}
                      </div>
                      <h3 className="font-bold text-brand-brown mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Day {day}
                      </h3>
                      <div className="space-y-3">
                        {services.map((service) => {
                          const isAccepted = service.status === 'accepted';
                          return (
                            <div
                              key={service.id}
                              className={`rounded-lg border transition-all overflow-hidden ${
                                isAccepted
                                  ? 'bg-white border-green-500'
                                  : 'bg-white border-cream-border hover:border-brand-orange'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row gap-4 p-4">
                                <div className="w-full sm:w-24 h-24 sm:h-20 flex-shrink-0 rounded-md overflow-hidden">
                                  <img 
                                    src={service.image} 
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                      <h4 className="font-bold text-brand-brown text-sm">{service.title}</h4>
                                      <p className="text-xs text-brand-brown/70 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {service.location}
                                      </p>
                                    </div>
                                    <p className="font-bold text-brand-brown text-sm">R{service.price.toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    {!isAccepted ? (
                                      <button
                                        onClick={() => acceptService(service.id)}
                                        className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition-all"
                                      >
                                        ✓ Add
                                      </button>
                                    ) : (
                                      <div className="flex items-center gap-1 text-xs text-green-600">
                                        <CheckCircle className="w-3 h-3" />
                                        <span className="font-semibold">Included</span>
                                      </div>
                                    )}
                                    <button
                                      onClick={() => handleReplaceService(service.id)}
                                      className="p-1 text-brand-brown/60 hover:text-brand-orange transition-all"
                                      title="Find Alternative"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeService(service.id)}
                                      className="p-1 text-brand-brown/60 hover:text-red-600 transition-all"
                                      title="Remove"
                                    >
                                      <XCircle className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Grid View */
                <div className="space-y-4 mb-8">
                {selectedServices.map((service) => {
                  const isAccepted = service.status === 'accepted';
                  
                  return (
                    <div
                      key={service.id}
                      className={`rounded-lg border transition-all overflow-hidden ${
                        isAccepted
                          ? 'bg-white border-green-500'
                          : 'bg-white border-cream-border hover:border-brand-orange'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        {/* Image */}
                        <div className="w-full sm:w-32 h-32 sm:h-24 flex-shrink-0 rounded-md overflow-hidden">
                          <img 
                            src={service.image} 
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-bold text-brand-brown">{service.title}</h3>
                              <p className="text-sm text-brand-brown/70">{service.location}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-brand-brown">R{service.price.toLocaleString()}</p>
                              {service.day && <p className="text-xs text-brand-brown/60">Day {service.day}</p>}
                            </div>
                          </div>
                          <p className="text-sm text-brand-brown/80 mb-3">{service.description}</p>
                          <div className="flex items-center gap-2">
                            {!isAccepted ? (
                              <button
                                onClick={() => acceptService(service.id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-all"
                              >
                                ✓ Add
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-semibold">Included</span>
                              </div>
                            )}
                            <button
                              onClick={() => handleReplaceService(service.id)}
                              className="p-1 text-brand-brown/60 hover:text-brand-orange transition-all"
                              title="Find Alternative"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeService(service.id)}
                              className="p-1 text-brand-brown/60 hover:text-red-600 transition-all"
                              title="Remove"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Travel Essentials Section */}
              <div className="mb-8 bg-white border border-cream-border rounded-lg p-6">
                <h3 className="font-bold text-brand-brown mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-orange" />
                  Travel Essentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="p-4 border border-cream-border rounded-lg text-left hover:border-brand-orange transition-all">
                    <div className="font-semibold text-brand-brown text-sm mb-1">Travel Insurance</div>
                    <div className="text-xs text-brand-brown/70">From R150/day</div>
                  </button>
                  <button className="p-4 border border-cream-border rounded-lg text-left hover:border-brand-orange transition-all">
                    <div className="font-semibold text-brand-brown text-sm mb-1">Visa Requirements</div>
                    <div className="text-xs text-brand-brown/70">Check & Apply</div>
                  </button>
                  <button className="p-4 border border-cream-border rounded-lg text-left hover:border-brand-orange transition-all">
                    <div className="font-semibold text-brand-brown text-sm mb-1">Packing List</div>
                    <div className="text-xs text-brand-brown/70">AI Generated</div>
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-6 border-t border-cream-border">
                <div>
                  <p className="font-semibold text-brand-brown">Total: R{totalPrice.toLocaleString()}</p>
                  <p className="text-sm text-brand-brown/70">{acceptedCount} of {selectedServices.length} services selected</p>
                </div>
                <button
                  onClick={handleBookTrip}
                  disabled={selectedServices.length === 0}
                  className="px-8 py-3 bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                >
                  Book Package
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Basket Indicator */}
        {basket.length > 0 && (
          <div 
            onClick={() => navigate('/trip-basket')}
            className="fixed bottom-8 right-8 bg-brand-orange text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-semibold">{basket.length}</span>
              <span className="text-sm">
                R{basket.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
