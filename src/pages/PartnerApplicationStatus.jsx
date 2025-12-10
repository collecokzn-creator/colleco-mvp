import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, FileText, Shield, UserCheck as _UserCheck, Sparkles } from "lucide-react";

const VERIFICATION_STAGES = [
  {
    id: "application_submitted",
    label: "Application Submitted",
    icon: FileText,
    description: "Your application has been received"
  },
  {
    id: "documents_uploaded",
    label: "Documents Uploaded",
    icon: Shield,
    description: "All required documents provided"
  },
  {
    id: "under_review",
    label: "Under Review",
    icon: Clock,
    description: "Our team is reviewing your application"
  },
  {
    id: "approved",
    label: "Approved",
    icon: CheckCircle2,
    description: "Welcome to the CollEco Partner Network!"
  }
];

const STATUS_BADGES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  pending_documents: { label: "Awaiting Documents", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  on_hold: { label: "On Hold", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
};

export default function PartnerApplicationStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = location.state?.applicationId || localStorage.getItem('colleco.partner.applicationId');
  const successMessage = location.state?.message;

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applicationId) {
      navigate('/partner/onboarding');
      return;
    }

    fetchApplicationStatus();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchApplicationStatus, 30000);
    return () => clearInterval(interval);
  }, [applicationId]);

  const fetchApplicationStatus = async () => {
    try {
      const response = await fetch(`/api/partners/${applicationId}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      setApplication(data);
      setLoading(false);
    } catch (err) {
      console.error('Status fetch error:', err);
      setError('Failed to load application status');
      setLoading(false);
    }
  };

  const getCurrentStageIndex = () => {
    if (!application) return 0;
    
    if (application.status === 'approved') return 3;
    if (application.status === 'under_review') return 2;
    if (application.documentsComplete) return 1;
    return 0;
  };

  const renderTimeline = () => {
    const currentStageIndex = getCurrentStageIndex();
    
    return (
      <div className="relative">
        {VERIFICATION_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const _isPending = index > currentStageIndex;

          return (
            <div key={stage.id} className="flex gap-4 mb-8 last:mb-0">
              {/* Icon Column */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-brand-orange text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                {index < VERIFICATION_STAGES.length - 1 && (
                  <div className={`w-0.5 h-16 transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-lg ${
                    isCompleted || isCurrent ? 'text-brand-brown' : 'text-gray-400'
                  }`}>
                    {stage.label}
                  </h3>
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </div>
                <p className={`text-sm ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {stage.description}
                </p>

                {/* Stage-specific content */}
                {isCurrent && stage.id === 'documents_uploaded' && (
                  <button
                    onClick={() => navigate('/partner/verification', { state: { applicationId } })}
                    className="mt-3 px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    Upload Documents
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {isCurrent && stage.id === 'under_review' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ⏱️ Estimated review time: <strong>3-5 business days</strong>
                    </p>
                  </div>
                )}

                {isCompleted && stage.id === 'approved' && application?.status === 'approved' && (
                  <div className="mt-3 space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 mb-2">
                        🎉 Congratulations! You&apos;re now part of the CollEco Partner Network.
                      </p>
                      <p className="text-xs text-green-700">
                        Approved on {new Date(application.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/partner/dashboard')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Go to Partner Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDocumentsList = () => {
    if (!application?.documents || application.documents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No documents uploaded yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {application.documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-brand-brown text-sm">{doc.label}</p>
                <p className="text-xs text-gray-500">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {doc.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
              {doc.status === 'pending_review' && <Clock className="w-5 h-5 text-yellow-500" />}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-brown mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
          <button
            onClick={() => navigate('/partner/onboarding')}
            className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Start New Application
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = STATUS_BADGES[application.status] || STATUS_BADGES.pending;
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">{successMessage}</p>
              <p className="text-sm text-green-700">We&apos;ll notify you once our team reviews your application.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-brand-brown mb-2">
                Partner Application Status
              </h1>
              <p className="text-gray-600">
                Application ID: <span className="font-mono text-brand-orange">{applicationId?.slice(0, 8)}</span>
              </p>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusBadge.color} font-semibold`}>
              <StatusIcon className="w-5 h-5" />
              {statusBadge.label}
            </div>
          </div>

          {/* Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-cream-light rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Business Name</p>
              <p className="font-semibold text-brand-brown">{application.businessName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="font-semibold text-brand-brown">{application.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Submitted</p>
              <p className="font-semibold text-brand-brown">
                {new Date(application.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-brown mb-6">Verification Progress</h2>
            {renderTimeline()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-brand-brown mb-4">Documents</h3>
              {renderDocumentsList()}
              {application.status === 'pending_documents' && (
                <button
                  onClick={() => navigate('/partner/verification', { state: { applicationId } })}
                  className="mt-4 w-full px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  Upload Missing Documents
                </button>
              )}
            </div>

            {/* Rejection Notice */}
            {application.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-2 mb-3">
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900">Application Rejected</h3>
                    <p className="text-sm text-red-700 mt-1">{application.rejectionReason}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/partner/onboarding')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Submit New Application
                </button>
              </div>
            )}

            {/* On Hold Notice */}
            {application.status === 'on_hold' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-yellow-900">Application On Hold</h3>
                    <p className="text-sm text-yellow-700 mt-1">{application.holdReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Contact our Partner Support team if you have questions about your application.
              </p>
              <a
                href="mailto:partners@collecotravel.com"
                className="inline-block text-sm text-blue-700 underline hover:text-blue-900"
              >
                partners@collecotravel.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
