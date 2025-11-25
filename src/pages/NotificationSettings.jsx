import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { PushNotificationService } from '../components/NotificationCenter';

/**
 * NotificationSettings - User-friendly page for enabling/managing notifications
 * 
 * Users can access this from:
 * - Settings menu
 * - Profile page
 * - First-time app open
 */
const NotificationSettings = () => {
  const { user } = useContext(UserContext);
  const [permission, setPermission] = useState('default'); // 'default', 'granted', 'denied'
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [deviceType, setDeviceType] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [_showInstructions, setShowInstructions] = useState(false); // instructions panel placeholder; setter used for future UI

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    // Check browser notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if PWA
    const installed = PushNotificationService.isInstalledPWA();
    setIsPWA(installed);

    // Check device type
    const mobile = PushNotificationService.isMobileDevice();
    setDeviceType(mobile ? 'mobile' : 'desktop');

    // Check if subscribed to push
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      // Request permission
      const granted = await PushNotificationService.requestPermission();
      
      if (granted) {
        // Subscribe to push notifications
        await PushNotificationService.subscribeToNotifications(user.id);
        
        // Send test notification
        await PushNotificationService.sendTestNotification();
        
        // Update status
        await checkNotificationStatus();
        
        alert('✅ Notifications enabled! You should see a test notification.');
      } else {
        alert('❌ Notification permission denied. Please enable in your browser/device settings.');
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('❌ Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await PushNotificationService.unsubscribeFromNotifications(user.id);
      await checkNotificationStatus();
      alert('🔕 Notifications disabled');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      alert('❌ Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = () => {
    if (deviceType === 'mobile') {
      return isPWA ? '📱 Mobile App' : '📱 Mobile Browser';
    }
    return '💻 Desktop';
  };

  const getStatusColor = () => {
    if (permission === 'granted' && isSubscribed) return 'text-green-600';
    if (permission === 'denied') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusText = () => {
    if (permission === 'granted' && isSubscribed) return '✅ Enabled';
    if (permission === 'denied') return '❌ Blocked';
    if (permission === 'granted') return '⚠️ Permission granted, not subscribed';
    return '🔔 Not enabled';
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-cream-border px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🔔 Notification Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your push notifications and stay updated on bookings, messages, and payments
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-cream-sand border border-cream-border rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Current Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Notifications</span>
                <span className={`font-semibold ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Device</span>
                <span className="font-semibold text-gray-900">
                  {getDeviceIcon()}
                </span>
              </div>
              {deviceType === 'mobile' && !isPWA && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Install the CollEco app for the best notification experience!
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div>
            {permission === 'granted' && isSubscribed ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">You&apos;re All Set!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        You&apos;ll receive instant notifications for:
                      </p>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>📋 New bookings and updates</li>
                        <li>💰 Payments received and due</li>
                        <li>💬 New messages from clients</li>
                        <li>📄 Quote requests and responses</li>
                        <li>🤝 Collaboration invites</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDisableNotifications}
                  disabled={loading}
                  className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? '⏳ Processing...' : '🔕 Disable Notifications'}
                </button>
              </div>
            ) : permission === 'denied' ? (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">Notifications Blocked</h3>
                      <p className="text-sm text-red-700 mt-1">
                        You&apos;ve blocked notifications for CollEco. To enable them:
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-cream-sand border border-cream-border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">How to Enable:</h3>
                  
                  {deviceType === 'mobile' ? (
                    <div className="space-y-3 text-sm text-gray-700">
                      <div>
                        <strong className="text-gray-900">iPhone/iPad:</strong>
                        <ol className="list-decimal list-inside mt-1 ml-2 space-y-1">
                          <li>Go to Settings → Notifications → CollEco</li>
                          <li>Toggle on &quot;Allow Notifications&quot;</li>
                          <li>Refresh this page</li>
                        </ol>
                      </div>
                      <div>
                        <strong className="text-gray-900">Android:</strong>
                        <ol className="list-decimal list-inside mt-1 ml-2 space-y-1">
                          <li>Go to Settings → Apps → CollEco → Notifications</li>
                          <li>Toggle on notifications</li>
                          <li>Refresh this page</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700">
                      <strong className="text-gray-900">Desktop Browser:</strong>
                      <ol className="list-decimal list-inside mt-1 ml-2 space-y-1">
                        <li>Click the 🔒 lock icon in the address bar</li>
                        <li>Find &quot;Notifications&quot; in the permissions list</li>
                        <li>Change to &quot;Allow&quot;</li>
                        <li>Refresh this page</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-[#FFF8F1] border border-[#D2691E] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔔</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Enable Push Notifications</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        Get instant alerts for bookings, payments, and messages. Never miss an important update!
                      </p>
                      <ul className="text-sm text-gray-600 mt-3 space-y-1">
                        <li>✓ Instant booking notifications</li>
                        <li>✓ Payment alerts with vibration</li>
                        <li>✓ Client message updates</li>
                        <li>✓ Works even when app is closed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  className="w-full bg-[#D2691E] text-white px-6 py-3 rounded-lg hover:bg-[#B8591A] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                >
                  {loading ? '⏳ Enabling...' : '🔔 Enable Notifications'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We&apos;ll ask for your permission in the next step
                </p>
              </div>
            )}
          </div>

          {/* What You'll Receive */}
          <div className="border-t border-cream-border pt-6">
            <h2 className="font-semibold text-gray-900 mb-3">What You&apos;ll Receive</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '📋', title: 'Bookings', desc: 'New bookings and confirmations' },
                { icon: '💰', title: 'Payments', desc: 'Payment received and due alerts' },
                { icon: '💬', title: 'Messages', desc: 'New messages from clients' },
                { icon: '📄', title: 'Quotes', desc: 'Quote requests and responses' },
                { icon: '🤝', title: 'Collaborations', desc: 'Partner collaboration invites' },
                { icon: '⚠️', title: 'Alerts', desc: 'Important system updates' }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
