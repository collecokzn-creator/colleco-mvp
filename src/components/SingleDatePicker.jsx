import React, { useEffect, useState, useRef } from 'react';
import 'react-day-picker/dist/style.css';
import { Calendar } from 'lucide-react';

export default function SingleDatePicker({ value, onChange, min, label, required, error, className = '' }) {
  const [showPicker, setShowPicker] = useState(false);
  const [DayPickerComp, setDayPickerComp] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const pickerRef = useRef(null);

  // Parse value prop to Date object
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Lazy-load react-day-picker component
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('react-day-picker');
        if (!mounted) return;
        const Comp = mod.DayPicker || (mod.default && mod.default.DayPicker) || null;
        setDayPickerComp(() => Comp);
      } catch (e) {
        if (mounted) setDayPickerComp(null);
      }
    })();
    return () => { mounted = false };
  }, []);

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

  // Handle date selection - auto-apply and close
  const handleSelect = (date) => {
    if (date) {
      const isoDate = date.toISOString().slice(0, 10);
      setSelectedDate(date);
      onChange(isoDate);
      // Auto-close after selection
      setTimeout(() => setShowPicker(false), 150);
    }
  };

  const formattedDate = selectedDate ? selectedDate.toLocaleDateString('en-ZA', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }) : '';

  const minDate = min ? new Date(min) : undefined;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block mb-2 text-sm font-semibold text-brand-brown">
          {label} {required && '*'}
        </label>
      )}
      
      {/* Display input with calendar icon */}
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
          selectedDate ? 'text-brand-brown' : 'text-gray-400'
        }`}>
          {formattedDate || 'Select date'}
        </span>
        <Calendar className={`w-5 h-5 transition-colors ${
          showPicker ? 'text-brand-orange' : 'text-brand-brown/60'
        }`} />
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Dropdown calendar picker */}
      {showPicker && (
        <div 
          ref={pickerRef}
          className="absolute z-50 mt-2 bg-white border-2 border-brand-orange/20 rounded-xl shadow-2xl p-4 animate-fadeIn"
          style={{ 
            minWidth: '320px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {DayPickerComp ? (
            React.createElement(DayPickerComp, {
              mode: 'single',
              selected: selectedDate,
              onSelect: handleSelect,
              disabled: minDate ? { before: minDate } : undefined,
              defaultMonth: selectedDate || minDate || new Date(),
              className: 'rdp-custom'
            })
          ) : (
            // Fallback to native date input if react-day-picker fails to load
            <input
              type="date"
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value);
                setShowPicker(false);
              }}
              min={min}
              className="w-full border rounded px-2 py-1"
            />
          )}
          
          <div className="flex gap-2 mt-3 pt-3 border-t border-cream-border">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
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
      )}
    </div>
  );
}
