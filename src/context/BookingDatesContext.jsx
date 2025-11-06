import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const STORAGE_KEY = 'colleco.bookingDates.v1';

function formatDateYMD(d){
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYMD(s){
  try { const p = s.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); } catch(e){ return new Date(); }
}

const BookingDatesContext = createContext(null);

export function BookingDatesProvider({ children }){
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const today = new Date();
    return { startDate: formatDateYMD(today), nights: 1 };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const setStartDate = (sd) => setState(s => ({ ...s, startDate: sd }));
  const setNights = (n) => setState(s => ({ ...s, nights: Number(n || 0) }));

  const computeEndDate = useCallback((sd, nights) => {
    const s = sd || state.startDate;
    const n = (nights === undefined || nights === null) ? state.nights : nights;
    try {
      const d = parseYMD(s);
      d.setDate(d.getDate() + Number(n || 0));
      return formatDateYMD(d);
    } catch (e) { return s; }
  }, [state.startDate, state.nights]);

  const endDate = useMemo(() => computeEndDate(state.startDate, state.nights), [state.startDate, state.nights, computeEndDate]);

  const value = {
    startDate: state.startDate,
    nights: state.nights,
    endDate,
    setStartDate,
    setNights,
    computeEndDate,
  };

  return (
    <BookingDatesContext.Provider value={value}>
      {children}
    </BookingDatesContext.Provider>
  );
}

export function useBookingDates(){
  const ctx = useContext(BookingDatesContext);
  if (!ctx) throw new Error('useBookingDates must be used within BookingDatesProvider');
  return ctx;
}
