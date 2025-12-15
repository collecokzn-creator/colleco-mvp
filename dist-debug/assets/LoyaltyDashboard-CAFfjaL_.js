import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { g as getLoyaltyData, h as getUserTier, i as getNextTierInfo, p as pointsToCurrency, B as BADGES, j as getTierBenefits, k as LOYALTY_TIERS, r as redeemPoints } from "./index-DlOecmR0.js";
import { z as Crown, E as Sparkles, T as TrendingUp, G as Award, U as Users, I as Check, J as Copy, u as Trophy, K as Gift, x as Star, N as Lock, Z as Zap, X } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function LoyaltyDashboard() {
  const [loyaltyData, setLoyaltyData] = reactExports.useState(null);
  const [currentTier, setCurrentTier] = reactExports.useState(null);
  const [nextTierInfo, setNextTierInfo] = reactExports.useState(null);
  const [copiedCode, setCopiedCode] = reactExports.useState(false);
  const [selectedTab, setSelectedTab] = reactExports.useState("overview");
  const [showRedeemModal, setShowRedeemModal] = reactExports.useState(false);
  const [redeemAmount, setRedeemAmount] = reactExports.useState(100);
  reactExports.useEffect(() => {
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
      setTimeout(() => setCopiedCode(false), 2e3);
    }
  };
  const handleRedeem = () => {
    if (!loyaltyData) return;
    const result = redeemPoints(redeemAmount, "Booking credit");
    if (result.success) {
      loadLoyaltyData();
      setShowRedeemModal(false);
      alert(`Successfully redeemed ${redeemAmount} points for ${pointsToCurrency(redeemAmount).formatted} credit!`);
    } else {
      alert(result.error || "Redemption failed");
    }
  };
  if (!loyaltyData || !currentTier) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent" }) });
  }
  currentTier.color;
  const currencyValue = pointsToCurrency(loyaltyData.availablePoints);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-cream pb-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden bg-brand-orange text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-brand-orange via-brand-orange to-orange-600 opacity-95" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
        backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-6xl mx-auto px-3 sm:px-6 py-8 sm:py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center sm:text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl sm:text-4xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-8 w-8 sm:h-10 sm:w-10" }),
              "CollEco Passport"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/90 text-base sm:text-lg", children: "Your journey to exclusive rewards" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/95 backdrop-blur-md rounded-2xl p-6 border-2 border-white shadow-xl text-center min-w-[180px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl mb-3", children: currentTier.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-brand-brown", children: currentTier.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-brand-orange font-semibold mt-2", children: [
                (currentTier.cashbackRate * 100).toFixed(0),
                "% cashback"
              ] })
            ] }),
            !nextTierInfo.isMaxTier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-brand-orange px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap", children: [
              nextTierInfo.pointsNeeded.toLocaleString(),
              " pts to ",
              nextTierInfo.nextTier.name
            ] })
          ] }) })
        ] }),
        !nextTierInfo.isMaxTier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "Progress to ",
              nextTierInfo.nextTier.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
              nextTierInfo.progress.toFixed(0),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-white/30 rounded-full overflow-hidden border border-white/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-white shadow-sm transition-all duration-500",
              style: { width: `${nextTierInfo.progress}%` }
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-6xl mx-auto px-3 sm:px-6 -mt-8 relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border-2 border-brand-orange/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-brand-orange" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Available Points" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-brand-brown mb-1", children: loyaltyData.availablePoints.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
          "Worth ",
          currencyValue.formatted
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border-2 border-brand-orange/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-brand-orange" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70", children: "Total Earned" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-brand-brown mb-1", children: loyaltyData.totalPoints.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/60", children: "All-time points" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 border-2 border-brand-orange/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-5 w-5 text-brand-orange" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70", children: "Badges Earned" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-brand-brown mb-1", children: loyaltyData.earnedBadges.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-brown/60", children: [
          Object.keys(BADGES).length - loyaltyData.earnedBadges.length,
          " to unlock"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-6xl mx-auto px-3 sm:px-6 mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-brand-orange/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center sm:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-2xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-2 text-brand-brown", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6 text-brand-orange" }),
          "Refer Friends, Get Rewarded"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown/70 mb-4", children: "Give R500, Get R500 when they book!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center sm:justify-start gap-3 bg-cream rounded-lg p-3 max-w-sm border border-brand-orange/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-lg font-mono font-bold flex-1 text-brand-brown", children: loyaltyData.referralCode }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: copyReferralCode,
              className: "px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2",
              children: [
                copiedCode ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }),
                copiedCode ? "Copied!" : "Copy"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold mb-1 text-brand-brown", children: loyaltyData.referrals.converted.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70", children: "Friends joined" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-brown/60 mt-1", children: [
          "+",
          loyaltyData.referrals.totalEarned.toLocaleString(),
          " pts earned"
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-6xl mx-auto px-3 sm:px-6 mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b overflow-x-auto", children: [
        { id: "overview", label: "Overview", icon: Trophy },
        { id: "badges", label: "Badges", icon: Award },
        { id: "history", label: "History", icon: TrendingUp },
        { id: "redeem", label: "Redeem", icon: Gift }
      ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSelectedTab(tab.id),
          className: `flex-1 min-w-[100px] px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${selectedTab === tab.id ? "text-brand-orange border-b-2 border-brand-orange bg-orange-50" : "text-gray-600 hover:text-brand-orange hover:bg-gray-50"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(tab.icon, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: tab.label })
          ]
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6", children: [
        selectedTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5 text-brand-orange" }),
              "Your ",
              currentTier.name,
              " Benefits"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: getTierBenefits(currentTier.id).map((benefit, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 bg-cream/50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: benefit })
            ] }, idx)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "All Tiers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.values(LOYALTY_TIERS).map((tier) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `relative rounded-xl p-4 border-2 transition-all ${tier.id === currentTier.id ? "border-brand-orange bg-orange-50 shadow-lg scale-105" : "border-gray-200 bg-white hover:border-gray-300"}`,
                children: [
                  tier.id === currentTier.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-2 -right-2 bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-full", children: "YOU" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: tier.icon }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg mb-1", children: tier.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-600 mb-2", children: [
                      tier.minPoints.toLocaleString(),
                      "+ points"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold text-brand-orange", children: [
                      (tier.cashbackRate * 100).toFixed(0),
                      "% cashback"
                    ] })
                  ] })
                ]
              },
              tier.id
            )) })
          ] })
        ] }),
        selectedTab === "badges" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Badge Collection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", children: Object.values(BADGES).map((badge) => {
            const earned = loyaltyData.earnedBadges.includes(badge.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `relative rounded-xl p-4 text-center transition-all ${earned ? "bg-gradient-to-br from-brand-orange/10 to-orange-100 border-2 border-brand-orange shadow-lg" : "bg-gray-100 border-2 border-gray-200 opacity-60"}`,
                children: [
                  !earned && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-6 w-6 text-gray-400" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: badge.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm mb-1", children: badge.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-600 mb-2", children: badge.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-brand-orange", children: [
                    "+",
                    badge.points,
                    " pts"
                  ] })
                ]
              },
              badge.id
            );
          }) })
        ] }),
        selectedTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Points History" }),
          loyaltyData.history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No activity yet. Start earning points!" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: loyaltyData.history.slice(0, 50).map((transaction) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-brand-brown", children: transaction.reason }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: new Date(transaction.timestamp).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `text-lg font-bold ${transaction.type === "earn" ? "text-green-600" : "text-red-600"}`,
                    children: [
                      transaction.type === "earn" ? "+" : "",
                      transaction.amount.toLocaleString()
                    ]
                  }
                )
              ]
            },
            transaction.id
          )) })
        ] }),
        selectedTab === "redeem" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Redeem Points" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream rounded-xl p-6 mb-6 border-2 border-brand-orange/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70 mb-1", children: "Available to Redeem" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-bold text-brand-brown", children: [
                  loyaltyData.availablePoints.toLocaleString(),
                  " pts"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70 mb-1", children: "Value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-brand-orange", children: currencyValue.formatted })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/60", children: "Rate: 100 points = R1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowRedeemModal(true),
              disabled: loyaltyData.availablePoints < 100,
              className: "w-full py-4 bg-brand-orange text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-5 w-5" }),
                "Redeem Points for Credit"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 p-4 bg-cream rounded-lg border-2 border-brand-orange/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-brand-orange flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-brand-brown/80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "How it works:" }),
              " Convert your points to booking credit that can be applied to any future reservation. Credits never expire!"
            ] })
          ] }) })
        ] })
      ] })
    ] }) }),
    showRedeemModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-brand-brown", children: "Redeem Points" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowRedeemModal(false), className: "text-gray-400 hover:text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Points to Redeem" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            min: "100",
            step: "100",
            max: loyaltyData.availablePoints,
            value: redeemAmount,
            onChange: (e) => setRedeemAmount(Math.min(parseInt(e.target.value) || 100, loyaltyData.availablePoints)),
            className: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand-orange focus:outline-none text-lg font-semibold"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-gray-600", children: [
          "You'll receive: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-brand-orange", children: pointsToCurrency(redeemAmount).formatted }),
          " credit"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleRedeem,
            className: "w-full py-3 bg-brand-orange text-white rounded-lg font-bold hover:bg-orange-600 transition-colors",
            children: "Confirm Redemption"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowRedeemModal(false),
            className: "w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  LoyaltyDashboard as default
};
//# sourceMappingURL=LoyaltyDashboard-CAFfjaL_.js.map
