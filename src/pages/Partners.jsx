import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Building2, Mail, Phone, MapPin, Calendar, 
  CheckCircle2, XCircle, AlertCircle, Eye, Filter
} from "lucide-react";

export default function Partners() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPartners();
  }, []);

  const filterPartnersCb = useCallback(() => {
    let filtered = partners;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.businessName?.toLowerCase().includes(query) ||
        p.contactPerson?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPartners(filtered);
  }, [partners, searchQuery, statusFilter]);

  useEffect(() => {
    filterPartnersCb();
  }, [filterPartnersCb]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      // Try localStorage first (demo mode)
      const storedPartners = JSON.parse(localStorage.getItem('colleco.partner.applications') || '[]');
      
      if (storedPartners.length > 0) {
        setPartners(storedPartners);
      } else {
        // Fallback to API
        const response = await fetch('/api/admin/partners');
        if (response.ok) {
          const data = await response.json();
          setPartners(data.partners || []);
        } else {
          // Demo data
          setPartners([
            {
              applicationId: 'APP-001',
              businessName: 'Sunset Safari Lodge',
              contactPerson: 'John Doe',
              email: 'john@sunsetsafari.co.za',
              phone: '+27 12 345 6789',
              city: 'Cape Town',
              province: 'Western Cape',
              category: 'accommodation',
              status: 'accepted',
              appliedAt: '2025-12-01T10:00:00Z',
              documents: [{ status: 'accepted' }, { status: 'accepted' }]
            },
            {
              applicationId: 'APP-002',
              businessName: 'Adventure Tours ZA',
              contactPerson: 'Jane Smith',
              email: 'jane@adventuretours.co.za',
              phone: '+27 11 987 6543',
              city: 'Johannesburg',
              province: 'Gauteng',
              category: 'tour_operator',
              status: 'pending',
              appliedAt: '2025-12-10T14:30:00Z',
              documents: [{ status: 'pending' }, { status: 'accepted' }]
            },
            {
              applicationId: 'APP-003',
              businessName: 'Garden Route Transfers',
              contactPerson: 'Mike Johnson',
              email: 'mike@gardenroute.co.za',
              phone: '+27 44 555 1234',
              city: 'George',
              province: 'Western Cape',
              category: 'transport',
              status: 'rejected',
              appliedAt: '2025-11-28T09:15:00Z',
              documents: [{ status: 'rejected' }]
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const getStatusBadge = (status) => {
    const badges = {
      accepted: { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      approved: { icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      pending: { icon: AlertCircle, bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      rejected: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      declined: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Declined' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 ${badge.bg} ${badge.text} rounded-full text-sm font-semibold`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const acceptedCount = partners.filter(p => p.status === 'accepted' || p.status === 'approved').length;
  const pendingCount = partners.filter(p => p.status === 'pending').length;
  const rejectedCount = partners.filter(p => p.status === 'rejected' || p.status === 'declined').length;

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-brown mb-2">Partner Management</h1>
          <p className="text-gray-600">Review and manage partner applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-1">Total Partners</p>
            <p className="text-3xl font-bold text-brand-brown">{partners.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-sm text-green-700 mb-1">Accepted</p>
            <p className="text-3xl font-bold text-green-700">{acceptedCount}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-sm text-yellow-700 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-sm text-red-700 mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by business name, contact, email, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Partners List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Loading partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No partners found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPartners.map(partner => (
              <div key={partner.applicationId} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Building2 className="w-10 h-10 text-brand-orange mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-brand-brown mb-1">
                        {partner.businessName}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {partner.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {partner.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {partner.city}, {partner.province}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Applied: {new Date(partner.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(partner.status)}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Contact:</span> {partner.contactPerson}
                  </div>
                  <button
                    onClick={() => navigate(`/admin/partner-approval/${partner.applicationId}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Review Application
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

