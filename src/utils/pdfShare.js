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
    // Check if Web Share API is available and supports files
    if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], filename)] })) {
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      await navigator.share({
        title: title,
        text: `Shared from CollEco Travel`,
        files: [file]
      });
      
      return { success: true, method: 'share-api' };
    } else if (navigator.share) {
      // Share API available but doesn't support files - share URL instead
      // Create temporary blob URL
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      await navigator.share({
        title: title,
        text: `Shared from CollEco Travel - ${filename}`,
        url: blobUrl
      });
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      
      return { success: true, method: 'share-url' };
    } else {
      // Fallback to download
      downloadPdfBlob(pdfBlob, filename);
      return { success: true, method: 'download' };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // User cancelled the share
      return { success: false, method: 'cancelled' };
    }
    
    console.error('[pdfShare] Share failed:', error);
    // Fallback to download on error
    downloadPdfBlob(pdfBlob, filename);
    return { success: true, method: 'download-fallback' };
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
    // Generate the invoice PDF
    // generateInvoicePdf currently auto-saves, need to get blob
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]);
    
    const { generateInvoicePdfBlob } = await import('./pdfGenerators');
    const pdfBlob = await generateInvoicePdfBlob(invoiceData);
    
    const invoiceNum = invoiceData.invoiceNumber || invoiceData.number || invoiceData.id || Date.now();
    const filename = `Invoice_${invoiceNum}.pdf`;
    
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
