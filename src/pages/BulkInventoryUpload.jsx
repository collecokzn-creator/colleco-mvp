import React, { useState } from 'react';
import { BulkCSVUploader } from '../components/mvp/EnhancementStubs';

export default function BulkInventoryUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/inventory/bulk-upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Inventory Upload</h1>
      
      <div className="p-6 bg-white rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Upload Inventory CSV</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a CSV file with your inventory. Required columns: name, type, price, currency, availability
        </p>
        
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleUpload}
          disabled={uploading}
          className="border p-2 rounded w-full mb-4"
        />
        
        {uploading && <p className="text-blue-600">Uploading...</p>}
        
        {result && (
          <div className={`mt-4 p-4 rounded ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            {result.error ? (
              <p className="text-red-700">{result.error}</p>
            ) : (
              <>
                <p className="text-green-700 font-semibold">Upload successful!</p>
                <p className="text-sm">Processed: {result.processed || 0} items</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <h3 className="font-semibold mb-2">CSV Format Example</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`name,type,price,currency,availability
Deluxe Room,accommodation,1200,ZAR,10
Standard Room,accommodation,850,ZAR,20
SUV Rental,car,500,ZAR,5`}
        </pre>
      </div>
    </div>
  );
}
