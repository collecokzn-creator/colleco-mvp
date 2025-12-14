import React, { useState, useEffect } from 'react';
import {
  Gift,
  Award,
  TrendingUp,
  Star,
  Users,
  Share2 as _Share2,
  Trophy,
  Zap,
  Target as _Target,
  ArrowRight as _ArrowRight,
  Copy,
  Check,
  Crown,
  Sparkles,
  ChevronRight as _ChevronRight,
  Lock,
  X,
} from 'lucide-react';
import {
  getLoyaltyData,
  getUserTier,
  LOYALTY_TIERS,
  BADGES,
  CHALLENGES as _CHALLENGES,
  pointsToCurrency,
  getNextTierInfo,
  getTierBenefits,
  redeemPoints,
} from '../utils/loyaltySystem';

export default function LoyaltyDashboard() {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [currentTier, setCurrentTier] = useState(null);
  const [nextTierInfo, setNextTierInfo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, badges, history, redeem
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(100);

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = () => {
    const data = getLoyaltyData();
    setLoyaltyData(data);
    setCurrentTier(getUserTier(data.totalPoints));
    setNextTierInfo(getNextTierInfo(data.totalPoints));
  };

  const copyReferralCode = () => {
    if (loyaltyData?.referralCode) {
      navigator.clipboard.writeText(loyaltyData.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRedeem = () => {
    if (!loyaltyData) return;
    
    const result = redeemPoints(redeemAmount, 'Booking credit');
    if (result.success) {
      loadLoyaltyData(); // Reload data
      setShowRedeemModal(false);
      alert(`Successfully redeemed ${redeemAmount} points for ${pointsToCurrency(redeemAmount).formatted} credit!`);
    } else {
      alert(result.error || 'Redemption failed');
    }
  };

  if (!loyaltyData || !currentTier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  const _tierColor = currentTier.color;
  const currencyValue = pointsToCurrency(loyaltyData.availablePoints);

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-brand-orange text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-orange to-orange-600 opacity-95"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
        }}></div>
        
        <div className="relative max-w-6xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-3">
                <Crown className="h-8 w-8 sm:h-10 sm:w-10" />
                CollEco Passport
              </h1>
              <p className="text-white/90 text-base sm:text-lg">Your journey to exclusive rewards</p>
            </div>
            
            {/* Tier Badge */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border-2 border-white shadow-xl text-center min-w-[180px]">
                  <div className="text-5xl mb-3">{currentTier.icon}</div>
                  <div className="text-2xl font-bold text-brand-brown">{currentTier.name}</div>
                  <div className="text-sm text-brand-orange font-semibold mt-2">{(currentTier.cashbackRate * 100).toFixed(0)}% cashback</div>
                </div>
                {!nextTierInfo.isMaxTier && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-brand-orange px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    {nextTierInfo.pointsNeeded.toLocaleString()} pts to {nextTierInfo.nextTier.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {!nextTierInfo.isMaxTier && (
            <div className="mt-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Progress to {nextTierInfo.nextTier.name}</span>
                <span className="font-bold">{nextTierInfo.progress.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-white/30 rounded-full overflow-hidden border border-white/40">
                <div
                  className="h-full bg-white shadow-sm transition-all duration-500"
                  style={{ width: `${nextTierInfo.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Points Summary Cards */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Available Points */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-orange/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-brand-orange" />
              </div>
              <div className="text-sm text-gray-600">Available Points</div>
            </div>
            <div className="text-3xl font-bold text-brand-brown mb-1">
              {loyaltyData.availablePoints.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Worth {currencyValue.formatted}
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-orange/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-brand-orange" />
              </div>
              <div className="text-sm text-brand-brown/70">Total Earned</div>
            </div>
            <div className="text-3xl font-bold text-brand-brown mb-1">
              {loyaltyData.totalPoints.toLocaleString()}
            </div>
            <div className="text-xs text-brand-brown/60">
              All-time points
            </div>
          </div>

          {/* Badges Earned */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-brand-orange/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-brand-orange" />
              </div>
              <div className="text-sm text-brand-brown/70">Badges Earned</div>
            </div>
            <div className="text-3xl font-bold text-brand-brown mb-1">
              {loyaltyData.earnedBadges.length}
            </div>
            <div className="text-xs text-brand-brown/60">
              {Object.keys(BADGES).length - loyaltyData.earnedBadges.length} to unlock
            </div>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 mt-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-brand-orange/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-2 text-brand-brown">
                <Users className="h-6 w-6 text-brand-orange" />
                Refer Friends, Get Rewarded
              </h3>
              <p className="text-brand-brown/70 mb-4">Give R500, Get R500 when they book!</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 bg-cream rounded-lg p-3 max-w-sm border border-brand-orange/20">
                <code className="text-lg font-mono font-bold flex-1 text-brand-brown">{loyaltyData.referralCode}</code>
                <button
                  onClick={copyReferralCode}
                  className="px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCode ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="text-4xl font-bold mb-1 text-brand-brown">{loyaltyData.referrals.converted.length}</div>
              <div className="text-sm text-brand-brown/70">Friends joined</div>
              <div className="text-xs text-brand-brown/60 mt-1">
                +{loyaltyData.referrals.totalEarned.toLocaleString()} pts earned
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Trophy },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'history', label: 'History', icon: TrendingUp },
              { id: 'redeem', label: 'Redeem', icon: Gift },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex-1 min-w-[100px] px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectedTab === tab.id
                    ? 'text-brand-orange border-b-2 border-brand-orange bg-orange-50'
                    : 'text-gray-600 hover:text-brand-orange hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Tier Benefits */}
                <div>
                  <h3 className="text-lg font-bold text-brand-brown mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-brand-orange" />
                    Your {currentTier.name} Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getTierBenefits(currentTier.id).map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-cream/50 rounded-lg">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Tiers Overview */}
                <div>
                  <h3 className="text-lg font-bold text-brand-brown mb-4">All Tiers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.values(LOYALTY_TIERS).map(tier => (
                      <div
                        key={tier.id}
                        className={`relative rounded-xl p-4 border-2 transition-all ${
                          tier.id === currentTier.id
                            ? 'border-brand-orange bg-orange-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {tier.id === currentTier.id && (
                          <div className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-full">
                            YOU
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-4xl mb-2">{tier.icon}</div>
                          <div className="font-bold text-lg mb-1">{tier.name}</div>
                          <div className="text-xs text-gray-600 mb-2">
                            {tier.minPoints.toLocaleString()}+ points
                          </div>
                          <div className="text-sm font-semibold text-brand-orange">
                            {(tier.cashbackRate * 100).toFixed(0)}% cashback
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'badges' && (
              <div>
                <h3 className="text-lg font-bold text-brand-brown mb-4">Badge Collection</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.values(BADGES).map(badge => {
                    const earned = loyaltyData.earnedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`relative rounded-xl p-4 text-center transition-all ${
                          earned
                            ? 'bg-gradient-to-br from-brand-orange/10 to-orange-100 border-2 border-brand-orange shadow-lg'
                            : 'bg-gray-100 border-2 border-gray-200 opacity-60'
                        }`}
                      >
                        {!earned && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                            <Lock className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <div className="font-bold text-sm mb-1">{badge.name}</div>
                        <div className="text-xs text-gray-600 mb-2">{badge.description}</div>
                        <div className="text-xs font-semibold text-brand-orange">
                          +{badge.points} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTab === 'history' && (
              <div>
                <h3 className="text-lg font-bold text-brand-brown mb-4">Points History</h3>
                {loyaltyData.history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No activity yet. Start earning points!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loyaltyData.history.slice(0, 50).map(transaction => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-brand-brown">{transaction.reason}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'earn' ? '+' : ''}
                          {transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'redeem' && (
              <div>
                <h3 className="text-lg font-bold text-brand-brown mb-4">Redeem Points</h3>
                
                <div className="bg-cream rounded-xl p-6 mb-6 border-2 border-brand-orange/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-brand-brown/70 mb-1">Available to Redeem</div>
                      <div className="text-3xl font-bold text-brand-brown">
                        {loyaltyData.availablePoints.toLocaleString()} pts
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-brand-brown/70 mb-1">Value</div>
                      <div className="text-2xl font-bold text-brand-orange">
                        {currencyValue.formatted}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-brand-brown/60">
                    Rate: 100 points = R1
                  </div>
                </div>

                <button
                  onClick={() => setShowRedeemModal(true)}
                  disabled={loyaltyData.availablePoints < 100}
                  className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Gift className="h-5 w-5" />
                  Redeem Points for Credit
                </button>

                <div className="mt-6 p-4 bg-cream rounded-lg border-2 border-brand-orange/20">
                  <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-brand-orange flex-shrink-0" />
                    <div className="text-sm text-brand-brown/80">
                      <strong>How it works:</strong> Convert your points to booking credit that can be applied to any future reservation. Credits never expire!
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-brand-brown">Redeem Points</h3>
              <button onClick={() => setShowRedeemModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points to Redeem
              </label>
              <input
                type="number"
                min="100"
                step="100"
                max={loyaltyData.availablePoints}
                value={redeemAmount}
                onChange={e => setRedeemAmount(Math.min(parseInt(e.target.value) || 100, loyaltyData.availablePoints))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:outline-none text-lg font-semibold"
              />
              <div className="mt-2 text-sm text-gray-600">
                You&apos;ll receive: <strong className="text-brand-orange">{pointsToCurrency(redeemAmount).formatted}</strong> credit
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRedeem}
                className="w-full py-3 bg-brand-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
              >
                Confirm Redemption
              </button>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
