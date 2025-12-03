import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, ExternalLink, Loader } from "lucide-react";

const REQUIRED_DOCUMENTS = [
  {
    id: "business_registration",
    label: "Business Registration Certificate",
    description: "CIPC registration or equivalent",
    required: true,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 5 // MB
  },
  {
    id: "tax_clearance",
    label: "Tax Clearance Certificate",
    description: "Valid tax compliance certificate",
    required: true,
    formats: [".pdf"],
    maxSize: 5
  },
  {
    id: "liability_insurance",
    label: "Public Liability Insurance",
    description: "Minimum R5M coverage",
    required: true,
    formats: [".pdf"],
    maxSize: 5
  },
  {
    id: "trade_license",
    label: "Trade License / Tourism Registration",
    description: "e.g., SATSA, TGCSA, or relevant authority",
    required: false,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 5
  },
  {
    id: "banking_details",
    label: "Banking Details",
    description: "Proof of banking (bank letter or cancelled cheque)",
    required: true,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 3
  },
  {
    id: "id_document",
    label: "ID/Passport of Director/Owner",
    description: "Valid identification document",
    required: true,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 3
  },
  {
    id: "bbbee_certificate",
    label: "B-BBEE Certificate",
    description: "South African partners (if applicable)",
    required: false,
    formats: [".pdf"],
    maxSize: 3
  }
];

export default function PartnerVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = location.state?.applicationId || localStorage.getItem('colleco.partner.applicationId');

  // Accommodation selection state
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const scrollContainerRef = useRef(null);

  // Document upload state
  const [documents, setDocuments] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    // Fetch accommodation properties for selection
    fetch('/api/accommodation/available-properties')
      .then(res => res.json())
      .then(data => setProperties(data.properties || []));

    if (!applicationId) {
      navigate('/partner/onboarding');
      return;
    }

    // Fetch existing application status and documents
    fetchApplicationStatus();
  }, [applicationId]);

  const fetchApplicationStatus = async () => {
    try {
      const response = await fetch(`/api/partners/${applicationId}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      setApplicationStatus(data);
      
      // Pre-populate uploaded documents
      if (data.documents) {
        const docMap = {};
        data.documents.forEach(doc => {
          docMap[doc.type] = {
            file: null,
            uploaded: true,
            url: doc.url,
            uploadedAt: doc.uploadedAt,
            status: doc.status
          };
        });
        setDocuments(docMap);
      }
    } catch (error) {
      console.error('Status fetch error:', error);
    }
  };

  const validateFile = (file, docConfig) => {
    const errors = [];

    // Check file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!docConfig.formats.includes(fileExt)) {
      errors.push(`Invalid format. Accepted: ${docConfig.formats.join(', ')}`);
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > docConfig.maxSize) {
      errors.push(`File too large. Maximum: ${docConfig.maxSize}MB`);
    }

    return errors;
  };

  const handleFileSelect = (docId, file) => {
    const docConfig = REQUIRED_DOCUMENTS.find(d => d.id === docId);
    const validationErrors = validateFile(file, docConfig);

    if (validationErrors.length > 0) {
      setErrors(prev => ({ ...prev, [docId]: validationErrors.join('. ') }));
      return;
    }

    setErrors(prev => ({ ...prev, [docId]: null }));
    setDocuments(prev => ({
      ...prev,
      [docId]: { file, uploaded: false, status: 'pending' }
    }));
  };

  const uploadDocument = async (docId) => {
    const doc = documents[docId];
    if (!doc || !doc.file || doc.uploaded) return;

    setUploadProgress(prev => ({ ...prev, [docId]: 0 }));

    const formData = new FormData();
    formData.append('document', doc.file);
    formData.append('type', docId);
    formData.append('applicationId', applicationId);

    try {
      const response = await fetch(`/api/partners/${applicationId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();

      setDocuments(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          uploaded: true,
          url: result.url,
          uploadedAt: result.uploadedAt,
          status: 'pending_review'
        }
      }));

      setUploadProgress(prev => ({ ...prev, [docId]: 100 }));
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, [docId]: 'Upload failed. Please try again.' }));
      setUploadProgress(prev => ({ ...prev, [docId]: null }));
    }
  };

  const handleSubmitForReview = async () => {
    // Validate all required documents are uploaded
    const missingDocs = REQUIRED_DOCUMENTS
      .filter(doc => doc.required)
      .filter(doc => !documents[doc.id]?.uploaded);

    if (missingDocs.length > 0) {
      setErrors({
        submit: `Please upload all required documents: ${missingDocs.map(d => d.label).join(', ')}`
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/partners/${applicationId}/submit-for-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Submission failed');

      // Navigate to status page
      navigate('/partner/application-status', { 
        state: { applicationId, message: 'Application submitted successfully!' }
      });
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'Failed to submit for review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentCard = (docConfig) => {
    const doc = documents[docConfig.id];
    const progress = uploadProgress[docConfig.id];
    const error = errors[docConfig.id];

    return (
      <div key={docConfig.id} className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-brand-orange transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-brand-brown" />
              <h3 className="font-semibold text-brand-brown">
                {docConfig.label}
                {docConfig.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
            </div>
            <p className="text-sm text-gray-600">{docConfig.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Formats: {docConfig.formats.join(', ')} | Max: {docConfig.maxSize}MB
            </p>
          </div>

          {doc?.uploaded && (
            <div className="flex items-center gap-2">
              {doc.status === 'approved' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              {doc.status === 'rejected' && <XCircle className="w-6 h-6 text-red-500" />}
              {doc.status === 'pending_review' && <AlertCircle className="w-6 h-6 text-yellow-500" />}
            </div>
          )}
        </div>

        {doc?.uploaded ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-green-700">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
            {doc.url && (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-orange text-sm hover:underline"
              >
                View Document
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {doc.status === 'rejected' && doc.rejectionReason && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700 font-semibold">Rejected:</p>
                <p className="text-sm text-red-600">{doc.rejectionReason}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-orange transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {doc?.file ? doc.file.name : 'Choose file...'}
                  </span>
                </div>
                <input
                  type="file"
                  accept={docConfig.formats.join(',')}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileSelect(docConfig.id, e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {doc?.file && !doc.uploaded && (
                <button
                  onClick={() => uploadDocument(docConfig.id)}
                  disabled={progress !== undefined && progress < 100}
                  className="px-4 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {progress !== undefined && progress < 100 ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    'Upload'
                  )}
                </button>
              )}
            </div>

            {progress !== undefined && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-orange h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const uploadedCount = Object.values(documents).filter(d => d?.uploaded).length;
  const requiredCount = REQUIRED_DOCUMENTS.filter(d => d.required).length;
  const allRequiredUploaded = REQUIRED_DOCUMENTS
    .filter(d => d.required)
    .every(d => documents[d.id]?.uploaded);

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-2">
            Document Verification
          </h1>
          <p className="text-gray-600 mb-4">
            Upload required documents for your partner application. Our team will review within 3-5 business days.
          </p>

          {/* Accommodation Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Select Accommodation for Verification</h3>
            <div className="overflow-x-auto pb-4" ref={scrollContainerRef}>
              <div className="flex gap-4">
                {properties.map(property => (
                  <div key={property.id} className="border rounded-lg bg-white shadow p-4 min-w-[340px] max-w-xs flex-shrink-0">
                    <h4 className="text-lg font-bold text-brand-brown">{property.name}</h4>
                    <button
                      className={favoriteProperties.includes(property.id) ? "text-red-500" : "text-gray-300"}
                      onClick={() => setFavoriteProperties(fav => fav.includes(property.id) ? fav.filter(id => id !== property.id) : [...fav, property.id])}
                      title={favoriteProperties.includes(property.id) ? "Remove from favorites" : "Add to favorites"}
                    >❤</button>
                    <p className="text-sm text-gray-700 mb-1">{property.address}</p>
                    <p className="text-xs text-gray-500 mb-2">{property.type} &bull; {property.stars} stars</p>
                    <div className="mb-2">
                      <span className="font-semibold">Amenities:</span>
                      <ul className="list-disc ml-4 text-xs">
                        {property.amenities?.map((amenity, i) => (
                          <li key={i}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Meal Plans:</span>
                      <select className="mt-1 block w-full rounded border px-2 py-1">
                        {property.mealPlans?.map((plan, i) => (
                          <option key={i} value={plan}>{plan}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="mt-2 px-4 py-1 bg-brand-orange text-white rounded"
                      onClick={() => setSelectedProperty(property)}
                    >Select</button>
                  </div>
                ))}
              </div>
            </div>
            {selectedProperty && (
              <div className="mt-6 p-4 border rounded bg-cream">
                <h4 className="text-lg font-bold mb-2">Selected Property</h4>
                <p><strong>Name:</strong> {selectedProperty.name}</p>
                <p><strong>Address:</strong> {selectedProperty.address}</p>
                <p><strong>Type:</strong> {selectedProperty.type}</p>
                <p><strong>Stars:</strong> {selectedProperty.stars}</p>
                <p><strong>Amenities:</strong> {selectedProperty.amenities?.join(', ')}</p>
                <p><strong>Meal Plans:</strong> {selectedProperty.mealPlans?.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-brand-brown">
                Upload Progress
              </span>
              <span className="text-sm text-gray-600">
                {uploadedCount} of {REQUIRED_DOCUMENTS.length} uploaded
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-brand-orange h-3 rounded-full transition-all"
                style={{ width: `${(uploadedCount / REQUIRED_DOCUMENTS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Application Status Alert */}
        {applicationStatus?.status === 'pending_documents' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Documents Required</p>
                <p className="text-sm text-yellow-700">
                  Please upload all required documents to proceed with your application.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {REQUIRED_DOCUMENTS.map(renderDocumentCard)}
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            {allRequiredUploaded ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">All required documents uploaded!</span>
              </div>
            ) : (
              <span>{requiredCount - Object.values(documents).filter(d => d?.uploaded && REQUIRED_DOCUMENTS.find(doc => doc.id === Object.keys(documents).find(key => documents[key] === d))?.required).length} required documents remaining</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/partner/dashboard')}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Save & Exit
            </button>

            <button
              onClick={handleSubmitForReview}
              disabled={!allRequiredUploaded || isSubmitting}
              className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Review
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">Document Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All documents must be clear and legible</li>
            <li>• Certificates must be current and valid</li>
            <li>• Banking proof must match the registered business name</li>
            <li>• Insurance must have minimum R5M public liability coverage</li>
            <li>• Questions? Email <a href="mailto:verification@collecotravel.com" className="underline">verification@collecotravel.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
