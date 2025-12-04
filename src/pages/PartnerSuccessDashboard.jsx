import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  DollarSign,
  Users,
  Star,
  Calendar,
} from 'lucide-react';
import {
  getPartnerMetrics,
  updatePartnerTier,
  getPerformanceSummary,
  getPartnerInsights,
  getTierProgression,
} from '../utils/partnerMetrics';
import {
  analyzeCompetitors,
  compareWithCompetitors,
  getPricingStrategy,
  analyzeRevenueOpportunities,
} from '../utils/competitorBenchmarking';
import {
  calculateRevenueAnalytics,
  calculateOccupancyAnalytics,
  calculateGuestSatisfactionAnalytics,
  calculateBookingAnalytics,
  calculatePerformanceScore,
} from '../utils/partnerAnalyticsEngine';

export default function PartnerSuccessDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const partnerId = localStorage.getItem('colleco.partner.id') || 'partner_demo';
    
    // Load or create metrics
    let partnerMetrics = getPartnerMetrics(partnerId);
    
    // Demo data if empty
    if (partnerMetrics.bookings.total === 0) {
      partnerMetrics = {
        ...partnerMetrics,
        revenue: {
          ...partnerMetrics.revenue,
          thisMonth: 28500,
          lastMonth: 24200,
          thisYear: 320000,
          total: 320000,
          trend: 17.8,
          history: [
            { month: '2025-01', amount: 22000 },
            { month: '2025-02', amount: 23500 },
            { month: '2025-03', amount: 25000 },
            { month: '2025-04', amount: 24200 },
            { month: '2025-05', amount: 26000 },
            { month: '2025-06', amount: 27500 },
            { month: '2025-07', amount: 28500 },
          ],
        },
        bookings: {
          total: 145,
          thisMonth: 24,
          completed: 140,
          cancelled: 5,
          pending: 2,
          completionRate: 96.6,
        },
        performance: {
          responseTime: 1.5,
          occupancyRate: 76,
          guestRating: 4.6,
          cancellationRate: 3.4,
          pricingOptimization: 12,
        },
        tier: 'gold',
        satisfaction: {
          averageRating: 4.6,
          reviewCount: 52,
          recommendationRate: 92,
          complaintCount: 2,
        },
        inventory: {
          totalListings: 3,
          activeListings: 3,
          vacantDays: 87,
          oversoldDays: 0,
        },
      };
    }
    
    // Update tier
    updatePartnerTier(partnerMetrics);
    setMetrics(partnerMetrics);
    
    // Load competitor analysis
    const competitorAnalysis = analyzeCompetitors(
      partnerId,
      'hotel',
      'durban',
      2500
    );
    setAnalysis(competitorAnalysis);
    
    // Calculate all analytics
    setAnalytics({
      revenue: calculateRevenueAnalytics(partnerMetrics),
      occupancy: calculateOccupancyAnalytics(partnerMetrics),
      satisfaction: calculateGuestSatisfactionAnalytics(partnerMetrics),
      bookings: calculateBookingAnalytics(partnerMetrics),
      performance: calculatePerformanceScore(partnerMetrics),
    });
    
    setLoading(false);
  };

  if (loading || !metrics || !analytics) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin"><Zap className="w-8 h-8 text-brand-orange" /></div></div>;
  }

  const summary = getPerformanceSummary(metrics);
  const insights = getPartnerInsights(metrics);
  const opportunities = analyzeRevenueOpportunities(analysis, metrics);
  const comparison = compareWithCompetitors(analysis);
  const strategies = getPricingStrategy(analysis, metrics);

  const StatCard = ({ icon: Icon, label, value, trend, unit = '' }) => (
    <div className="bg-white rounded-lg p-4 border border-cream-border hover:border-brand-orange/20 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-brand-brown/60">{label}</p>
          <p className="text-2xl font-bold text-brand-brown mt-1">{value}{unit}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'}
            </div>
          )}
        </div>
        <div className="text-brand-orange/20">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-brown mb-2">Partner Success Dashboard</h1>
          <p className="text-brand-brown/60">Maximize your revenue with data-driven insights and recommendations</p>
        </div>

        {/* Tier Badge */}
        <div className="bg-gradient-to-r from-brand-orange/10 to-orange-100 rounded-xl p-6 mb-8 border border-brand-orange/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-brown/60 mb-1">Current Partner Tier</p>
              <p className="text-3xl font-bold text-brand-brown">{summary.tierBadge} {summary.tier}</p>
              <p className="text-sm text-brand-brown/60 mt-2">Commission Rate: {summary.commission}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-brand-brown/60 mb-2">Progress to Next Tier</p>
              <div className="w-32 h-2 bg-white rounded-full border border-brand-orange/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-orange to-orange-500 transition-all duration-500"
                  style={{ width: `${summary.nextTierProgress}%` }}
                />
              </div>
              <p className="text-xs text-brand-brown/60 mt-1">{Math.round(summary.nextTierProgress)}%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-cream-border overflow-x-auto">
          {['overview', 'revenue', 'opportunities', 'benchmarking', 'insights'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium transition-colors capitalize whitespace-nowrap border-b-2 ${
                selectedTab === tab
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-brand-brown/60 hover:text-brand-brown'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon={DollarSign}
                label="Monthly Revenue"
                value={`R${metrics.revenue.thisMonth.toLocaleString()}`}
                trend={metrics.revenue.trend}
              />
              <StatCard
                icon={Users}
                label="Total Bookings"
                value={metrics.bookings.total}
                trend={8}
              />
              <StatCard
                icon={Star}
                label="Guest Rating"
                value={metrics.satisfaction.averageRating}
                unit="/5"
              />
              <StatCard
                icon={Target}
                label="Occupancy Rate"
                value={metrics.performance.occupancyRate}
                unit="%"
              />
              <StatCard
                icon={Calendar}
                label="Completion Rate"
                value={metrics.bookings.completionRate}
                unit="%"
              />
              <StatCard
                icon={BarChart3}
                label="Health Score"
                value={summary.healthScore}
                unit="/100"
              />
            </div>

            {/* Health Status */}
            <div className="bg-white rounded-lg p-6 border border-cream-border">
              <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-orange" />
                Partnership Health
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.revenue.insights).slice(0, 3).map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-cream rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-brand-brown">{insight[1].title}</p>
                      <p className="text-sm text-brand-brown/60">{insight[1].message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {selectedTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Metrics */}
              <div className="bg-white rounded-lg p-6 border border-cream-border">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Revenue Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-cream-border">
                    <span className="text-brand-brown/60">This Month</span>
                    <span className="font-bold">R{metrics.revenue.thisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-cream-border">
                    <span className="text-brand-brown/60">Last Month</span>
                    <span className="font-bold">R{metrics.revenue.lastMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-cream-border">
                    <span className="text-brand-brown/60">This Year</span>
                    <span className="font-bold">R{metrics.revenue.thisYear.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-brand-brown font-medium">Total Lifetime</span>
                    <span className="font-bold text-lg">R{metrics.revenue.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Commission Earnings */}
              <div className="bg-white rounded-lg p-6 border border-cream-border">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Commission Earnings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-cream-border">
                    <span className="text-brand-brown/60">Commission Rate</span>
                    <span className="font-bold">{summary.commission}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-cream-border">
                    <span className="text-brand-brown/60">Total Commissions</span>
                    <span className="font-bold">R{metrics.earnings.commissionEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-cream-border">
                    <span className="text-brand-brown/60">Bonus Earnings</span>
                    <span className="font-bold">R{metrics.earnings.bonusEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-brand-brown font-medium">Total Earnings</span>
                    <span className="font-bold text-lg text-green-600">R{metrics.earnings.totalEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Forecast */}
            <div className="bg-white rounded-lg p-6 border border-cream-border">
              <h3 className="text-lg font-bold text-brand-brown mb-4">Revenue Forecast</h3>
              <div className="space-y-2">
                {analytics.revenue.forecast.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                    <span className="text-sm text-brand-brown/60">Month {item.month}</span>
                    <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-brand-orange/20 to-brand-orange rounded-full" />
                    <span className="font-bold">R{item.projected.toLocaleString()}</span>
                    <span className="text-xs text-brand-brown/40 ml-2">{item.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Tab */}
        {selectedTab === 'opportunities' && (
          <div className="space-y-6">
            {opportunities.length > 0 ? (
              opportunities.map((opp, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6 border border-cream-border hover:border-brand-orange/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="text-brand-orange bg-brand-orange/10 p-3 rounded-lg">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-brown mb-1">{opp.name}</h3>
                      <p className="text-sm text-brand-brown/60 mb-3">{opp.description}</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-brand-brown/60">Revenue Impact</p>
                          <p className="font-bold text-green-600">+R{opp.impact.toLocaleString()}/year</p>
                        </div>
                        <div>
                          <p className="text-xs text-brand-brown/60">Implementation</p>
                          <p className="font-bold text-brand-brown">{opp.timeToImplement}</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors">
                        Learn More →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-cream-border">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-brand-brown font-medium">You're optimized!</p>
                <p className="text-sm text-brand-brown/60">No immediate opportunities identified.</p>
              </div>
            )}
          </div>
        )}

        {/* Benchmarking Tab */}
        {selectedTab === 'benchmarking' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Comparison */}
              <div className="bg-white rounded-lg p-6 border border-cream-border">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Price Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-brand-brown/60">Your Price</p>
                    <p className="text-2xl font-bold text-brand-brown">R{comparison.priceComparison.yourPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-brown/60">Market Average</p>
                    <p className="text-2xl font-bold text-brand-brown/60">R{comparison.priceComparison.avgPrice}</p>
                  </div>
                  <div className="pt-3 border-t border-cream-border">
                    <p className="text-sm font-medium text-brand-brown/60">Position</p>
                    <p className="text-lg font-bold capitalize text-brand-orange">{comparison.priceComparison.position}</p>
                    <p className="text-xs text-brand-brown/60 mt-1">
                      {comparison.priceComparison.percentageDifference > 0 ? '+' : ''}{comparison.priceComparison.percentageDifference}% vs market
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Insights */}
              <div className="bg-white rounded-lg p-6 border border-cream-border">
                <h3 className="text-lg font-bold text-brand-brown mb-4">Market Position</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-cream rounded-lg">
                    <span className="text-sm text-brand-brown/60">Rating Benchmark</span>
                    <span className="font-bold">{comparison.ratingComparison.benchmark}/5</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cream rounded-lg">
                    <span className="text-sm text-brand-brown/60">Occupancy Target</span>
                    <span className="font-bold">{comparison.occupancyComparison.benchmark}%</span>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">
                      Your rating is above market average! 🎉
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Strategies */}
            <div>
              <h3 className="text-lg font-bold text-brand-brown mb-4">Recommended Strategies</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {strategies.map((strategy, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-5 border border-cream-border hover:border-brand-orange/20 transition-all">
                    <h4 className="font-bold text-brand-brown mb-2">{strategy.name}</h4>
                    <p className="text-xs text-brand-brown/60 mb-3">{strategy.description}</p>
                    <div className="space-y-2 text-xs mb-3">
                      <div>
                        <p className="text-brand-brown/60">Expected Occupancy</p>
                        <p className="font-bold">{strategy.expectedOccupancy}</p>
                      </div>
                      <div>
                        <p className="text-brand-brown/60">Est. Annual Revenue</p>
                        <p className="font-bold text-green-600">R{strategy.expectedRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {selectedTab === 'insights' && (
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className={`rounded-lg p-4 border-2 flex gap-3 ${
                  insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                  insight.type === 'opportunity' ? 'bg-blue-50 border-blue-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="mt-0.5">
                    {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-red-600" />}
                    {insight.type === 'opportunity' && <Lightbulb className="w-5 h-5 text-blue-600" />}
                    {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{insight.category}: {insight.message}</h4>
                    <p className="text-xs text-brand-brown/60">{insight.action}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-cream-border">
                <Award className="w-12 h-12 text-brand-orange mx-auto mb-3" />
                <p className="font-medium text-brand-brown">All metrics are excellent!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
