import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  FileText, CheckCircle2, XCircle, AlertCircle, ExternalLink, 
  Building2, Mail, Phone, MapPin, Calendar, User, Loader,
  ThumbsUp, ThumbsDown, MessageSquare
} from "lucide-react";

const DOCUMENT_TYPES = {
  business_registration: "Business Registration Certificate",
  tax_clearance: "Tax Clearance Certificate",
  liability_insurance: "Public Liability Insurance",
  trade_license: "Trade License / Tourism Registration",
  banking_details: "Banking Details",
  id_document: "ID/Passport of Director/Owner",
  bbbee_certificate: "B-BBEE Certificate"
};

export default function AdminPartnerVerification() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  
  // If no applicationId, redirect to Partners list
  if (!applicationId) {
    navigate('/admin/partners');
    return null;
  }

  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoVerificationEnabled] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  // Automated verification logic
  const runAutomatedVerification = async (documents) => {
    return documents.map(doc => {
      // Auto-verification rules
      const checks = {
        validFileType: doc.fileType && ['pdf', 'jpg', 'png'].includes(doc.fileType.toLowerCase()),
        validFileSize: doc.fileSize && doc.fileSize <= 5 * 1024 * 1024, // 5MB
        hasMetadata: doc.metadata && Object.keys(doc.metadata).length > 0,
        notExpired: doc.expiryDate ? new Date(doc.expiryDate) > new Date() : true,
        readableQuality: doc.qualityScore ? doc.qualityScore >= 70 : true
      };

      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.values(checks).length;
      const passRate = passedChecks / totalChecks;

      // Auto-assign status
      let autoStatus = doc.status;
      let autoReason = '';

      if (!doc.autoVerified) {
        if (passRate === 1) {
          autoStatus = 'accepted';
          autoReason = 'All automated checks passed';
        } else if (passRate >= 0.6) {
          autoStatus = 'pending';
          autoReason = `${passedChecks}/${totalChecks} checks passed - manual review required`;
        } else {
          autoStatus = 'rejected';
          autoReason = `Failed automated verification: ${Object.entries(checks)
            .filter(([_, passed]) => !passed)
            .map(([key]) => key)
            .join(', ')}`;
        }

        return {
          ...doc,
          status: autoStatus,
          autoVerified: true,
          autoReason,
          verificationChecks: checks
        };
      }

      return doc;
    });
  };

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      // Fetch from API or localStorage for demo
      const storedApplications = JSON.parse(localStorage.getItem('colleco.partner.applications') || '[]');
      const app = storedApplications.find(a => a.applicationId === applicationId);
      
      if (app) {
        setApplication(app);
        let docs = app.documents || [];
        
        // Run automated verification if enabled
        if (autoVerificationEnabled && docs.some(d => !d.autoVerified)) {
          docs = await runAutomatedVerification(docs);
          // Update localStorage with auto-verified results
          const updatedApps = storedApplications.map(a => 
            a.applicationId === applicationId ? { ...a, documents: docs } : a
          );
          localStorage.setItem('colleco.partner.applications', JSON.stringify(updatedApps));
        }
        
        setDocuments(docs);
      } else {
        // Try API
        const response = await fetch(`/api/admin/partners/${applicationId}`);
        if (response.ok) {
          const data = await response.json();
          setApplication(data);
          let docs = data.documents || [];
          
          // Run automated verification
          if (autoVerificationEnabled && docs.some(d => !d.autoVerified)) {
            docs = await runAutomatedVerification(docs);
          }
          
          setDocuments(docs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAction = async (documentId, action, reason = '', isManualOverride = false) => {
    setIsProcessing(true);
    try {
      const statusMap = {
        approve: 'accepted',
        accept: 'accepted',
        reject: 'rejected',
        pending: 'pending'
      };

      const response = await fetch(`/api/admin/partners/${applicationId}/documents/${documentId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason,
          reviewedBy: localStorage.getItem('colleco.user.id') || 'admin',
          reviewedAt: new Date().toISOString(),
          manualOverride: isManualOverride
        })
      });

      if (!response.ok) throw new Error('Action failed');

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: statusMap[action] || action,
              rejectionReason: action === 'reject' ? reason : doc.rejectionReason,
              manualOverride: isManualOverride,
              overriddenBy: isManualOverride ? localStorage.getItem('colleco.user.id') || 'admin' : undefined,
              overriddenAt: isManualOverride ? new Date().toISOString() : undefined
            }
          : doc
      ));

      // Clear notes
      setReviewNotes(prev => ({ ...prev, [documentId]: '' }));
    } catch (error) {
      console.error('Action error:', error);
      alert('Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm('Approve all documents and activate this partner?')) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/partners/${applicationId}/approve-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: localStorage.getItem('colleco.user.id') || 'admin',
          approvedAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Approval failed');

      alert('Partner approved successfully!');
      navigate('/admin/partners');
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve partner. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectApplication = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/partners/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          rejectedBy: localStorage.getItem('colleco.user.id') || 'admin',
          rejectedAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Rejection failed');

      alert('Application rejected.');
      navigate('/admin/partners');
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status, isManualOverride = false) => {
    const badge = {
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      declined: { bg: 'bg-red-100', text: 'text-red-700', label: 'Declined' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      pending_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };

    return (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 ${badge.bg} ${badge.text} rounded-full text-sm font-semibold`}>
          {badge.label}
        </span>
        {isManualOverride && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
            Manual Override
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-brand-brown mb-2">Application Not Found</h2>
          <button onClick={() => navigate('/admin/partners')} className="text-brand-orange hover:underline">
            Back to Partner Management
          </button>
        </div>
      </div>
    );
  }

  const approvedCount = documents.filter(d => d.status === 'approved' || d.status === 'accepted').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected' || d.status === 'declined').length;
  const pendingCount = documents.filter(d => d.status === 'pending_review' || d.status === 'pending').length;
  const autoAcceptedCount = documents.filter(d => (d.status === 'accepted' || d.status === 'approved') && d.autoVerified && !d.manualOverride).length;
  const manualOverrideCount = documents.filter(d => d.manualOverride).length;

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/partners')}
            className="text-brand-orange hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to Partner Management
          </button>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-brand-brown mb-2">
                  Partner Application Review
                </h1>
                <p className="text-gray-600">Application ID: {applicationId}</p>
              </div>
              {getStatusBadge(application.status)}
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-brand-orange mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Business Name</p>
                  <p className="font-semibold text-brand-brown">{application.businessName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-brand-orange mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-semibold text-brand-brown">{application.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-orange mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-brand-brown">{application.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-orange mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-brand-brown">{application.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-orange mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-brand-brown">
                    {application.city}, {application.province}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-brand-orange mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Applied On</p>
                  <p className="font-semibold text-brand-brown">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Review Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">Accepted</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
            <p className="text-xs text-green-600 mt-1">{autoAcceptedCount} auto-verified</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-700 font-semibold">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700 font-semibold">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">Manual Override</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{manualOverrideCount}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700 font-semibold">Total Docs</span>
            </div>
            <p className="text-2xl font-bold text-gray-700">{documents.length}</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-brand-brown">Documents Review</h2>
          {documents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-6 h-6 text-brand-orange mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-brown mb-1">
                        {DOCUMENT_TYPES[doc.type] || doc.type}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                      </p>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-orange hover:underline text-sm"
                        >
                          View Document
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(doc.status, doc.manualOverride)}
                </div>

                {/* Auto-verification info */}
                {doc.autoVerified && doc.autoReason && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700 font-semibold mb-1">
                      🤖 Automated Verification
                    </p>
                    <p className="text-sm text-blue-600">{doc.autoReason}</p>
                  </div>
                )}

                {doc.status === 'rejected' && doc.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700 font-semibold mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-600">{doc.rejectionReason}</p>
                  </div>
                )}

                {/* Admin Actions - Always available for manual override */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-gray-500 mt-2" />
                    <textarea
                      placeholder="Add review notes or override reason..."
                      value={reviewNotes[doc.id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [doc.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent resize-none"
                      rows="2"
                    />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleDocumentAction(doc.id, 'accept', reviewNotes[doc.id], true)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {doc.status === 'accepted' ? 'Confirm Accept' : 'Override → Accept'}
                    </button>
                    <button
                      onClick={() => {
                        if (!reviewNotes[doc.id]) {
                          alert('Please provide a reason for rejection/override');
                          return;
                        }
                        handleDocumentAction(doc.id, 'reject', reviewNotes[doc.id], true);
                      }}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {doc.status === 'rejected' ? 'Confirm Reject' : 'Override → Reject'}
                    </button>
                    <button
                      onClick={() => handleDocumentAction(doc.id, 'pending', reviewNotes[doc.id], true)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Override → Pending
                    </button>
                  </div>
                  {doc.status !== 'pending' && doc.status !== 'pending_review' && (
                    <p className="text-xs text-gray-600 italic">
                      💡 Admin Override: You can manually change the verification status above
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Final Actions */}
        {documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-bold text-brand-brown mb-4">Application Decision</h3>
            <div className="flex gap-4">
              <button
                onClick={handleApproveAll}
                disabled={isProcessing || pendingCount > 0 || rejectedCount > 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Approve Partner & Activate
              </button>
              <button
                onClick={handleRejectApplication}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                Reject Application
              </button>
            </div>
            {(pendingCount > 0 || rejectedCount > 0) && (
              <p className="mt-3 text-sm text-gray-600">
                Note: All documents must be approved before activating the partner.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
