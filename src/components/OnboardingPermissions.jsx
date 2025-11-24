import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { PushNotificationService } from '../components/NotificationCenter';

/**
 * OnboardingPermissions - First-time app setup wizard
 * 
 * Requests all necessary permissions when user first installs/opens the app:
 * - Location access (for nearby experiences, weather, maps)
 * - Push notifications (for bookings, payments, messages)
 * - Camera access (for profile photos, document uploads, check-ins)
 * - Storage access (for offline itineraries, cached data)
 */
const OnboardingPermissions = ({ onComplete }) => {
  const { user } = useContext(UserContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState({
    location: 'prompt', // 'prompt', 'granted', 'denied'
    notifications: 'prompt',
    camera: 'prompt',
    storage: 'granted' // Always available in browsers
  });
  const [skipped, setSkipped] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    const newPermissions = { ...permissions };

    // Check notification permission
    if ('Notification' in window) {
      newPermissions.notifications = Notification.permission;
    }

    // Check geolocation permission
    if ('permissions' in navigator) {
      try {
        const locationPerm = await navigator.permissions.query({ name: 'geolocation' });
        newPermissions.location = locationPerm.state;
      } catch (e) {
        // Some browsers don't support permissions API for geolocation
      }
    }

    setPermissions(newPermissions);
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false
        });
      });

      // Save location to localStorage
      localStorage.setItem('colleco.location', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      }));

      setPermissions(prev => ({ ...prev, location: 'granted' }));
      setCurrentStep(1);
    } catch (error) {
      console.error('Location permission denied:', error);
      setPermissions(prev => ({ ...prev, location: 'denied' }));
      setSkipped(prev => [...prev, 'location']);
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    setLoading(true);
    try {
      const granted = await PushNotificationService.requestPermission();
      
      if (granted && user?.id) {
        await PushNotificationService.subscribeToNotifications(user.id);
        setPermissions(prev => ({ ...prev, notifications: 'granted' }));
        
        // Send welcome notification
        await PushNotificationService.sendTestNotification();
      } else {
        setPermissions(prev => ({ ...prev, notifications: 'denied' }));
        setSkipped(prev => [...prev, 'notifications']);
      }
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Notification permission error:', error);
      setPermissions(prev => ({ ...prev, notifications: 'denied' }));
      setSkipped(prev => [...prev, 'notifications']);
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    setLoading(true);
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      setPermissions(prev => ({ ...prev, camera: 'granted' }));
      setCurrentStep(3);
    } catch (error) {
      console.error('Camera permission denied:', error);
      setPermissions(prev => ({ ...prev, camera: 'denied' }));
      setSkipped(prev => [...prev, 'camera']);
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const permissionTypes = ['location', 'notifications', 'camera'];
    setSkipped(prev => [...prev, permissionTypes[currentStep]]);
    setCurrentStep(currentStep + 1);
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem('colleco.onboarding.completed', 'true');
    localStorage.setItem('colleco.onboarding.permissions', JSON.stringify(permissions));
    localStorage.setItem('colleco.onboarding.skipped', JSON.stringify(skipped));
    
    if (onComplete) {
      onComplete(permissions, skipped);
    }
  };

  const steps = [
    {
      id: 'location',
      icon: '📍',
      title: 'Enable Location Access',
      description: 'Get personalized travel recommendations based on your location',
      benefits: [
        '🗺️ Find nearby experiences and attractions',
        '🌤️ Local weather updates for your trips',
        '🚗 Accurate directions and navigation',
        '✈️ Airport proximity and flight updates'
      ],
      action: requestLocationPermission,
      buttonText: 'Enable Location',
      required: false
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Enable Push Notifications',
      description: 'Never miss booking confirmations, payments, or important updates',
      benefits: [
        '📋 Instant booking confirmations',
        '💰 Payment alerts and receipts',
        '💬 Messages from partners and clients',
        '⚠️ Flight delays and travel alerts'
      ],
      action: requestNotificationPermission,
      buttonText: 'Enable Notifications',
      required: false
    },
    {
      id: 'camera',
      icon: '📷',
      title: 'Allow Camera Access',
      description: 'Quickly upload profile photos, documents, and check-in selfies',
      benefits: [
        '👤 Take profile photos instantly',
        '📄 Scan and upload travel documents',
        '✅ Self check-in with photo verification',
        '📸 Capture memorable travel moments'
      ],
      action: requestCameraPermission,
      buttonText: 'Allow Camera',
      required: false
    }
  ];

  const currentStepData = steps[currentStep];

  if (currentStep >= steps.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re All Set!</h2>
          <p className="text-gray-600 mb-6">
            Welcome to CollEco! Your office in your pocket.
          </p>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-900 mb-3">Permissions Summary:</p>
            <div className="space-y-2">
              {steps.map((step) => {
                const status = permissions[step.id];
                return (
                  <div key={step.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {step.icon} {step.title.replace('Enable ', '').replace('Allow ', '')}
                    </span>
                    <span className={`text-xs font-medium ${
                      status === 'granted' ? 'text-green-600' : 
                      status === 'denied' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {status === 'granted' ? '✅ Enabled' : 
                       status === 'denied' ? '❌ Denied' : 
                       '⏭️ Skipped'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {skipped.length > 0 && (
            <p className="text-xs text-gray-500 mb-6">
              You can enable skipped permissions anytime from Settings → Notifications
            </p>
          )}

          <button
            onClick={handleComplete}
            className="w-full bg-[#D2691E] text-white px-6 py-3 rounded-lg hover:bg-[#B8591A] transition-colors font-medium"
          >
            Start Using CollEco
          </button>
        </div>
      </div>
    );
  }

  if (!currentStepData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#D2691E] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-3">{currentStepData.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 text-sm">
            {currentStepData.description}
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-[#FFF8F1] border border-[#D2691E] rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-gray-900 mb-3">Why enable this?</p>
          <ul className="space-y-2">
            {currentStepData.benefits.map((benefit, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="flex-shrink-0">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Permission status message */}
        {permissions[currentStepData.id] === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-red-800">
              ⚠️ This permission was previously denied. To enable it, please update your browser/device settings.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={currentStepData.action}
            disabled={loading || permissions[currentStepData.id] === 'granted'}
            className="w-full bg-[#D2691E] text-white px-6 py-3 rounded-lg hover:bg-[#B8591A] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? '⏳ Processing...' : 
             permissions[currentStepData.id] === 'granted' ? '✅ Enabled' :
             currentStepData.buttonText}
          </button>

          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Skip for Now
          </button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Your privacy matters. You can change these permissions anytime in settings.
        </p>
      </div>
    </div>
  );
};

export default OnboardingPermissions;
