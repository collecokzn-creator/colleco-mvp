import React, { useState } from 'react';

/**
 * PdfShareButtons Component
 * 
 * Provides share, download, and print buttons for PDF documents
 * Works with quotations, itineraries, booking confirmations, and invoices
 * 
 * Brand Colors: Orange (#F47C20), Brown (#3A2C1A), Gold (#E6B422), 
 *               Cream (#FFF8F1), White (#FFFFFF)
 *               Green (#4A7C59) - optional natural accent (use sparingly)
 * 
 * Props:
 * - onShare: async function() - Called when share button is clicked
 * - onDownload: async function() - Called when download button is clicked
 * - onPrint: async function() - Called when print button is clicked
 * - disabled: boolean - Disable all buttons
 * - compact: boolean - Show icon-only compact version
 */
export default function PdfShareButtons({ 
  onShare, 
  onDownload, 
  onPrint, 
  disabled = false,
  compact = false 
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleShare = async () => {
    if (!onShare || isSharing) return;
    
    setIsSharing(true);
    setMessage(null);
    
    try {
      const result = await onShare();
      
      if (result.success) {
        if (result.method === 'share-api') {
          setMessage({ type: 'success', text: 'Shared successfully!' });
        } else if (result.method === 'download' || result.method === 'download-fallback') {
          setMessage({ type: 'info', text: 'Downloaded to your device' });
        }
      } else if (result.method !== 'cancelled') {
        setMessage({ type: 'error', text: 'Share failed. Please try download instead.' });
      }
    } catch (error) {
      console.error('[PdfShareButtons] Share error:', error);
      setMessage({ type: 'error', text: 'Share failed' });
    } finally {
      setIsSharing(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDownload = async () => {
    if (!onDownload || isDownloading) return;
    
    setIsDownloading(true);
    setMessage(null);
    
    try {
      const result = await onDownload();
      if (result.success) {
        setMessage({ type: 'success', text: 'Downloaded successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Download failed' });
      }
    } catch (error) {
      console.error('[PdfShareButtons] Download error:', error);
      setMessage({ type: 'error', text: 'Download failed' });
    } finally {
      setIsDownloading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handlePrint = async () => {
    if (!onPrint || isPrinting) return;
    
    setIsPrinting(true);
    setMessage(null);
    
    try {
      const result = await onPrint();
      if (result.success) {
        setMessage({ type: 'success', text: 'Print dialog opened' });
      } else {
        setMessage({ type: 'error', text: 'Print failed' });
      }
    } catch (error) {
      console.error('[PdfShareButtons] Print error:', error);
      setMessage({ type: 'error', text: 'Print failed' });
    } finally {
      setIsPrinting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Brand-styled buttons with responsive design
  const baseButtonClass = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const shareButtonClass = compact
    ? `${baseButtonClass} p-2 bg-gradient-to-r from-brand-orange to-[#ff9a4d] text-white hover:shadow-lg hover:scale-105`
    : `${baseButtonClass} bg-gradient-to-r from-brand-orange to-[#ff9a4d] text-white hover:shadow-lg hover:scale-105 focus:ring-brand-orange`;
  
  const downloadButtonClass = compact
    ? `${baseButtonClass} p-2 bg-white border-2 border-brand-orange text-brand-orange hover:bg-cream hover:shadow-md`
    : `${baseButtonClass} bg-white border-2 border-brand-orange text-brand-orange hover:bg-cream hover:shadow-md focus:ring-brand-orange`;
  
  const printButtonClass = compact
    ? `${baseButtonClass} p-2 bg-brand-brown text-white hover:bg-opacity-90 hover:shadow-md`
    : `${baseButtonClass} bg-brand-brown text-white hover:bg-opacity-90 hover:shadow-md focus:ring-brand-brown`;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {/* Share Button */}
      {onShare && (
        <button
          onClick={handleShare}
          disabled={disabled || isSharing}
          className={shareButtonClass}
          title="Share document via WhatsApp, Email, etc."
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {!compact && <span className="text-sm font-semibold">{isSharing ? 'Sharing...' : 'Share'}</span>}
        </button>
      )}

      {/* Download Button */}
      {onDownload && (
        <button
          onClick={handleDownload}
          disabled={disabled || isDownloading}
          className={downloadButtonClass}
          title="Download PDF to your device"
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {!compact && <span className="text-sm font-semibold">{isDownloading ? 'Downloading...' : 'Download'}</span>}
        </button>
      )}

      {/* Print Button */}
      {onPrint && (
        <button
          onClick={handlePrint}
          disabled={disabled || isPrinting}
          className={printButtonClass}
          title="Print document"
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {!compact && <span className="text-sm font-semibold">{isPrinting ? 'Printing...' : 'Print'}</span>}
        </button>
      )}

      {/* Status Message - Full width on mobile, inline on desktop */}
      {message && (
        <div className={`text-sm px-4 py-2 rounded-lg font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
