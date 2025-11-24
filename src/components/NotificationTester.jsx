import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import { 
  sendPushNotification, 
  NotificationTemplates, 
  getSubscriptionStatus 
} from '../utils/notificationIntegration';

/**
 * NotificationTester - Admin panel for testing push notifications
 * 
 * Features:
 * - Test all notification types
 * - Custom notification builder
 * - Subscription status viewer
 * - Delivery tracking
 */
const NotificationTester = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('templates'); // templates, custom, status
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Custom notification state
  const [customNotification, setCustomNotification] = useState({
    title: 'Test Notification',
    body: 'This is a test notification from CollEco',
    type: 'message',
    url: '/',
    vibrate: [200, 100, 200]
  });

  // Load subscription status
  useEffect(() => {
    if (user?.id) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    const status = await getSubscriptionStatus(user.id);
    setSubscriptionStatus(status);
  };

  const sendTestNotification = async (template, data = {}) => {
    setLoading(true);
    try {
      const notification = typeof template === 'function' 
        ? template({ ...data, partnerId: user.id })
        : { ...customNotification, userId: user.id };

      const result = await sendPushNotification(notification);
      
      setTestResults(prev => [{
        timestamp: new Date().toISOString(),
        notification: notification.title,
        result: result.ok ? 'Success' : 'Failed',
        details: result
      }, ...prev.slice(0, 9)]); // Keep last 10 results

      if (result.ok) {
        alert(`✅ Notification sent to ${result.sent} device(s)`);
      } else {
        alert(`❌ Failed to send notification: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTemplates = [
    {
      name: 'New Booking',
      template: NotificationTemplates.newBooking,
      data: {
        bookingId: 'BK-TEST-001',
        clientName: 'John Doe',
        packageName: 'Cape Town Safari Adventure',
        amount: 45000
      }
    },
    {
      name: 'Payment Received',
      template: NotificationTemplates.paymentReceived,
      data: {
        bookingId: 'BK-TEST-001',
        amount: 45000,
        clientName: 'John Doe'
      }
    },
    {
      name: 'New Message',
      template: NotificationTemplates.newMessage,
      data: {
        conversationId: 'CONV-001',
        senderName: 'Safari Adventures',
        message: 'We can accommodate your group of 12 people for the safari tour!'
      }
    },
    {
      name: 'Quote Request',
      template: NotificationTemplates.newQuoteRequest,
      data: {
        quoteId: 'QT-TEST-001',
        clientName: 'Jane Smith',
        destination: 'Kruger National Park'
      }
    },
    {
      name: 'Quote Accepted',
      template: NotificationTemplates.quoteAccepted,
      data: {
        quoteId: 'QT-TEST-001',
        clientName: 'Jane Smith',
        amount: 28000
      }
    },
    {
      name: 'Collaboration Invite',
      template: NotificationTemplates.collaborationInvite,
      data: {
        collaborationId: 'COL-001',
        inviterName: 'Cape Adventures',
        packageName: 'Multi-Day Safari Package'
      }
    },
    {
      name: 'Payment Due',
      template: NotificationTemplates.paymentDue,
      data: {
        bookingId: 'BK-TEST-002',
        amount: 15000,
        dueDate: '2025-12-01',
        clientName: 'Bob Wilson'
      }
    },
    {
      name: 'System Alert',
      template: NotificationTemplates.systemAlert,
      data: {
        title: 'System Maintenance',
        message: 'CollEco will undergo maintenance tonight from 2-4 AM'
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🔔 Push Notification Tester
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Test mobile and desktop push notifications for CollEco
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'templates', label: '📋 Templates' },
              { id: 'custom', label: '✏️ Custom' },
              { id: 'status', label: '📊 Status' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#D2691E] text-[#D2691E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Test Notification Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testTemplates.map((test, index) => {
                  const notification = test.template({ ...test.data, partnerId: user?.id });
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">{test.name}</h3>
                      
                      {/* Preview */}
                      <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
                        <div className="font-semibold text-gray-900">{notification.title}</div>
                        <div className="text-gray-600 mt-1">{notification.body}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Type: {notification.type}
                          </span>
                          {notification.vibrate && (
                            <span className="text-xs text-gray-500">
                              | Vibrate: {notification.vibrate.join('-')}ms
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendTestNotification(test.template, test.data)}
                          disabled={loading}
                          className="flex-1 bg-[#D2691E] text-white px-4 py-2 rounded hover:bg-[#B8591A] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {loading ? '⏳ Sending...' : '📤 Send Test'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Tab */}
          {activeTab === 'custom' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Custom Notification Builder</h2>
              
              <div className="max-w-2xl space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={customNotification.title}
                    onChange={(e) => setCustomNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2691E] focus:border-transparent"
                    placeholder="Enter notification title"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Body
                  </label>
                  <textarea
                    value={customNotification.body}
                    onChange={(e) => setCustomNotification(prev => ({ ...prev, body: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2691E] focus:border-transparent"
                    rows={3}
                    placeholder="Enter notification message"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={customNotification.type}
                    onChange={(e) => setCustomNotification(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2691E] focus:border-transparent"
                  >
                    <option value="message">💬 Message</option>
                    <option value="booking">📋 Booking</option>
                    <option value="payment">💰 Payment</option>
                    <option value="quote">📄 Quote</option>
                    <option value="collaboration">🤝 Collaboration</option>
                    <option value="alert">⚠️ Alert</option>
                    <option value="system">ℹ️ System</option>
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    value={customNotification.url}
                    onChange={(e) => setCustomNotification(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2691E] focus:border-transparent"
                    placeholder="/bookings/123"
                  />
                </div>

                {/* Vibration Pattern */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vibration Pattern (comma-separated milliseconds)
                  </label>
                  <input
                    type="text"
                    value={customNotification.vibrate?.join(', ') || ''}
                    onChange={(e) => {
                      const pattern = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                      setCustomNotification(prev => ({ ...prev, vibrate: pattern }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2691E] focus:border-transparent"
                    placeholder="200, 100, 200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example patterns: Double ping (200,100,200), Triple (300,100,300,100,300), Urgent (100,50,100,50,100,50,100)
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
                  <div className="bg-white rounded p-3 shadow-sm">
                    <div className="font-semibold text-gray-900">{customNotification.title}</div>
                    <div className="text-gray-600 text-sm mt-1">{customNotification.body}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>Type: {customNotification.type}</span>
                      {customNotification.vibrate && (
                        <span>| Vibrate: {customNotification.vibrate.join('-')}ms</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => sendTestNotification(null)}
                  disabled={loading || !customNotification.title || !customNotification.body}
                  className="w-full bg-[#D2691E] text-white px-6 py-3 rounded-lg hover:bg-[#B8591A] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? '⏳ Sending...' : '📤 Send Custom Notification'}
                </button>
              </div>
            </div>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Subscription Status</h2>
              
              {/* Subscription Info */}
              {subscriptionStatus && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">User ID</div>
                      <div className="font-semibold">{subscriptionStatus.userId || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Subscriptions</div>
                      <div className="font-semibold">{subscriptionStatus.subscriptionCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className={`font-semibold ${subscriptionStatus.subscriptionCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {subscriptionStatus.subscriptionCount > 0 ? '✅ Active' : '❌ No Subscriptions'}
                      </div>
                    </div>
                  </div>

                  {subscriptionStatus.subscriptions && subscriptionStatus.subscriptions.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Devices</h3>
                      <div className="space-y-2">
                        {subscriptionStatus.subscriptions.map((sub, index) => (
                          <div key={index} className="bg-white rounded p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {sub.deviceType === 'mobile' ? '📱' : '💻'} {sub.deviceType}
                                {sub.isPWA && ' (PWA)'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Subscribed: {new Date(sub.subscribedAt).toLocaleDateString()}
                              </span>
                            </div>
                            {sub.lastSentAt && (
                              <div className="text-xs text-gray-500 mt-1">
                                Last notification: {new Date(sub.lastSentAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={loadSubscriptionStatus}
                    className="mt-4 text-[#D2691E] hover:text-[#B8591A] text-sm font-medium"
                  >
                    🔄 Refresh Status
                  </button>
                </div>
              )}

              {/* Test Results */}
              {testResults.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Tests</h3>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`font-medium ${result.result === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                              {result.result === 'Success' ? '✅' : '❌'} {result.notification}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(result.timestamp).toLocaleString()}
                            </div>
                          </div>
                          {result.details.sent && (
                            <span className="text-sm text-gray-600">
                              Sent to {result.details.sent} device(s)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setTestResults([])}
                    className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    🗑️ Clear Results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationTester;
