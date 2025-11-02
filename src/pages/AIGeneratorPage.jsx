import React, { useEffect } from 'react';
import AIGeneratorPanel from '../components/AIGeneratorPanel.jsx';

export default function AIGeneratorPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Trip Assist | CollEco Travel';
    return () => { document.title = prev; };
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AIGeneratorPanel />
    </div>
  );
}
