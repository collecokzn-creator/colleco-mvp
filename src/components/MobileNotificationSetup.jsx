import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { PushNotificationService } from './NotificationCenter';

/**
 * MobileNotificationSetup Component
 * 
 * Guides users through enabling push notifications on mobile devices
 * Features:
 * - PWA installation prompt
 * - Push notification permission request
 * - Device-specific instructions (iOS vs Android)
 * - Test notification
 * - Badge configuration
 */

const MobileNotificationSetup = ({ onComplete }) => {
  const { user } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deviceType, setDeviceType] = useState('unknown');
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    detectDevice();
    checkPWAStatus();
    checkNotificationPermission();
  }, []);

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  };

  const checkPWAStatus = () => {
    const isPWA = PushNotificationService.isInstalledPWA();
    setIsInstalled(isPWA);
    if (isPWA) setCurrentStep(2);
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
      if (Notification.permission === 'granted') setCurrentStep(3);
    }
  };

  const handleInstallPWA = async () => {
    await PushNotificationService.promptInstallPWA();
    setTimeout(() => {
      checkPWAStatus();
    }, 1000);
  };

  const handleEnableNotifications = async () => {
    const granted = await PushNotificationService.requestPermission();
    setHasPermission(granted);
    
    if (granted) {
      setCurrentStep(3);
      
      // Subscribe to push notifications
      try {
        await PushNotificationService.subscribeToNotifications(user.id);
        setIsSubscribed(true);
        setCurrentStep(4);
      } catch (error) {
        console.error('Subscription failed:', error);
      }
    }
  };

  const handleTestNotification = async () => {
    await PushNotificationService.sendTestNotification();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const getInstructions = () => {
    if (deviceType === 'ios') {
      return {
        title: 'Enable Notifications on iPhone/iPad',
        steps: [
          {
            step: 1,
            title: 'Add to Home Screen',
            description: 'Tap the Share button (square with arrow) at the bottom of Safari',
            icon: '📤'
          },
          {
            step: 2,
            title: 'Select "Add to Home Screen"',
            description: 'Scroll down and tap "Add to Home Screen"',
            icon: '➕'
          },
          {
            step: 3,
            title: 'Open CollEco from Home Screen',
            description: 'Launch the app from your home screen (not Safari)',
            icon: '🏠'
          },
          {
            step: 4,
            title: 'Enable Notifications',
            description: 'When prompted, tap "Allow" to receive notifications',
            icon: '🔔'
          }
        ]
      };
    } else if (deviceType === 'android') {
      return {
        title: 'Enable Notifications on Android',
        steps: [
          {
            step: 1,
            title: 'Install App',
            description: 'Tap the "Install" or "Add to Home screen" prompt in Chrome',
            icon: '📲'
          },
          {
            step: 2,
            title: 'Open CollEco App',
            description: 'Launch CollEco from your home screen or app drawer',
            icon: '🏠'
          },
          {
            step: 3,
            title: 'Allow Notifications',
            description: 'Tap "Allow" when asked for notification permission',
            icon: '🔔'
          },
          {
            step: 4,
            title: 'Configure Sounds',
            description: 'Long-press a notification to customize sound and vibration',
            icon: '🔊'
          }
        ]
      };
    } else {
      return {
        title: 'Enable Desktop Notifications',
        steps: [
          {
            step: 1,
            title: 'Click "Allow"',
            description: 'When the browser asks for notification permission, click "Allow"',
            icon: '🔔'
          },
          {
            step: 2,
            title: 'Test It Out',
            description: 'Send a test notification to make sure everything works',
            icon: '✅'
          }
        ]
      };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🔔</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          CollEco in Your Pocket
        </h2>
        <p className="text-gray-600">
          Stay connected with instant notifications - get a ping, vibration, and the CollEco logo on your notification bar
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              {step < 4 && (
                <div
                  className={`h-1 w-16 mx-2 ${
                    currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Install</span>
          <span>Open</span>
          <span>Allow</span>
          <span>Done</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Step 1: Install CollEco App
            </h3>
            <p className="text-gray-600 mb-6">
              Install CollEco on your {deviceType === 'ios' ? 'iPhone/iPad' : deviceType === 'android' ? 'Android device' : 'device'} for the best notification experience.
            </p>

            {!isInstalled && deviceType !== 'desktop' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {deviceType === 'ios' ? '📱 iPhone/iPad Instructions:' : '📲 Android Instructions:'}
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  {instructions.steps.slice(0, 3).map((inst, idx) => (
                    <li key={idx}>{inst.description}</li>
                  ))}
                </ol>
              </div>
            )}

            {isInstalled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">App Installed! ✓</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              {isInstalled ? 'Next Step' : 'I\u2019ve Installed the App'}
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Step 2: Enable Notifications
            </h3>
            <p className="text-gray-600 mb-6">
              Allow CollEco to send you notifications so you never miss important updates.
            </p>

            {!hasPermission && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  When you tap &quot;Enable Notifications&quot; below, your browser will ask for permission. Make sure to tap &quot;Allow&quot;!
                </p>
              </div>
            )}

            {hasPermission && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Notifications Enabled! ✓</span>
                </div>
              </div>
            )}

            <button
              onClick={handleEnableNotifications}
              disabled={hasPermission}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed mb-3"
            >
              {hasPermission ? 'Notifications Enabled ✓' : 'Enable Notifications'}
            </button>

            {hasPermission && (
              <button
                onClick={() => setCurrentStep(3)}
                className="w-full py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Next Step
              </button>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Step 3: Test Your Notifications
            </h3>
            <p className="text-gray-600 mb-6">
              Send a test notification to make sure everything is working correctly.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <img src="/assets/icons/colleco-logo-72.png" alt="CollEco" className="w-12 h-12" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">What you'll see:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>📱 CollEco logo on your notification bar</li>
                    <li>📳 Vibration pattern (double ping)</li>
                    <li>🔊 Notification sound (if enabled)</li>
                    <li>💬 Message preview</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleTestNotification}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition mb-3"
            >
              📲 Send Test Notification
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="w-full py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              I Received It! Continue
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set! 🎉
              </h3>
              <p className="text-gray-600">
                CollEco is now your office in your pocket. You'll receive instant notifications for:
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">💬</span>
                <div>
                  <h4 className="font-semibold text-gray-900">New Messages</h4>
                  <p className="text-sm text-gray-600">Partner and client messages</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📋</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Bookings</h4>
                  <p className="text-sm text-gray-600">New bookings and updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Payments</h4>
                  <p className="text-sm text-gray-600">Payment confirmations</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📄</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Quotes</h4>
                  <p className="text-sm text-gray-600">Quote requests and updates</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Start Using CollEco
            </button>
          </div>
        )}
      </div>

      {/* Help Section */}
      {showInstructions && (
        <div className="bg-gray-50 rounded-lg p-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-semibold text-gray-900">Need Help?</span>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className="mt-4 space-y-2">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-700">
                I don't see the install prompt
              </summary>
              <p className="mt-2 text-gray-600 pl-4">
                {deviceType === 'ios' 
                  ? 'On iOS, tap the Share button at the bottom of Safari and select "Add to Home Screen".'
                  : 'On Android, look for the "Install" banner at the top or bottom of the page. If you don\'t see it, tap the menu (⋮) and select "Install app" or "Add to Home screen".'}
              </p>
            </details>
            
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-700">
                Notifications aren't working
              </summary>
              <p className="mt-2 text-gray-600 pl-4">
                Make sure you've allowed notifications in your device settings. Go to Settings → Apps → CollEco → Notifications and enable them.
              </p>
            </details>
            
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-700">
                How do I customize notification sounds?
              </summary>
              <p className="mt-2 text-gray-600 pl-4">
                On Android, long-press any CollEco notification and tap "Settings" to customize sound, vibration, and LED color. On iOS, go to Settings → Notifications → CollEco.
              </p>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNotificationSetup;
