import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function SingleTimePicker({ value, onChange, label, required, error, className = '' }) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const pickerRef = useRef(null);

  // Parse value prop (HH:MM format)
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const handleTimeSelect = (hour, minute) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    const timeString = `${hour}:${minute}`;
    onChange(timeString);
    // Auto-close after selection
    setTimeout(() => setShowPicker(false), 150);
  };

  const formatTime = (hour, minute) => {
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const displayTime = value ? formatTime(selectedHour, selectedMinute) : '';

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-semibold text-brand-brown">
          {label} {required && '*'}
        </label>
      )}
      
      {/* Display input */}
      <div 
        onClick={() => setShowPicker(!showPicker)}
        className={`w-full border-2 ${
          showPicker 
            ? 'border-brand-orange shadow-md' 
            : error 
              ? 'border-red-500' 
              : 'border-cream-border'
        } rounded-xl px-4 py-2.5 cursor-pointer flex items-center justify-between transition-all duration-200 bg-white hover:border-brand-orange/50 hover:shadow-sm`}
      >
        <span className={`text-sm font-medium ${
          value ? 'text-brand-brown' : 'text-gray-400'
        }`}>
          {displayTime || 'Select time'}
        </span>
        <Clock className={`w-5 h-5 transition-colors ${
          showPicker ? 'text-brand-orange' : 'text-brand-brown/60'
        }`} />
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Time picker modal */}
      {showPicker && (
        <>
          {/* Modal backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 animate-fadeIn"
            onClick={() => setShowPicker(false)}
          />
          
          {/* Time picker popup */}
          <div 
            ref={pickerRef}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border-2 border-brand-orange/20 rounded-xl shadow-2xl p-4 animate-fadeIn w-[90vw] max-w-[400px]"
            style={{ 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <h3 className="text-lg font-bold text-brand-brown mb-4 text-center">Select Time</h3>
            
            {/* Time Display */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-brand-orange">
                {formatTime(selectedHour, selectedMinute)}
              </div>
              <div className="text-sm text-gray-600 mt-1">24-hour format: {selectedHour}:{selectedMinute}</div>
            </div>

            {/* Time Selection Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Hours */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 text-center">Hour</label>
                <div className="max-h-48 overflow-y-auto border border-cream-border rounded-lg p-2 bg-cream-sand">
                  <div className="grid grid-cols-3 gap-1">
                    {hours.map(hour => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleTimeSelect(hour, selectedMinute)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          hour === selectedHour
                            ? 'bg-brand-orange text-white shadow-md'
                            : 'bg-white text-brand-brown hover:bg-brand-orange/10'
                        }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Minutes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 text-center">Minute</label>
                <div className="border border-cream-border rounded-lg p-2 bg-cream-sand">
                  <div className="grid grid-cols-2 gap-2">
                    {minutes.map(minute => (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => handleTimeSelect(selectedHour, minute)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          minute === selectedMinute
                            ? 'bg-brand-orange text-white shadow-md'
                            : 'bg-white text-brand-brown hover:bg-brand-orange/10'
                        }`}
                      >
                        {minute}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Time Buttons */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Quick Select</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleTimeSelect('09', '00')}
                  className="px-3 py-2 bg-cream border border-cream-border rounded-lg text-xs font-medium text-brand-brown hover:bg-brand-orange hover:text-white transition-all"
                >
                  9 AM
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeSelect('12', '00')}
                  className="px-3 py-2 bg-cream border border-cream-border rounded-lg text-xs font-medium text-brand-brown hover:bg-brand-orange hover:text-white transition-all"
                >
                  12 PM
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeSelect('15', '00')}
                  className="px-3 py-2 bg-cream border border-cream-border rounded-lg text-xs font-medium text-brand-brown hover:bg-brand-orange hover:text-white transition-all"
                >
                  3 PM
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeSelect('18', '00')}
                  className="px-3 py-2 bg-cream border border-cream-border rounded-lg text-xs font-medium text-brand-brown hover:bg-brand-orange hover:text-white transition-all"
                >
                  6 PM
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-cream-border">
              <button
                type="button"
                onClick={() => {
                  setSelectedHour('09');
                  setSelectedMinute('00');
                  onChange('');
                  setShowPicker(false);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-orange text-white hover:bg-brand-highlight shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
