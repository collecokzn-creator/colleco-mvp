import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { NotificationContext } from './NotificationCenter';

/**
 * PartnerCollaboration Component
 * 
 * Enables multiple partners to collaborate on complex bookings
 * Features:
 * - Multi-partner package building
 * - Shared itineraries
 * - Commission split agreements
 * - Real-time collaboration
 * - Approval workflows
 * - Communication threads
 */

const PartnerCollaboration = () => {
  const { user } = useContext(UserContext);
  const { addNotification } = useContext(NotificationContext);
  
  const [collaborations, setCollaborations] = useState([]);
  const [_activeCollab, setActiveCollab] = useState(null); // activeCollab placeholder until selection UI implemented
  const [showNewCollab, setShowNewCollab] = useState(false);
  const [partners, setPartners] = useState([]);
  
  // New collaboration form state
  const [collabForm, setCollabForm] = useState({
    title: '',
    description: '',
    bookingId: '',
    selectedPartners: [],
    services: [],
    commissionSplit: 'equal', // equal, percentage, fixed
    customSplit: {}
  });

  useEffect(() => {
    loadCollaborations();
    loadPartners();
  }, []);

  const loadCollaborations = () => {
    // Mock data - replace with API
    const mockCollabs = JSON.parse(localStorage.getItem('partner_collaborations') || '[]');
    setCollaborations(mockCollabs);
  };

  const loadPartners = () => {
    // Mock partners
    const mockPartners = [
      { id: 'p1', name: 'Sunshine Hotels', type: 'hotel', verified: true },
      { id: 'p2', name: 'Safari Adventures', type: 'tour_operator', verified: true },
      { id: 'p3', name: 'Cape DMC', type: 'dmc', verified: true },
      { id: 'p4', name: 'Luxury Transport', type: 'transport', verified: false }
    ];
    setPartners(mockPartners);
  };

  const createCollaboration = () => {
    const newCollab = {
      id: `collab_${Date.now()}`,
      ...collabForm,
      createdBy: user.id,
      creatorName: user.name,
      status: 'pending', // pending, active, completed, cancelled
      createdAt: new Date().toISOString(),
      participants: collabForm.selectedPartners.map(_partnerId => ({
        partnerId: _partnerId,
        status: 'invited', // invited, accepted, declined
        role: 'collaborator'
      })),
      messages: [],
      updates: []
    };

    const allCollabs = [newCollab, ...collaborations];
    setCollaborations(allCollabs);
    localStorage.setItem('partner_collaborations', JSON.stringify(allCollabs));

    // Send notifications to invited partners
    collabForm.selectedPartners.forEach(_partnerId => {
      addNotification({
        type: 'collaboration',
        title: 'New Collaboration Request',
        message: `${user.name} invited you to collaborate on: ${collabForm.title}`,
        actionUrl: `/collaborations/${newCollab.id}`
      });
    });

    setShowNewCollab(false);
    setCollabForm({
      title: '',
      description: '',
      bookingId: '',
      selectedPartners: [],
      services: [],
      commissionSplit: 'equal',
      customSplit: {}
    });
  };

  const addService = () => {
    setCollabForm(prev => ({
      ...prev,
      services: [...prev.services, {
        id: Date.now().toString(),
        type: '',
        provider: '',
        description: '',
        cost: 0,
        markup: 0,
        responsibility: ''
      }]
    }));
  };

  const updateService = (serviceId, field, value) => {
    setCollabForm(prev => ({
      ...prev,
      services: prev.services.map(s =>
        s.id === serviceId ? { ...s, [field]: value } : s
      )
    }));
  };

  const removeService = (serviceId) => {
    setCollabForm(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
  };

  const _calculateCommission = () => { // currently unused return; kept for future commission breakdowns
    const totalRevenue = collabForm.services.reduce((sum, s) => sum + (s.cost || 0) + (s.markup || 0), 0);
    const partnerCount = collabForm.selectedPartners.length + 1; // +1 for current user

    if (collabForm.commissionSplit === 'equal') {
      const perPartner = totalRevenue / partnerCount;
      return collabForm.selectedPartners.reduce((acc, partnerId) => {
        acc[partnerId] = perPartner;
        return acc;
      }, { [user.id]: perPartner });
    }

    return collabForm.customSplit;
  };

  const _respondToCollaboration = (collabId, response) => { // respond handler exposed via upcoming action buttons
    setCollaborations(prev =>
      prev.map(collab => {
        if (collab.id === collabId) {
          return {
            ...collab,
            participants: collab.participants.map(p =>
              p.partnerId === user.id ? { ...p, status: response } : p
            ),
            updates: [
              ...collab.updates,
              {
                timestamp: new Date().toISOString(),
                userId: user.id,
                userName: user.name,
                action: response,
                message: `${user.name} ${response} the collaboration`
              }
            ]
          };
        }
        return collab;
      })
    );

    // Notify collaboration creator
    const collab = collaborations.find(c => c.id === collabId);
    addNotification({
      type: 'collaboration',
      title: 'Collaboration Response',
      message: `${user.name} ${response} collaboration: ${collab.title}`,
      actionUrl: `/collaborations/${collabId}`
    });
  };

  const _addCollabMessage = (collabId, message) => { // message API integration pending
    setCollaborations(prev =>
      prev.map(collab => {
        if (collab.id === collabId) {
          return {
            ...collab,
            messages: [
              ...collab.messages,
              {
                id: Date.now().toString(),
                userId: user.id,
                userName: user.name,
                message,
                timestamp: new Date().toISOString()
              }
            ]
          };
        }
        return collab;
      })
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Collaborations</h1>
            <p className="text-gray-600 mt-1">Work together on complex bookings and packages</p>
          </div>
          <button
            onClick={() => setShowNewCollab(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
          >
            + New Collaboration
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {collaborations.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {collaborations.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {collaborations.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              R{collaborations.reduce((sum, c) => sum + (c.totalValue || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>

        {/* Collaborations List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {collaborations.length === 0 ? (
            <div className="col-span-3 bg-white rounded-lg shadow p-12 text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No collaborations yet</h3>
              <p className="text-gray-500">Start collaborating with other partners to create amazing packages!</p>
            </div>
          ) : (
            collaborations.map(collab => (
              <div
                key={collab.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => setActiveCollab(collab)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{collab.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(collab.status)}`}>
                      {collab.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{collab.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {collab.participants.length + 1} partners
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">
                      {new Date(collab.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="border-t px-6 py-3 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created by {collab.creatorName}</span>
                    <span className="text-gray-400">
                      {collab.messages?.length || 0} messages
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Collaboration Modal */}
      {showNewCollab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Create New Collaboration</h3>
              <button onClick={() => setShowNewCollab(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Collaboration Title *</label>
                <input
                  type="text"
                  value={collabForm.title}
                  onChange={(e) => setCollabForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 5-Day Safari Package for Corporate Group"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={collabForm.description}
                  onChange={(e) => setCollabForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Describe the collaboration requirements..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Partner Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invite Partners *</label>
                <div className="grid grid-cols-2 gap-3">
                  {partners.map(partner => (
                    <label key={partner.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={collabForm.selectedPartners.includes(partner.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCollabForm(prev => ({
                              ...prev,
                              selectedPartners: [...prev.selectedPartners, partner.id]
                            }));
                          } else {
                            setCollabForm(prev => ({
                              ...prev,
                              selectedPartners: prev.selectedPartners.filter(id => id !== partner.id)
                            }));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{partner.name}</span>
                          {partner.verified && (
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{partner.type}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Services & Components</label>
                  <button
                    onClick={addService}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add Service
                  </button>
                </div>

                <div className="space-y-3">
                  {collabForm.services.map(service => (
                    <div key={service.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="e.g., 4-Star Hotel, Airport Transfer, Safari Tour"
                          value={service.type}
                          onChange={(e) => updateService(service.id, 'type', e.target.value)}
                          className="px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Provider"
                          value={service.provider}
                          onChange={(e) => updateService(service.id, 'provider', e.target.value)}
                          className="px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Cost (R)"
                          value={service.cost}
                          onChange={(e) => updateService(service.id, 'cost', parseFloat(e.target.value))}
                          className="px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Markup (R)"
                          value={service.markup}
                          onChange={(e) => updateService(service.id, 'markup', parseFloat(e.target.value))}
                          className="px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <input
                          type="text"
                          placeholder="Description"
                          value={service.description}
                          onChange={(e) => updateService(service.id, 'description', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeService(service.id)}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission Split */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commission Split</label>
                <select
                  value={collabForm.commissionSplit}
                  onChange={(e) => setCollabForm(prev => ({ ...prev, commissionSplit: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="equal">Equal Split</option>
                  <option value="percentage">Percentage Based</option>
                  <option value="fixed">Fixed Amounts</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewCollab(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={createCollaboration}
                disabled={!collabForm.title || collabForm.selectedPartners.length === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
              >
                Create Collaboration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCollaboration;
