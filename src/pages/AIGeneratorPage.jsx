import React, { useEffect } from 'react';
import AIGeneratorPanel from '../components/AIGeneratorPanel.jsx';

export default function AIGeneratorPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Trip Assist | CollEco Travel';
    return () => { document.title = prev; };
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <AIGeneratorPanel />
    </div>
  );
}
