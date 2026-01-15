/**
 * PDF Sharing Utility
 * 
 * Provides comprehensive sharing functionality for all PDF documents:
 * - Quotations
 * - Itineraries
 * - Booking Confirmations
 * - Invoices
 * 
 * Features:
 * - Share as PDF file via Web Share API (WhatsApp, Email, etc.)
 * - Download PDF locally
 * - Print PDF
 * - Email PDF
 */

import { generateQuotePdf, generateItineraryPdf, generateInvoicePdf } from './pdfGenerators';

/**
 * Share a PDF document via Web Share API or fallback to download
 * @param {Blob} pdfBlob - The PDF blob to share
 * @param {string} filename - Suggested filename (e.g., 'Quote_12345.pdf')
 * @param {string} title - Share dialog title
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function sharePdfDocument(pdfBlob, filename, title = 'Share Document') {
  try {
    // Try to create a File object for sharing
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
    
    console.log('[sharePdfDocument] Attempting to share:', { filename, title, size: pdfBlob.size });
    console.log('[sharePdfDocument] navigator.share available:', !!navigator.share);
    console.log('[sharePdfDocument] navigator.canShare available:', !!navigator.canShare);
    
    // Check if we can share files
    const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });
    console.log('[sharePdfDocument] Can share files:', canShareFiles);
    
    // First, try Web Share API with files (best for mobile - shows WhatsApp, Gmail, etc.)
    if (navigator.share) {
      try {
        console.log('[sharePdfDocument] Calling navigator.share with file...');
        await navigator.share({
          title: title,
          text: `${title} from CollEco Travel`,
          files: [file]
        });
        
        console.log('[sharePdfDocument] Share successful via Web Share API');
        return { success: true, method: 'share-api' };
      } catch (shareError) {
        console.log('[sharePdfDocument] File share error:', shareError.name, shareError.message);
        
        // If user cancelled, return immediately
        if (shareError.name === 'AbortError') {
          return { success: false, method: 'cancelled' };
        }
        
        // If files not supported, try sharing with text only (less useful but better than nothing)
        if (shareError.name === 'NotAllowedError' || shareError.message.includes('files')) {
          console.log('[sharePdfDocument] Files not supported, falling back to download...');
          // Fall through to download
        }
      }
    }
    
    // Final fallback: Download the PDF
    // This works on all platforms (desktop and mobile)
    console.log('[sharePdfDocument] Using download fallback');
    downloadPdfBlob(pdfBlob, filename);
    return { success: true, method: 'download-fallback' };
    
  } catch (error) {
    console.error('[sharePdfDocument] Share failed:', error);
    // Fallback to download on error
    downloadPdfBlob(pdfBlob, filename);
    return { success: true, method: 'download-fallback' };
  }
}

/**
 * Email PDF via mailto link (opens default email client)
 * Note: This creates a download and opens email client with instructions
 * @param {Blob} pdfBlob - The PDF blob
 * @param {string} filename - PDF filename
 * @param {string} title - Email subject
 * @returns {Promise<{success: boolean, method: string}>}
 */
async function emailPdfViaMailto(pdfBlob, filename, title) {
  try {
    // Download the PDF first (browser limitation - can't attach to mailto)
    downloadPdfBlob(pdfBlob, filename);
    
    // Open email client with pre-filled subject and body
    const subject = encodeURIComponent(title || 'Document from CollEco Travel');
    const body = encodeURIComponent(
      `Please find the attached document: ${filename}\n\n` +
      `The PDF has been downloaded to your device. Please attach it to this email before sending.\n\n` +
      `Shared from CollEco Travel\nwww.collecotravel.com`
    );
    
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    return { success: true, method: 'email-mailto' };
  } catch (error) {
    console.error('[pdfShare] Email via mailto failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Download a PDF blob to the user's device
 * @param {Blob} pdfBlob - The PDF blob to download
 * @param {string} filename - Filename for the download
 */
export function downloadPdfBlob(pdfBlob, filename) {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the blob URL after download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Print a PDF blob
 * @param {Blob} pdfBlob - The PDF blob to print
 */
export async function printPdfBlob(pdfBlob) {
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  // Create hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = blobUrl;
  
  document.body.appendChild(iframe);
  
  // Wait for PDF to load, then print
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Clean up after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error('[pdfShare] Print failed:', error);
      document.body.removeChild(iframe);
      URL.revokeObjectURL(blobUrl);
    }
  };
}

/**
 * Convert data URI to Blob
 * @param {string} dataURI - Data URI string
 * @returns {Blob}
 */
export function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}

/**
 * Generate and share quotation PDF
 * @param {Object} quoteData - Quote data object
 * @param {string} action - 'share' | 'download' | 'print'
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function shareQuotePdf(quoteData, action = 'share') {
  try {
    // Generate the quotation PDF (returns data URI)
    const dataURI = await generateQuotePdf(quoteData);
    
    if (!dataURI) {
      throw new Error('Failed to generate quotation PDF');
    }
    
    // Convert to blob
    const pdfBlob = dataURItoBlob(dataURI);
    const filename = `Quote_${quoteData.quoteNumber || quoteData.id || Date.now()}.pdf`;
    
    // Perform requested action
    switch (action) {
      case 'print':
        await printPdfBlob(pdfBlob);
        return { success: true, method: 'print' };
      
      case 'download':
        downloadPdfBlob(pdfBlob, filename);
        return { success: true, method: 'download' };
      
      case 'share':
      default:
        return await sharePdfDocument(pdfBlob, filename, 'Share Quotation');
    }
  } catch (error) {
    console.error('[pdfShare] Quotation share failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate and share itinerary PDF
 * @param {string} name - Traveler name
 * @param {Array} items - Itinerary items
 * @param {string} ref - Booking reference
 * @param {string} action - 'share' | 'download' | 'print'
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function shareItineraryPdf(name, items, ref, action = 'share') {
  try {
    // Generate itinerary - need to modify generateItineraryPdf to return blob instead of auto-saving
    // For now, we'll create a wrapper that captures the PDF
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]);
    
    // Import and call the existing generator function logic
    // Since generateItineraryPdf calls doc.save(), we need to get the blob before that
    // We'll use the same logic but capture the output
    
    const { generateItineraryPdfBlob } = await import('./pdfGenerators');
    const pdfBlob = await generateItineraryPdfBlob(name, items, ref);
    
    const filename = `${(name || 'Itinerary').replace(/\s+/g, '_')}_Itinerary.pdf`;
    
    // Perform requested action
    switch (action) {
      case 'print':
        await printPdfBlob(pdfBlob);
        return { success: true, method: 'print' };
      
      case 'download':
        downloadPdfBlob(pdfBlob, filename);
        return { success: true, method: 'download' };
      
      case 'share':
      default:
        return await sharePdfDocument(pdfBlob, filename, 'Share Itinerary');
    }
  } catch (error) {
    console.error('[pdfShare] Itinerary share failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate and share invoice PDF
 * @param {Object} invoiceData - Invoice data object
 * @param {string} action - 'share' | 'download' | 'print'
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function shareInvoicePdf(invoiceData, action = 'share') {
  try {
    console.log('[shareInvoicePdf] Starting with action:', action, 'data:', invoiceData);
    
    // Generate the invoice PDF
    // generateInvoicePdf currently auto-saves, need to get blob
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]);
    
    console.log('[shareInvoicePdf] Importing generateInvoicePdfBlob...');
    const { generateInvoicePdfBlob } = await import('./pdfGenerators');
    
    console.log('[shareInvoicePdf] Generating PDF blob...');
    const pdfBlob = await generateInvoicePdfBlob(invoiceData);
    console.log('[shareInvoicePdf] PDF blob generated:', pdfBlob?.size, 'bytes');
    
    const invoiceNum = invoiceData.invoiceNumber || invoiceData.number || invoiceData.id || Date.now();
    const filename = `Invoice_${invoiceNum}.pdf`;
    console.log('[shareInvoicePdf] Filename:', filename);
    
    // Perform requested action
    switch (action) {
      case 'print':
        console.log('[shareInvoicePdf] Executing print action');
        await printPdfBlob(pdfBlob);
        return { success: true, method: 'print' };
      
      case 'download':
        console.log('[shareInvoicePdf] Executing download action');
        downloadPdfBlob(pdfBlob, filename);
        return { success: true, method: 'download' };
      
      case 'share':
      default:
        console.log('[shareInvoicePdf] Executing share action');
        return await sharePdfDocument(pdfBlob, filename, 'Share Invoice');
    }
  } catch (error) {
    console.error('[pdfShare] Invoice share failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate and share booking confirmation PDF
 * @param {Object} bookingData - Booking confirmation data
 * @param {string} action - 'share' | 'download' | 'print'
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function shareBookingConfirmationPdf(bookingData, action = 'share') {
  try {
    const [{ default: jsPDF }] = await Promise.all([import("jspdf")]);
    
    const { generateBookingConfirmationPdfBlob } = await import('./pdfGenerators');
    const pdfBlob = await generateBookingConfirmationPdfBlob(bookingData);
    
    const confirmationId = bookingData.confirmationId || bookingData.id || Date.now();
    const filename = `Booking_Confirmation_${confirmationId}.pdf`;
    
    // Perform requested action
    switch (action) {
      case 'print':
        await printPdfBlob(pdfBlob);
        return { success: true, method: 'print' };
      
      case 'download':
        downloadPdfBlob(pdfBlob, filename);
        return { success: true, method: 'download' };
      
      case 'share':
      default:
        return await sharePdfDocument(pdfBlob, filename, 'Share Booking Confirmation');
    }
  } catch (error) {
    console.error('[pdfShare] Booking confirmation share failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Email a PDF document via backend API
 * @param {Blob} pdfBlob - The PDF blob
 * @param {string} filename - PDF filename
 * @param {string} recipientEmail - Recipient email address
 * @param {Object} metadata - Additional metadata (subject, message, etc.)
 * @returns {Promise<{success: boolean}>}
 */
export async function emailPdfDocument(pdfBlob, filename, recipientEmail, metadata = {}) {
  try {
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
    
    const base64Data = await base64Promise;
    
    // Send to backend
    const response = await fetch('/api/sharing/send-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail,
        filename,
        pdfData: base64Data,
        subject: metadata.subject || `Your ${filename} from CollEco Travel`,
        message: metadata.message || 'Please find your document attached.'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[pdfShare] Email send failed:', error);
    return { success: false, error: error.message };
  }
}
