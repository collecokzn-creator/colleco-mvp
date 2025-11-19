import React, { useEffect, useState } from 'react';
import globePng from '../assets/Globeicon.png';
import logoPng from '../assets/colleco-logo.png';

export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Show splash for 3 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade animation to complete before calling onComplete
      setTimeout(onComplete, 500);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div 
      className={`fixed inset-0 z-[100] bg-gradient-to-br from-cream via-cream-sand to-cream flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {/* Globe with orange border */}
      <div className="relative">
        {/* Spinning orange ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-4 border-transparent border-t-brand-orange border-r-brand-orange animate-spin-slow" 
               style={{ animationDuration: '3s' }}></div>
        </div>
        
        {/* Globe image */}
        <div className="relative z-10 w-48 h-48 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl border-4 border-brand-orange/20">
          <img
            src={globePng}
            alt="CollEco Globe"
            className="w-40 h-40 object-contain animate-pulse-gentle"
            width={160}
            height={160}
          />
        </div>
        
        {/* Flying bird logo - starts from left, flies across the globe */}
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          <img
            src={logoPng}
            alt="CollEco Bird"
            className="absolute w-16 h-16 object-contain animate-bird-fly"
            width={64}
            height={64}
            style={{ 
              left: '-100px',
              animation: 'birdFly 2s ease-in-out infinite'
            }}
          />
        </div>
      </div>
      
      {/* Brand text */}
      <div className="absolute bottom-32 left-0 right-0 text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <h1 className="text-3xl font-bold text-brand-orange mb-2">CollEco Travel</h1>
        <p className="text-sm text-brand-brown italic" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
          The Odyssey of Adventure
        </p>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        @keyframes birdFly {
          0% { 
            left: -100px; 
            transform: translateY(0) rotate(-15deg);
          }
          25% {
            transform: translateY(-20px) rotate(-5deg);
          }
          50% { 
            left: calc(50% - 32px);
            transform: translateY(-30px) rotate(0deg);
          }
          75% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% { 
            left: calc(100% + 100px);
            transform: translateY(0) rotate(15deg);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        
        .animate-bird-fly {
          animation: birdFly 2s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
