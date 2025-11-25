import React, { useMemo, useState, useEffect } from 'react';
import ItineraryDay from "../components/ui/ItineraryDay";
import ExperienceCard from "../components/ui/ExperienceCard";
import MemoryNote from "../components/ui/MemoryNote";
import LiveTripProgress from "../components/ui/LiveTripProgress";
import jsPDF from "jspdf";
import { useTripState, setMemory, computeProgress } from "../utils/useTripState";
import { useBasketState } from "../utils/useBasketState";
import { useLocalStorageState } from "../useLocalStorageState";
import WorkflowPanel from "../components/WorkflowPanel";
import Button from '../components/ui/Button.jsx';

export default function Itinerary() {
  const [trip, setTrip] = useTripState();
  const [linkQuotes] = useLocalStorageState('basketAutoSync:v1', true);
  const { basket, updateDay: _updateBasketDay, removeFromBasket } = useBasketState(); // _updateBasketDay unused (legacy API)
  const [search, setSearch] = useState("");

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

  // Remove item from itinerary
  function removeItem(day, itemId) {
    setTrip(prev => {
      const dayItems = (prev.days[day] || []).filter(it => it.id !== itemId);
      const item = (prev.days[day] || []).find(it => it.id === itemId);
      
      // If it's a basket item, also remove from basket
      if (item?._basketSource) {
        removeFromBasket(itemId);
      }
      
      return { ...prev, days: { ...prev.days, [day]: dayItems } };
    });
  }

  // Add empty day
  function addDay() {
    const existing = Object.keys(trip.days || {}).map(n => Number(n)).filter(n => Number.isFinite(n) && n > 0);
    const next = existing.length ? Math.max(...existing) + 1 : 1;
    setTrip(prev => ({ ...prev, days: { ...prev.days, [String(next)]: [] } }));
  }

  // Export to PDF
  function handleExport() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Your CollEco Itinerary", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
    
    let y = 40;
    const days = Object.keys(trip.days).sort((a, b) => Number(a) - Number(b));
    
    days.forEach((d) => {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(`Day ${d}`, 14, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      
      (trip.days[d] || []).forEach((item) => {
        const text = `• ${item.title}${item.subtitle ? " — " + item.subtitle : ""}`;
        const lines = doc.splitTextToSize(text, 180);
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 20;
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
            y = 20;
          }
          doc.text(line, 18, y);
          y += 6;
        });
        doc.setFont(undefined, "normal");
      }
      
      y += 6;
    });
    
    doc.save("itinerary.pdf");
  }

  const dayKeys = Object.keys(filteredDays).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="w-full min-h-screen bg-cream overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-brown mb-2">✈️ Trip Itinerary</h1>
            <p className="text-brand-russty text-sm sm:text-base">Plan each day and capture memories</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport}>📄 Export PDF</Button>
            <Button variant="secondary" onClick={addDay}>+ Add Day</Button>
          </div>
        </div>

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
                  <Button size="lg" onClick={addDay}>+ Create First Day</Button>
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
                              <Button
                                onClick={() => removeItem(day, item.id)}
                                variant="danger"
                                size="xs"
                                className="absolute right-2 top-2 w-6 h-6 !p-0"
                                title="Remove item"
                              >✕</Button>
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
