import React, { useMemo } from 'react';

export default function MiniItineraryPreview({ basket }) {
  // Group basket items by day
  const days = useMemo(() => {
    const grouped = {};
    basket.forEach(item => {
      const day = item.day || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item);
    });
    
    // Sort items within each day by time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2, 'Flexible': 3 };
        return (timeOrder[a.time] || 99) - (timeOrder[b.time] || 99);
      });
    });
    
    return grouped;
  }, [basket]);
  
  const sortedDays = useMemo(() => 
    Object.keys(days).sort((a, b) => Number(a) - Number(b)),
    [days]
  );
  
  if (basket.length === 0) {
    return (
      <div className="text-xs text-brand-russty/60 italic p-3 bg-cream-sand/50 rounded border border-dashed border-cream-border">
        Add items to see your itinerary preview
      </div>
    );
  }
  
  const timeIcon = {
    'Morning': '🌅',
    'Afternoon': '☀️',
    'Evening': '🌙',
    'Flexible': '⏰'
  };
  
  const categoryIcon = {
    'Lodging': '🏨',
    'Accommodation': '🏨',
    'Activity': '🎯',
    'Tour': '🗺️',
    'Experience': '✨',
    'Dining': '🍽️',
    'Transport': '🚗',
    'Flight': '✈️',
    'Default': '📌'
  };
  
  return (
    <div className="rounded border border-cream-border bg-white/50 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-orange to-brand-gold text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
        <span>📅</span>
        <span>Itinerary Preview</span>
      </div>
      
      <div className="max-h-96 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {sortedDays.map(day => (
          <div key={day} className="bg-cream-sand/30 rounded-lg p-2 border border-cream-border">
            <div className="text-xs font-bold text-brand-brown mb-2 flex items-center gap-1">
              <span className="bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{day}</span>
              <span>Day {day}</span>
              <span className="text-[10px] text-brand-russty/60 font-normal">({days[day].length} item{days[day].length > 1 ? 's' : ''})</span>
            </div>
            
            <div className="space-y-1.5">
              {days[day].map((item, _idx) => (
                <div key={item.id} className="bg-white rounded border border-cream-border p-2 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm flex-shrink-0">
                      {categoryIcon[item.category] || categoryIcon.Default}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-brand-brown truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-brand-russty/70 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          {timeIcon[item.time] || timeIcon.Flexible}
                          {item.time || 'Flexible'}
                        </span>
                        {item.quantity > 1 && (
                          <span>• x{item.quantity}</span>
                        )}
                        {item.price > 0 && (
                          <span>• R{item.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-cream-sand/50 px-3 py-2 text-[10px] text-brand-russty/70 border-t border-cream-border flex items-center justify-between">
        <span>{basket.length} item{basket.length > 1 ? 's' : ''} across {sortedDays.length} day{sortedDays.length > 1 ? 's' : ''}</span>
        <a href="/itinerary" className="text-brand-orange hover:underline font-semibold">View Full →</a>
      </div>
    </div>
  );
}
