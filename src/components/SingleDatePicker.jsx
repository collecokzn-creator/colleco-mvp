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
        className={`w-full border-2 ${error ? 'border-red-500' : 'border-cream-border'} rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between focus-within:border-brand-orange transition-colors bg-white hover:bg-cream/30`}
      >
        <span className={selectedDate ? 'text-brand-brown' : 'text-gray-400'}>
          {formattedDate || 'Select date'}
        </span>
        <Calendar className="w-5 h-5 text-brand-brown/60" />
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Dropdown calendar picker */}
      {showPicker && (
        <div 
          ref={pickerRef}
          className="absolute z-50 mt-2 bg-white border-2 border-cream-border rounded-lg shadow-lg p-3"
          style={{ minWidth: '280px' }}
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
          
          <div className="flex gap-2 mt-2 border-t pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                onChange('');
                setShowPicker(false);
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded border border-gray-300 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="flex-1 px-3 py-1.5 text-xs rounded bg-brand-orange text-white hover:bg-brand-highlight"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
