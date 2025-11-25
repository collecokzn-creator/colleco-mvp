import React, { useMemo, useState, useEffect, useRef } from 'react';
import ItineraryDay from "../components/ui/ItineraryDay";
import ExperienceCard from "../components/ui/ExperienceCard";
import MemoryNote from "../components/ui/MemoryNote";
import LiveTripProgress from "../components/ui/LiveTripProgress";
import jsPDF from "jspdf";
import { useTripState, setMemory, computeProgress } from "../utils/useTripState";
import { useBasketState } from "../utils/useBasketState";
import { useLocalStorageState } from "../useLocalStorageState";
import WorkflowPanel from "../components/WorkflowPanel";

export default function Itinerary() {
  const [trip, setTrip] = useTripState();
  const [linkQuotes] = useLocalStorageState('basketAutoSync:v1', true);
  const { basket, updateDay: _updateBasketDay, removeFromBasket } = useBasketState(); // _updateBasketDay unused (legacy API)
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [itinerarySettings, setItinerarySettings] = useLocalStorageState('itinerary_settings', {
    companyName: 'CollEco Travel',
    tagline: 'The Odyssey of Adventure',
    website: 'www.travelcolleco.com',
    logo: null
  });
  
  // Auto-save undo stack (silent background feature)
  const undoStackRef = useRef([]);
  const lastSavedRef = useRef(null);
  
  // Track changes and auto-save to undo stack
  useEffect(() => {
    const current = JSON.stringify(trip);
    if (lastSavedRef.current && lastSavedRef.current !== current) {
      try {
        const snapshot = JSON.parse(lastSavedRef.current);
        undoStackRef.current.push(snapshot);
        // Keep only last 20 versions for performance
        if (undoStackRef.current.length > 20) undoStackRef.current.shift();
      } catch(e) {}
    }
    lastSavedRef.current = current;
  }, [trip]);
  
  // Keyboard shortcut for undo (Ctrl/Cmd+Z) - silent feature
  useEffect(() => {
    const handleUndo = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (undoStackRef.current.length > 0) {
          const previous = undoStackRef.current.pop();
          setTrip(previous);
        }
      }
    };
    window.addEventListener('keydown', handleUndo);
    return () => window.removeEventListener('keydown', handleUndo);
  }, [setTrip]);
  
  // Auto-detect and merge AI drafts silently
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aiItineraryDraft:v1');
      if (raw && Object.keys(trip.days || {}).length === 0) {
        // Only auto-import if itinerary is empty
        const draft = JSON.parse(raw);
        const draftDays = {};
        
        (draft.itinerary || []).forEach(d => {
          const key = String(d.day || d.dayNumber || 1);
          if (!draftDays[key]) draftDays[key] = [];
          draftDays[key].push({
            id: 'ai-' + d.day + '-' + Math.random().toString(36).slice(2),
            title: d.title || `Day ${d.day}`,
            time: 'Flexible',
            subtitle: (d.activities || []).join(', '),
            _aiSource: true
          });
        });
        
        setTrip(prev => ({ ...prev, days: draftDays }));
        localStorage.removeItem('aiItineraryDraft:v1');
      }
    } catch(e) {}
  }, [trip.days, setTrip]);

  // Auto-sync basket items into their assigned days
  useEffect(() => {
    if (!linkQuotes) return;
    setTrip(t => {
      let next = { ...t, days: { ...t.days } };
      let mutated = false;
      const basketIds = new Set(basket.map(b => b.id));

      // Remove previously synced items no longer in basket
      Object.keys(next.days).forEach(d => {
        const filtered = (next.days[d] || []).filter(it => !(it._basketSource && !basketIds.has(it.id)));
        if (filtered.length !== (next.days[d] || []).length) {
          next.days[d] = filtered;
          mutated = true;
        }
      });

      // Add / move items according to their assigned day
      basket.forEach(bItem => {
        const targetDay = String(bItem.day || 1);
        const existingInTarget = (next.days[targetDay] || []).find(it => it.id === bItem.id);
        
        // Remove from other days if exists
        Object.keys(next.days).forEach(d => {
          if (d !== targetDay) {
            if ((next.days[d] || []).some(it => it.id === bItem.id && it._basketSource)) {
              next.days[d] = next.days[d].filter(it => it.id !== bItem.id);
              mutated = true;
            }
          }
        });
        
        // Add to target day if not there
        if (!existingInTarget) {
          const arr = next.days[targetDay] || [];
          next.days[targetDay] = [...arr, { ...bItem, time: bItem.time || 'Flexible', _basketSource: true }];
          mutated = true;
        }
      });
      
      // Auto-sort items within each day intelligently
      Object.keys(next.days).forEach(d => {
        const items = next.days[d] || [];
        if (items.length > 1) {
          const sorted = [...items].sort((a, b) => {
            // Priority order: Morning → Afternoon → Evening → Flexible
            const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2, 'Flexible': 3 };
            const aTime = timeOrder[a.time] ?? 99;
            const bTime = timeOrder[b.time] ?? 99;
            if (aTime !== bTime) return aTime - bTime;
            
            // Secondary: Basket items before manual items
            if (a._basketSource && !b._basketSource) return -1;
            if (!a._basketSource && b._basketSource) return 1;
            
            return 0;
          });
          
          // Check if order changed
          const orderChanged = sorted.some((item, idx) => items[idx]?.id !== item.id);
          if (orderChanged) {
            next.days[d] = sorted;
            mutated = true;
          }
        }
      });
      
      // Auto-cleanup: Remove empty days (except Day 1)
      Object.keys(next.days).forEach(d => {
        if (d !== '1' && (!next.days[d] || next.days[d].length === 0)) {
          delete next.days[d];
          mutated = true;
        }
      });

      return mutated ? next : t;
    });
  }, [basket, linkQuotes, setTrip]);

  // Filter items by search
  const filteredDays = useMemo(() => {
    if (!search.trim()) return trip.days;
    
    const q = search.trim().toLowerCase();
    const filtered = {};
    
    Object.keys(trip.days).forEach(day => {
      const items = (trip.days[day] || []).filter(it => 
        (it.title || '').toLowerCase().includes(q) || 
        (it.subtitle || '').toLowerCase().includes(q)
      );
      if (items.length > 0) {
        filtered[day] = items;
      }
    });
    
    return filtered;
  }, [trip.days, search]);

  // Remove item from itinerary with smart cleanup
  function removeItem(day, itemId) {
    setTrip(prev => {
      const dayItems = (prev.days[day] || []).filter(it => it.id !== itemId);
      const item = (prev.days[day] || []).find(it => it.id === itemId);
      
      // If it's a basket item, also remove from basket
      if (item?._basketSource) {
        removeFromBasket(itemId);
      }
      
      const newDays = { ...prev.days, [day]: dayItems };
      
      // Auto-cleanup: Remove day if empty (except Day 1)
      if (day !== '1' && dayItems.length === 0) {
        delete newDays[day];
      }
      
      return { ...prev, days: newDays };
    });
  }

  // Add empty day with smart numbering
  function addDay() {
    const existing = Object.keys(trip.days || {}).map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0);
    const next = existing.length ? Math.max(...existing) + 1 : 1;
    
    // Smart: Don't create if there's already an empty day at the end
    const lastDay = String(Math.max(...existing, 0));
    if (lastDay && (!trip.days[lastDay] || trip.days[lastDay].length === 0)) {
      return; // Already have an empty day
    }
    
    setTrip(prev => ({ ...prev, days: { ...prev.days, [String(next)]: [] } }));
  }

  // Export to PDF
  function handleExport() {
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Helper function to add header to current page
    const addHeader = () => {
      // Add custom logo if available
      if (itinerarySettings.logo) {
        try {
          const logoW = 45;
          const logoH = 20;
          const logoX = pageWidth - 14 - logoW;
          doc.addImage(itinerarySettings.logo, 'PNG', logoX, 8, logoW, logoH);
        } catch (e) {
          console.warn('Logo add failed:', e);
        }
      }
      
      // Company name at top - centered
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      const companyName = itinerarySettings.companyName || "CollEco Travel";
      const companyWidth = doc.getTextWidth(companyName);
      doc.text(companyName, (pageWidth - companyWidth) / 2, 16);
      
      // Letterhead: Bird logo - "Tagline" - Globe (centered)
      doc.setFontSize(24);
      const bird = "🦜";
      doc.setFontSize(11);
      doc.setFont(undefined, "italic");
      const payoffLine = itinerarySettings.tagline || "The Odyssey of Adventure";
      const payoffWidth = doc.getTextWidth(payoffLine);
      doc.setFontSize(14);
      const globe = "🌍";
      
      // Calculate total width of bird + payoff + globe
      doc.setFontSize(24);
      const birdWidth = doc.getTextWidth(bird);
      doc.setFontSize(14);
      const globeWidth = doc.getTextWidth(globe);
      const spacing = 2;
      const totalWidth = birdWidth + spacing + payoffWidth + spacing + globeWidth;
      const startX = (pageWidth - totalWidth) / 2;
      
      // Draw centered elements
      doc.setFontSize(24);
      doc.text(bird, startX, 26);
      
      doc.setFontSize(11);
      doc.setFont(undefined, "italic");
      doc.text(payoffLine, startX + birdWidth + spacing, 26);
      
      doc.setFontSize(14);
      doc.text(globe, startX + birdWidth + spacing + payoffWidth + spacing, 26);
      
      // Decorative line
      doc.setDrawColor(255, 140, 0); // Orange color
      doc.setLineWidth(0.5);
      doc.line(14, 36, pageWidth - 14, 36);
      
      doc.setTextColor(0, 0, 0);
    };
    
    // Helper function to add footer to current page
    const addFooter = () => {
      // Website
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 140, 0); // Orange color
      const websiteText = itinerarySettings.website || "www.travelcolleco.com";
      const websiteWidth = doc.getTextWidth(websiteText);
      const websiteX = (pageWidth - websiteWidth) / 2;
      doc.text(websiteText, websiteX, pageHeight - 10);
      
      // Underline the website
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(websiteX, pageHeight - 9, websiteX + websiteWidth, pageHeight - 9);
      
      doc.setTextColor(0, 0, 0);
    };
    
    // Add header to first page
    addHeader();
    
    // Generated date - left aligned (only on first page)
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    const dateText = `Itinerary for the Mkhize family generated on ${new Date().toLocaleDateString('en-GB')}`;
    doc.text(dateText, 14, 32);
    doc.setTextColor(0, 0, 0);
    
    let y = 46;
    const days = Object.keys(trip.days).sort((a, b) => Number(a) - Number(b));
    const startDate = new Date(); // Starting from today
    
    days.forEach((d, dayIndex) => {
      // Calculate the actual date for this day
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIndex);
      const formattedDate = currentDate.toLocaleDateString('en-GB'); // DD-MM-YYYY format
      
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(`Day ${d} - ${formattedDate}`, 14, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      
      (trip.days[d] || []).forEach((item) => {
        // Include time if available
        const timeInfo = item.time ? `[${item.time}] ` : '';
        const text = `• ${timeInfo}${item.title}${item.subtitle ? " — " + item.subtitle : ""}`;
        const lines = doc.splitTextToSize(text, 180);
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            addHeader();
            y = 46;
          }
          doc.text(line, 18, y);
          y += 6;
        });
      });
      
      const mem = trip.memories?.[d];
      if (mem) {
        doc.setFont(undefined, "italic");
        const memLines = doc.splitTextToSize(`Notes: ${mem}`, 180);
        memLines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            addHeader();
            y = 46;
          }
          doc.text(line, 18, y);
          y += 6;
        });
        doc.setFont(undefined, "normal");
      }
      
      y += 6;
    });
    
    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter();
    }
    
    doc.save("itinerary.pdf");
  }

  const dayKeys = Object.keys(filteredDays).sort((a, b) => Number(a) - Number(b));
  const totalItems = Object.values(filteredDays).reduce((sum, items) => sum + items.length, 0);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-cream to-cream-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-brown">✈️ Trip Itinerary</h1>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold" title="Auto-save, smart ordering, and AI draft detection enabled">
                  Smart Mode
                </span>
              </div>
              <p className="text-brand-russty text-sm sm:text-base">
                {dayKeys.length} day{dayKeys.length > 1 ? 's' : ''} • {totalItems} activit{totalItems === 1 ? 'y' : 'ies'} planned
              </p>
              <div className="mt-2 text-xs text-brand-russty/60">
                💡 Tip: Items auto-organize by time. Use search to find activities quickly.
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 rounded-lg border-2 border-brand-gold text-brand-brown hover:bg-brand-gold/10 font-semibold transition-all shadow-sm"
              >
                ⚙️ Settings
              </button>
              <button 
                onClick={handleExport}
                className="px-4 py-2 rounded-lg border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-semibold transition-all shadow-sm hover:shadow-md"
              >
                📄 Export PDF
              </button>
              <button 
                onClick={addDay}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-gold text-white hover:shadow-lg font-semibold transition-all shadow-sm"
              >
                + Add Day
              </button>
            </div>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6">
            <h2 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Itinerary Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-brown mb-1">Company Name</label>
                  <input
                    type="text"
                    value={itinerarySettings.companyName}
                    onChange={e => setItinerarySettings({...itinerarySettings, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    placeholder="CollEco Travel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-brown mb-1">Tagline</label>
                  <input
                    type="text"
                    value={itinerarySettings.tagline}
                    onChange={e => setItinerarySettings({...itinerarySettings, tagline: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    placeholder="The Odyssey of Adventure"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-brown mb-1">Website</label>
                  <input
                    type="text"
                    value={itinerarySettings.website}
                    onChange={e => setItinerarySettings({...itinerarySettings, website: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    placeholder="www.travelcolleco.com"
                  />
                </div>
              </div>
              
              {/* Right Column - Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-brand-brown mb-1">Company Logo</label>
                <div className="border-2 border-dashed border-cream-border rounded-lg p-4 text-center">
                  {itinerarySettings.logo ? (
                    <div className="space-y-3">
                      <img 
                        src={itinerarySettings.logo} 
                        alt="Company logo" 
                        className="h-24 w-auto mx-auto object-contain"
                      />
                      <button
                        onClick={() => setItinerarySettings({...itinerarySettings, logo: null})}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-4xl opacity-30">🖼️</div>
                      <input
                        type="file"
                        id="itineraryLogoUpload"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!file.type.startsWith('image/')) {
                            alert('Please upload an image file');
                            return;
                          }
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image must be less than 2MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const dataUrl = evt.target?.result;
                            if (dataUrl && typeof dataUrl === 'string') {
                              setItinerarySettings({...itinerarySettings, logo: dataUrl});
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="itineraryLogoUpload"
                        className="inline-block px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition-colors cursor-pointer"
                      >
                        📤 Upload Logo
                      </label>
                      <p className="text-xs text-brand-russty">Max 2MB • PNG, JPG, SVG</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search itinerary..."
            className="w-full sm:w-96 px-4 py-2 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
          {search && (
            <p className="mt-2 text-sm text-brand-russty">
              Showing results for &quot;{search}&quot; · <button onClick={() => setSearch("")} className="underline hover:no-underline text-brand-orange">Clear</button>
            </p>
          )}
        </div>

        {/* Workflow */}
        <div className="mb-6">
          <WorkflowPanel 
            currentPage="itinerary" 
            basketCount={basket.length}
            hasItinerary={Object.keys(trip.days).length > 0}
          />
        </div>

        {/* Progress & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <LiveTripProgress steps={computeProgress(trip, linkQuotes ? basket.length : 0)} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-cream-border shadow-sm p-6">
              {dayKeys.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mb-4 text-6xl opacity-20">📅</div>
                  <p className="text-brand-brown font-semibold mb-2">No itinerary items yet</p>
                  <p className="text-sm text-brand-russty mb-4">
                    {linkQuotes ? 'Add products to your basket on Trip Planner to get started.' : 'Click "Add Day" to create your first day.'}
                  </p>
                  <button
                    onClick={addDay}
                    className="px-6 py-3 bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-highlight transition-all shadow-sm hover:shadow-md"
                  >
                    + Create First Day
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {dayKeys.map((day) => (
                    <div key={day} className="border-2 border-cream-border rounded-xl p-5 bg-gradient-to-br from-white to-cream/10">
                      <ItineraryDay day={day}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-brand-brown">Day {day}</h3>
                          <span className="text-sm text-brand-russty bg-cream-sand px-3 py-1 rounded-full font-semibold">
                            {(filteredDays[day] || []).length} {(filteredDays[day] || []).length === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {(filteredDays[day] || []).map((item, idx) => (
                            <div key={item.id || idx} className="relative group">
                              <ExperienceCard 
                                title={item.title} 
                                subtitle={item.subtitle} 
                                time={item.time} 
                              />
                              {item._basketSource && (
                                <span className="absolute left-2 top-2 text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                  From Basket
                                </span>
                              )}
                              <button
                                onClick={() => removeItem(day, item.id)}
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Memory Notes */}
                        <div className="mt-4">
                          <MemoryNote
                            day={day}
                            value={trip.memories?.[day] || ''}
                            onChange={(val) => setMemory(trip, setTrip, day, val)}
                            placeholder="Add notes or memories for this day..."
                          />
                        </div>
                      </ItineraryDay>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
