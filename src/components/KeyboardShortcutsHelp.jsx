import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Keyboard Shortcuts Help Panel
 * Shows context-aware keyboard shortcuts based on current page
 * Triggered by pressing '?' key globally
 */
export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Global keyboard listener for '?' key
  useEffect(() => {
    function handleKey(e) {
      // Ignore if typing in input/textarea
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    }
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Determine shortcuts based on current page
  const getShortcuts = () => {
    const path = location.pathname;
    const common = [
      { keys: ['?'], description: 'Show/hide this help' },
      { keys: ['Esc'], description: 'Close modal or panel' },
    ];

    if (path === '/plan-trip' || path === '/plan') {
      return [
        ...common,
        { keys: ['/'], description: 'Focus search bar' },
        { keys: ['Enter'], description: 'Apply smart search' },
        { keys: ['Esc'], description: 'Clear search (when focused)' },
      ];
    }

    if (path === '/itinerary') {
      return [
        ...common,
        { keys: ['Ctrl', 'Z'], description: 'Undo last change', mac: ['⌘', 'Z'] },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo', mac: ['⌘', 'Shift', 'Z'] },
        { keys: ['Ctrl', 'S'], description: 'Save (auto-save active)', mac: ['⌘', 'S'] },
      ];
    }

    if (path === '/ai' || path.includes('assist')) {
      return [
        ...common,
        { keys: ['Enter'], description: 'Submit prompt (Shift+Enter for new line)' },
      ];
    }

    return common;
  };

  const shortcuts = getShortcuts();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-2 bg-brand-brown text-white rounded-full shadow-lg hover:bg-brand-brown/90 transition opacity-60 hover:opacity-100"
        title="Keyboard shortcuts (press ?)"
        aria-label="Show keyboard shortcuts"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-brand-brown"
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-xl font-bold">
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-brand-brown/60 hover:text-brand-brown"
            aria-label="Close shortcuts help"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, idx) => {
            const keys = isMac && shortcut.mac ? shortcut.mac : shortcut.keys;
            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-sm text-brand-brown/80">{shortcut.description}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {keys.map((key, kidx) => (
                    <React.Fragment key={kidx}>
                      <kbd className="px-2 py-1 bg-cream-sand border border-cream-border rounded text-xs font-mono">
                        {key}
                      </kbd>
                      {kidx < keys.length - 1 && <span className="text-brand-brown/40">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-cream-border text-xs text-brand-brown/60">
          <p>💡 Press <kbd className="px-1 py-0.5 bg-cream-sand border border-cream-border rounded font-mono">?</kbd> anytime to toggle this help</p>
        </div>
      </div>
    </div>
  );
}
