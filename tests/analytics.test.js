import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  trackDownload,
  trackInstallation,
  trackUpdate,
  getDownloadStats,
  getDownloadsByDateRange,
  getTopDownloadSources,
  getTopDownloadCountries,
  getDeviceBreakdown,
  clearDownloadRecords,
  exportDownloadsAsCSV
} from '../src/utils/downloadTracker.js';
import {
  startSession,
  endSession,
  trackPageView,
  trackFeatureUsage,
  trackConversion,
  trackAction,
  getUsageStats,
  getFeatureAdoption,
  getUserJourney,
  getConversionFunnel,
  getTopPages,
  getBounceRate,
  getAverageSessionDuration,
  getPeakUsageTimes,
  getRetentionRate,
  clearUsageData
} from '../src/utils/usageAnalytics.js';

describe('Download Tracking System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearDownloadRecords();
  });

  describe('Download Tracking', () => {
    it('should track app download', async () => {
      const download = await trackDownload('app-store');
      
      expect(download).toBeDefined();
      expect(download.source).toBe('app-store');
      expect(download.device).toBeDefined();
      expect(download.location).toBeDefined();
      expect(download.timestamp).toBeDefined();
    });

    it('should track download from different sources', async () => {
      await trackDownload('app-store');
      await trackDownload('play-store');
      await trackDownload('website');
      
      const stats = getDownloadStats();
      expect(stats.totalDownloads).toBe(3);
      expect(stats.bySource['app-store']).toBe(1);
      expect(stats.bySource['play-store']).toBe(1);
      expect(stats.bySource['website']).toBe(1);
    });

    it('should detect device information', async () => {
      const download = await trackDownload('direct');
      
      expect(download.device.os).toBeDefined();
      expect(download.device.browser).toBeDefined();
      expect(download.device.deviceType).toBeDefined();
      expect(download.device.userAgent).toBeDefined();
    });

    it('should get geolocation information', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          country_name: 'South Africa',
          country_code: 'ZA',
          region: 'KwaZulu-Natal',
          city: 'Durban',
          latitude: -29.8683,
          longitude: 31.0192,
          timezone: 'Africa/Johannesburg'
        })
      });

      const download = await trackDownload('direct');
      
      expect(download.location).toBeDefined();
      expect(download.location.country).toBeDefined();
      expect(download.location.timezone).toBeDefined();
    });
  });

  describe('Installation Tracking', () => {
    it('should track first installation', async () => {
      const installation = await trackInstallation('first-launch');
      
      expect(installation).toBeDefined();
      expect(installation.type).toBe('first-launch');
    });

    it('should not track installation twice', async () => {
      await trackInstallation('first-launch');
      const second = await trackInstallation('first-launch');
      
      expect(second).toBeNull();
    });

    it('should track updates', async () => {
      const update = await trackUpdate('1.0.0', '1.1.0');
      
      expect(update).toBeDefined();
      expect(update.fromVersion).toBe('1.0.0');
      expect(update.toVersion).toBe('1.1.0');
    });
  });

  describe('Download Statistics', () => {
    beforeEach(async () => {
      await trackDownload('app-store');
      await trackDownload('app-store');
      await trackDownload('play-store');
      await trackDownload('website');
    });

    it('should calculate total downloads', () => {
      const stats = getDownloadStats();
      expect(stats.totalDownloads).toBe(4);
    });

    it('should aggregate by source', () => {
      const stats = getDownloadStats();
      expect(stats.bySource['app-store']).toBe(2);
      expect(stats.bySource['play-store']).toBe(1);
      expect(stats.bySource['website']).toBe(1);
    });

    it('should aggregate by OS', () => {
      const stats = getDownloadStats();
      expect(stats.byOS).toBeDefined();
      expect(Object.keys(stats.byOS).length).toBeGreaterThan(0);
    });

    it('should aggregate by device type', () => {
      const stats = getDownloadStats();
      expect(stats.byDevice).toBeDefined();
    });

    it('should get top download sources', () => {
      const top = getTopDownloadSources(2);
      expect(top).toBeDefined();
      expect(Array.isArray(top)).toBe(true);
    });

    it('should get top download countries', () => {
      const top = getTopDownloadCountries(5);
      expect(top).toBeDefined();
      expect(Array.isArray(top)).toBe(true);
    });

    it('should get device breakdown', () => {
      const breakdown = getDeviceBreakdown();
      expect(breakdown.byOS).toBeDefined();
      expect(breakdown.byDevice).toBeDefined();
      expect(breakdown.byBrowser).toBeDefined();
    });

    it('should count unique countries', () => {
      const stats = getDownloadStats();
      expect(stats.uniqueCountries).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Date Range Filtering', () => {
    beforeEach(async () => {
      await trackDownload('app-store');
    });

    it('should filter downloads by date range', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const downloads = getDownloadsByDateRange(yesterday, now);
      expect(downloads.length).toBeGreaterThan(0);
    });

    it('should return empty for future date range', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const future = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
      
      const downloads = getDownloadsByDateRange(tomorrow, future);
      expect(downloads.length).toBe(0);
    });
  });

  describe('Data Export', () => {
    beforeEach(async () => {
      await trackDownload('app-store');
      await trackDownload('play-store');
    });

    it('should export downloads as CSV', () => {
      const csv = exportDownloadsAsCSV();
      expect(csv).toBeDefined();
      expect(csv.length).toBeGreaterThan(0);
      expect(csv.includes('ID')).toBe(true);
      expect(csv.includes('Timestamp')).toBe(true);
    });

    it('should return empty string when no downloads', () => {
      clearDownloadRecords();
      const csv = exportDownloadsAsCSV();
      expect(csv).toBe('');
    });
  });
});

describe('Usage Analytics System', () => {
  beforeEach(() => {
    localStorage.clear();
    clearUsageData();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearUsageData();
  });

  describe('Session Management', () => {
    it('should start a session', () => {
      const session = startSession('user-1');
      
      expect(session).toBeDefined();
      expect(session.userId).toBe('user-1');
      expect(session.startTime).toBeDefined();
      expect(session.pageViews).toBe(0);
    });

    it('should end a session', () => {
      startSession('user-1');
      const ended = endSession();
      
      expect(ended).toBeDefined();
      expect(ended.endTime).toBeDefined();
      expect(ended.duration).toBeGreaterThanOrEqual(0);
    });

    it('should track session duration', () => {
      startSession('user-1');
      
      // Wait a bit
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);
      
      const ended = endSession();
      expect(ended.duration).toBeGreaterThan(0);
      
      vi.useRealTimers();
    });

    it('should handle multiple sessions', () => {
      startSession('user-1');
      endSession();
      
      startSession('user-2');
      endSession();
      
      const stats = getUsageStats();
      expect(stats.totalSessions).toBe(2);
      expect(stats.uniqueUsers).toBe(2);
    });
  });

  describe('Page View Tracking', () => {
    beforeEach(() => {
      startSession('user-1');
    });

    afterEach(() => {
      endSession();
    });

    it('should track page views', () => {
      trackPageView('/home');
      trackPageView('/search');
      
      const stats = getUsageStats();
      expect(stats.totalPageViews).toBe(2);
    });

    it('should track page view with metadata', () => {
      trackPageView('/booking', { bookingId: 'BOOK-123' });
      
      const stats = getUsageStats();
      expect(stats.totalPageViews).toBe(1);
    });

    it('should get top pages', () => {
      trackPageView('/home');
      trackPageView('/home');
      trackPageView('/search');
      
      const top = getTopPages(5);
      expect(Array.isArray(top)).toBe(true);
      expect(top[0].page).toBe('/home');
      expect(top[0].views).toBe(2);
    });

    it('should get user journey', () => {
      trackPageView('/home');
      trackPageView('/search');
      trackPageView('/booking');
      
      const journey = getUserJourney(startSession('user-1').id);
      expect(Array.isArray(journey)).toBe(true);
    });
  });

  describe('Feature Usage Tracking', () => {
    beforeEach(() => {
      startSession('user-1');
    });

    afterEach(() => {
      endSession();
    });

    it('should track feature views', () => {
      trackFeatureUsage('QuoteGenerator', 'view');
      trackFeatureUsage('QuoteGenerator', 'click');
      
      const adoption = getFeatureAdoption();
      expect(adoption).toBeDefined();
      expect(adoption.length).toBeGreaterThan(0);
    });

    it('should track feature actions', () => {
      trackFeatureUsage('PaymentProcessor', 'view');
      trackFeatureUsage('PaymentProcessor', 'submit');
      trackFeatureUsage('PaymentProcessor', 'complete');
      
      const stats = getUsageStats();
      expect(stats.featureStats.length).toBeGreaterThan(0);
    });

    it('should calculate feature adoption rate', () => {
      trackFeatureUsage('ItineraryBuilder', 'view');
      
      const adoption = getFeatureAdoption();
      expect(adoption.some(f => f.feature === 'ItineraryBuilder')).toBe(true);
    });

    it('should track feature errors', () => {
      trackFeatureUsage('BookingEngine', 'error', { errorCode: 500 });
      
      const adoption = getFeatureAdoption();
      expect(adoption).toBeDefined();
    });
  });

  describe('Conversion Tracking', () => {
    beforeEach(() => {
      startSession('user-1');
    });

    afterEach(() => {
      endSession();
    });

    it('should track conversions', () => {
      trackPageView('/booking');
      trackConversion('booking_completed', 500);
      
      const stats = getUsageStats();
      expect(stats.totalConversions).toBe(1);
    });

    it('should track conversion value', () => {
      trackConversion('booking_completed', 500);
      trackConversion('booking_completed', 750);
      
      const funnel = getConversionFunnel();
      expect(funnel.find(f => f.conversionType === 'booking_completed').count).toBe(2);
    });

    it('should calculate conversion rate', () => {
      trackPageView('/home');
      trackConversion('signup', 1);
      
      const stats = getUsageStats();
      expect(stats.conversionRate).toBeGreaterThan(0);
      expect(stats.conversionRate).toBeLessThanOrEqual(1);
    });

    it('should get conversion funnel', () => {
      trackConversion('view_product', 1);
      trackConversion('add_to_cart', 1);
      trackConversion('checkout', 1);
      
      const funnel = getConversionFunnel();
      expect(Array.isArray(funnel)).toBe(true);
      expect(funnel.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Actions', () => {
    beforeEach(() => {
      startSession('user-1');
    });

    afterEach(() => {
      endSession();
    });

    it('should track custom actions', () => {
      trackAction('user_login');
      trackAction('filter_applied', { filters: ['price', 'rating'] });
      
      const stats = getUsageStats();
      expect(stats.totalSessions).toBe(1);
    });
  });

  describe('Usage Statistics', () => {
    it('should calculate usage stats', () => {
      startSession('user-1');
      trackPageView('/home');
      trackPageView('/search');
      trackConversion('view_product', 1);
      endSession();
      
      const stats = getUsageStats();
      expect(stats.totalSessions).toBe(1);
      expect(stats.totalPageViews).toBe(2);
      expect(stats.totalConversions).toBe(1);
      expect(stats.avgSessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should calculate bounce rate', () => {
      startSession('user-1');
      trackPageView('/home');
      endSession();
      
      startSession('user-2');
      trackPageView('/home');
      trackPageView('/search');
      endSession();
      
      const bounceRate = getBounceRate();
      expect(bounceRate).toBe(50); // 1 bounced out of 2
    });

    it('should calculate average session duration', () => {
      startSession('user-1');
      endSession();
      
      const avg = getAverageSessionDuration();
      expect(avg).toBeGreaterThanOrEqual(0);
    });

    it('should get peak usage times', () => {
      startSession('user-1');
      trackPageView('/home');
      endSession();
      
      const peak = getPeakUsageTimes();
      expect(Array.isArray(peak)).toBe(true);
    });

    it('should calculate retention rate', () => {
      startSession('user-1');
      trackPageView('/home');
      endSession();
      
      const retention = getRetentionRate(7);
      expect(retention).toBeGreaterThanOrEqual(0);
      expect(retention).toBeLessThanOrEqual(100);
    });
  });

  describe('Time Range Filtering', () => {
    beforeEach(() => {
      startSession('user-1');
      trackPageView('/home');
      endSession();
    });

    it('should filter stats by 24 hour range', () => {
      const stats = getUsageStats('24h');
      expect(stats.timeRange).toBe('24h');
      expect(stats.totalPageViews).toBeGreaterThanOrEqual(0);
    });

    it('should filter stats by 7 day range', () => {
      const stats = getUsageStats('7d');
      expect(stats.timeRange).toBe('7d');
    });

    it('should filter stats by 30 day range', () => {
      const stats = getUsageStats('30d');
      expect(stats.timeRange).toBe('30d');
    });

    it('should filter stats by 90 day range', () => {
      const stats = getUsageStats('90d');
      expect(stats.timeRange).toBe('90d');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data across sessions', () => {
      startSession('user-1');
      trackPageView('/home');
      endSession();
      
      const stats1 = getUsageStats();
      const stats2 = getUsageStats();
      
      expect(stats1.totalPageViews).toBe(stats2.totalPageViews);
    });

    it('should handle anonymous users', () => {
      startSession(); // No userId
      trackPageView('/home');
      endSession();
      
      const stats = getUsageStats();
      expect(stats.totalSessions).toBe(1);
    });

    it('should limit stored records', () => {
      for (let i = 0; i < 100; i++) {
        startSession(`user-${i}`);
        trackPageView('/home');
        endSession();
      }
      
      const stats = getUsageStats();
      expect(stats.totalSessions).toBeGreaterThan(0);
    });
  });

  describe('Feature Adoption', () => {
    beforeEach(() => {
      startSession('user-1');
    });

    afterEach(() => {
      endSession();
    });

    it('should rank features by adoption', () => {
      trackFeatureUsage('QuoteGenerator', 'view');
      trackFeatureUsage('QuoteGenerator', 'view');
      trackFeatureUsage('PaymentProcessor', 'view');
      
      const adoption = getFeatureAdoption();
      expect(adoption[0].feature).toBe('QuoteGenerator');
    });

    it('should show adoption percentage', () => {
      trackFeatureUsage('Feature1', 'view');
      
      const adoption = getFeatureAdoption();
      expect(adoption.some(f => f.adoptionRate)).toBe(true);
    });

    it('should track first and last use', () => {
      trackFeatureUsage('Feature1', 'view');
      
      const adoption = getFeatureAdoption();
      expect(adoption[0]).toHaveProperty('firstUsed');
      expect(adoption[0]).toHaveProperty('lastUsed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty usage data', () => {
      const stats = getUsageStats();
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalPageViews).toBe(0);
      expect(stats.avgSessionDuration).toBe(0);
    });

    it('should handle session without end', () => {
      startSession('user-1');
      const stats = getUsageStats();
      expect(stats.totalSessions).toBe(1);
    });

    it('should track events without session', () => {
      trackPageView('/home');
      trackConversion('signup', 1);
      
      const stats = getUsageStats();
      expect(stats.totalPageViews).toBe(1);
      expect(stats.totalConversions).toBe(1);
    });
  });
});
