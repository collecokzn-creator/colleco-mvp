import { j as jsxRuntimeExports, m as motion, r as reactExports } from "./motion-D9fZRtSt.js";
import { B as BADGES, c as getLeaderboard, d as getUserRank, e as getLeaderboardConsent, s as setLeaderboardConsent, u as updateStreak, f as getActiveChallenges, g as getAchievements, a as getStreaks, b as getRewardTier } from "./gamificationEngine-BquAD8q6.js";
import { n as CheckCircle2, o as Clock, ay as Target, u as Trophy, v as Flame, T as TrendingUp, a as DollarSign, G as Award, x as Star, M as MapPin, U as Users, aB as Medal, S as Shield, aC as Info, X, K as Gift, w as ChevronRight } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function ProgressBar({
  current,
  target,
  label,
  showPercentage = true,
  showValues = true,
  color = "brand-orange",
  height = "medium",
  animate = true,
  className = ""
}) {
  const percentage = Math.min(current / target * 100, 100);
  const heightClasses = {
    small: "h-2",
    medium: "h-4",
    large: "h-6"
  };
  const colorClasses = {
    "brand-orange": "bg-brand-orange",
    "blue": "bg-blue-500",
    "green": "bg-green-500",
    "purple": "bg-purple-500",
    "gold": "bg-yellow-500"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-full ${className}`, children: [
    label && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: label }),
      showPercentage && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-900", children: [
        percentage.toFixed(0),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full bg-gray-200 rounded-full ${heightClasses[height]} overflow-hidden`, children: animate ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: `${colorClasses[color]} ${heightClasses[height]} rounded-full`,
        initial: { width: 0 },
        animate: { width: `${percentage}%` },
        transition: { duration: 1, ease: "easeOut" }
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `${colorClasses[color]} ${heightClasses[height]} rounded-full`,
        style: { width: `${percentage}%` }
      }
    ) }),
    showValues && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
      current.toLocaleString(),
      " / ",
      target.toLocaleString()
    ] }) })
  ] });
}
function AchievementBadge({
  badgeId,
  size = "medium",
  unlocked = true,
  showName = true,
  showTier = false,
  animate = true,
  onClick
}) {
  const badge = BADGES[badgeId];
  if (!badge) {
    return null;
  }
  const sizeClasses = {
    small: "w-12 h-12 text-xl",
    medium: "w-16 h-16 text-3xl",
    large: "w-24 h-24 text-5xl",
    xlarge: "w-32 h-32 text-6xl"
  };
  const tierColors = {
    bronze: "from-amber-700 to-amber-900",
    silver: "from-gray-300 to-gray-500",
    gold: "from-yellow-400 to-yellow-600",
    platinum: "from-purple-300 to-purple-500"
  };
  const badgeContent = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br ${unlocked ? tierColors[badge.tier] : "from-gray-200 to-gray-400"}
        flex items-center justify-center
        shadow-lg
        ${unlocked ? "opacity-100" : "opacity-40"}
        ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""}
        relative
        border-4 ${unlocked ? "border-white" : "border-gray-300"}
      `,
      onClick,
      style: {
        filter: unlocked ? "none" : "grayscale(100%)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "filter drop-shadow-md", children: badge.icon }),
        !unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-2xl", children: "🔒" }) })
      ]
    }
  );
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
    badgeContent,
    showName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-semibold ${unlocked ? "text-gray-900" : "text-gray-500"}`, children: badge.name }),
      showTier && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: badge.tier })
    ] })
  ] });
  if (animate && unlocked) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20
        },
        children: content
      }
    );
  }
  return content;
}
function ChallengeCard({
  challenge,
  onClaim,
  showBadge = true,
  compact = false
}) {
  const {
    name,
    description,
    progress = 0,
    target,
    completed,
    completedAt,
    reward,
    difficulty,
    category,
    percentComplete
  } = challenge;
  const difficultyColors = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700"
  };
  const categoryIcons = {
    revenue: "💰",
    bookings: "📅",
    occupancy: "🎯",
    rating: "⭐",
    engagement: "💬",
    trips: "✈️",
    geography: "🗺️",
    loyalty: "💎",
    spending: "💳",
    social: "👥",
    reviews: "✍️"
  };
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: `
          bg-white rounded-lg p-4 border-2
          ${completed ? "border-green-500 bg-green-50" : "border-gray-200"}
        `,
        whileHover: { scale: 1.02 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: categoryIcons[category] || "🎯" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-900", children: name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ProgressBar,
                {
                  current: progress,
                  target,
                  showValues: false,
                  showPercentage: false,
                  height: "small",
                  animate: false
                }
              )
            ] })
          ] }),
          completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-6 h-6 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-600", children: [
            percentComplete?.toFixed(0),
            "%"
          ] })
        ] })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: `
        bg-white rounded-xl shadow-md overflow-hidden border-2
        ${completed ? "border-green-500" : "border-gray-100"}
        hover:shadow-lg transition-shadow
      `,
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      whileHover: { y: -4 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 ${completed ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-brand-orange to-amber-500"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl filter drop-shadow-md", children: categoryIcons[category] || "🎯" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-white", children: name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90", children: description })
              ] })
            ] }),
            completed && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-6 h-6 text-white" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-1 rounded-full ${difficultyColors[difficulty]}`, children: difficulty?.toUpperCase() }),
            challenge.timeframe && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-white/20 text-white px-2 py-1 rounded-full flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
              challenge.timeframe
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          !completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-700 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-4 h-4" }),
                "Progress"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-brand-orange", children: [
                progress.toLocaleString(),
                " / ",
                target.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ProgressBar,
              {
                current: progress,
                target,
                showValues: false,
                height: "large",
                animate: true
              }
            )
          ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 bg-green-50 p-3 rounded-lg border border-green-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-green-700", children: [
              "Completed ",
              completedAt && `on ${new Date(completedAt).toLocaleDateString()}`
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 rounded-lg p-3 border border-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-4 h-4 text-amber-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-amber-900", children: "Rewards" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-amber-600", children: [
                    "+",
                    reward.points
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Points" })
                ] }),
                showBadge && reward.badge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-10 bg-gray-300" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AchievementBadge,
                    {
                      badgeId: reward.badge,
                      size: "small",
                      unlocked: completed,
                      showName: false,
                      animate: false
                    }
                  )
                ] })
              ] }),
              completed && onClaim && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => onClaim(challenge),
                  className: "px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors",
                  children: "Claim"
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
function StreakCounter({
  current,
  best,
  label = "Daily Streak",
  size = "medium",
  showBest = true,
  animate = true
}) {
  const sizeClasses = {
    small: {
      container: "px-3 py-2",
      icon: "w-4 h-4",
      text: "text-sm",
      number: "text-lg"
    },
    medium: {
      container: "px-4 py-3",
      icon: "w-5 h-5",
      text: "text-base",
      number: "text-2xl"
    },
    large: {
      container: "px-6 py-4",
      icon: "w-6 h-6",
      text: "text-lg",
      number: "text-3xl"
    }
  };
  const classes = sizeClasses[size];
  const getStreakColor = () => {
    if (current === 0) return "text-gray-400";
    if (current < 7) return "text-orange-500";
    if (current < 30) return "text-orange-600";
    return "text-red-600";
  };
  const streakColor = getStreakColor();
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white rounded-lg shadow-md ${classes.container} border-2 border-gray-100`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${streakColor} relative`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: classes.icon }),
        current > 0 && animate && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "absolute inset-0",
            animate: {
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            },
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: classes.icon })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${classes.text} text-gray-600`, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `${classes.number} font-bold ${streakColor}`, children: [
          current,
          " ",
          current === 1 ? "day" : "days"
        ] })
      ] }),
      showBest && best > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3 h-3" }),
          "Best"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-700", children: [
          best,
          " days"
        ] })
      ] })
    ] }),
    current >= 7 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 pt-2 border-t border-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      current >= 7 && current < 30 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full", children: "Week Warrior! 🔥" }),
      current >= 30 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full", children: "Month Master! 🏆" })
    ] }) })
  ] });
  if (animate && current > 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { scale: 0.95 },
        animate: { scale: 1 },
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        },
        children: content
      }
    );
  }
  return content;
}
function Leaderboards({
  userType = "traveler",
  userId,
  initialCategory = "points",
  initialTimeframe = "all"
}) {
  const [category, setCategory] = reactExports.useState(initialCategory);
  const [timeframe, setTimeframe] = reactExports.useState(initialTimeframe);
  const categories = userType === "partner" ? [
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "bookings", label: "Bookings", icon: Award },
    { id: "rating", label: "Rating", icon: Star }
  ] : [
    { id: "points", label: "Points", icon: Trophy },
    { id: "trips", label: "Trips", icon: MapPin },
    { id: "countries", label: "Countries", icon: Users }
  ];
  const timeframes = [
    { id: "weekly", label: "This Week" },
    { id: "monthly", label: "This Month" },
    { id: "all", label: "All Time" }
  ];
  const leaderboard = getLeaderboard(userType, category, timeframe, userId);
  const userRank = getUserRank(userId, userType, category, timeframe);
  const getRankIcon = (rank) => {
    if (rank === 1) return /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-5 h-5 text-yellow-500" });
    if (rank === 2) return /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "w-5 h-5 text-gray-400" });
    if (rank === 3) return /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-5 h-5 text-amber-700" });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-600", children: [
      "#",
      rank
    ] });
  };
  const getRankBackground = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-400";
    if (rank === 2) return "bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-amber-100 to-orange-100 border-amber-600";
    return "bg-white border-gray-200";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-6 h-6 text-brand-orange" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Leaderboards" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4 overflow-x-auto pb-2", children: categories.map((cat) => {
        const Icon = cat.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setCategory(cat.id),
            className: `
                  px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap
                  flex items-center gap-2 transition-colors
                  ${category === cat.id ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                `,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
              cat.label
            ]
          },
          cat.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: timeframes.map((tf) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTimeframe(tf.id),
          className: `
                px-3 py-1 rounded-full text-xs font-semibold transition-colors
                ${timeframe === tf.id ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
              `,
          children: tf.label
        },
        tf.id
      )) })
    ] }),
    userRank && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4",
        initial: { scale: 0.95 },
        animate: { scale: 1 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-blue-900", children: "Your Rank" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            getRankIcon(userRank),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-blue-600", children: [
              "#",
              userRank
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: leaderboard.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-16 h-16 text-gray-300 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No leaderboard data yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Be the first to climb the ranks!" })
    ] }) : leaderboard.map((entry, index) => {
      const isCurrentUser = entry.userId === userId;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: `
                  p-4 rounded-lg border-2 transition-all
                  ${getRankBackground(entry.rank)}
                  ${isCurrentUser ? "ring-2 ring-blue-400 ring-offset-2" : ""}
                `,
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: index * 0.05 },
          whileHover: { scale: 1.02 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 flex items-center justify-center", children: getRankIcon(entry.rank) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `font-semibold ${isCurrentUser ? "text-blue-700" : "text-gray-900"}`, children: [
                    isCurrentUser ? entry.metadata?.name || "You" : `User ${entry.rank}`,
                    isCurrentUser && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full", children: "You" })
                  ] }),
                  entry.metadata?.city && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: entry.metadata.city }),
                  entry.metadata?.businessName && userType === "partner" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: entry.metadata.businessName })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-900", children: [
                  category === "revenue" && "R",
                  entry.value.toLocaleString(),
                  category === "rating" && " ⭐"
                ] }),
                entry.metadata?.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: entry.metadata.subtitle })
              ] })
            ] }),
            entry.rank === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 pt-2 border-t border-yellow-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-yellow-700 font-semibold flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-3 h-3" }),
              "Champion"
            ] }) })
          ]
        },
        entry.userId
      );
    }) }),
    leaderboard.length >= 100 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
      "Showing top 100 ",
      userType,
      "s"
    ] }) })
  ] });
}
function LeaderboardConsentBanner({ userId, userType, onConsent }) {
  const [showBanner, setShowBanner] = reactExports.useState(false);
  const [showDetails, setShowDetails] = reactExports.useState(false);
  const [consent, setConsent] = reactExports.useState({
    leaderboardParticipation: false,
    showCity: false,
    showBusinessName: false
  });
  reactExports.useEffect(() => {
    const existingConsent = getLeaderboardConsent(userId);
    if (!existingConsent.consentDate) {
      setShowBanner(true);
    }
  }, [userId]);
  const handleAccept = (options) => {
    const result = setLeaderboardConsent(userId, options);
    {
      setShowBanner(false);
      if (onConsent) {
        onConsent(result.consent);
      }
    }
  };
  const handleDecline = () => {
    handleAccept({});
  };
  if (!showBanner) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-brand-orange shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8 text-brand-orange flex-shrink-0 mt-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "Leaderboard Participation - Your Privacy Matters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700 mb-3", children: [
        "In compliance with the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Protection of Personal Information Act (POPI Act)" }),
        ", we need your consent to display your ranking on public leaderboards."
      ] }),
      !showDetails ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowDetails(true),
          className: "text-sm text-brand-orange hover:underline flex items-center gap-1 mb-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4" }),
            "Learn more about how we protect your privacy"
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-50 rounded-lg p-4 mb-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "How We Protect Your Privacy:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 mt-1", children: "✓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Anonymization:" }),
              ' Other users see "User 1", "User 2", etc. - never your real name'
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 mt-1", children: "✓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No Personal Data:" }),
              " We never display email, phone, ID number, or full address"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 mt-1", children: "✓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Optional Location:" }),
              " You choose whether to show your city (general location only)"
            ] })
          ] }),
          userType === "partner" && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 mt-1", children: "✓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Business Name:" }),
              " Partners can optionally display business name (not personal name)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 mt-1", children: "✓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Opt-Out Anytime:" }),
              " Change your preferences in Settings at any time"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 mt-1", children: "✓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "POPI Compliant:" }),
              " Full compliance with South African data protection laws"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: consent.leaderboardParticipation,
              onChange: (e) => setConsent({ ...consent, leaderboardParticipation: e.target.checked }),
              className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "I consent to appear on leaderboards" }),
            ' (anonymized as "User [Rank]")'
          ] })
        ] }),
        consent.leaderboardParticipation && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer ml-7", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: consent.showCity,
                onChange: (e) => setConsent({ ...consent, showCity: e.target.checked }),
                className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: 'Show my city (e.g., "Johannesburg") - optional' })
          ] }),
          userType === "partner" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer ml-7", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: consent.showBusinessName,
                onChange: (e) => setConsent({ ...consent, showBusinessName: e.target.checked }),
                className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Show my business name (for brand visibility) - optional" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleAccept(consent),
            disabled: !consent.leaderboardParticipation,
            className: `
                  px-6 py-2 rounded-lg font-semibold text-sm transition-colors
                  ${consent.leaderboardParticipation ? "bg-brand-orange text-white hover:bg-orange-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                `,
            children: "Accept & Continue"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleDecline,
            className: "px-6 py-2 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors",
            children: "Decline (Hide from Leaderboards)"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-3", children: "By declining, you can still earn points and complete challenges privately. Your rank will be visible only to you." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleDecline,
        className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
        "aria-label": "Close",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-gray-500" })
      }
    )
  ] }) }) });
}
const __vite_import_meta_env__ = {};
function Gamification() {
  const _log = (level, ...args) => {
    if (!(__vite_import_meta_env__?.VITE_DEBUG_GAMIFICATION === "1")) return;
    console.log(...args);
  };
  useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("challenges");
  const [challengeFilter, setChallengeFilter] = reactExports.useState("all");
  const userId = "user_123";
  const userType = "traveler";
  const [challenges, setChallenges] = reactExports.useState([]);
  const [achievements, setAchievements] = reactExports.useState(null);
  const [streaks, setStreaks] = reactExports.useState(null);
  const [rewardTier, setRewardTier] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadGamificationData();
  }, []);
  const loadGamificationData = () => {
    updateStreak(userId, "login");
    const challengesData = getActiveChallenges(userId, userType);
    const achievementsData = getAchievements(userId);
    const streaksData = getStreaks(userId);
    const tierData = getRewardTier(userId);
    setChallenges(challengesData);
    setAchievements(achievementsData);
    setStreaks(streaksData);
    setRewardTier(tierData);
  };
  const filteredChallenges = challenges.filter((challenge) => {
    if (challengeFilter === "all") return true;
    if (challengeFilter === "active") return !challenge.completed;
    if (challengeFilter === "completed") return challenge.completed;
    return challenge.category === challengeFilter;
  });
  const tabs = [
    { id: "challenges", label: "Challenges", icon: Target },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "rewards", label: "Rewards", icon: Gift }
  ];
  const challengeFilters = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "trips", label: "Trips" },
    { id: "geography", label: "Geography" },
    { id: "loyalty", label: "Loyalty" },
    { id: "social", label: "Social" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-cream-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LeaderboardConsentBanner,
      {
        userId,
        userType,
        onConsent: (consent) => {
          _log("log", "User consent updated:", consent);
          loadGamificationData();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-brand-orange to-amber-500 text-white py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-8 h-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Gamification Center" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/90", children: "Complete challenges, earn badges, and climb the leaderboards" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "bg-white rounded-lg shadow-md p-4 border-2 border-brand-orange",
            whileHover: { scale: 1.02 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-5 h-5 text-brand-orange" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-green-500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: achievements?.totalPoints?.toLocaleString() || 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Total Points" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "bg-white rounded-lg shadow-md p-4",
            whileHover: { scale: 1.02 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-5 h-5 text-blue-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: achievements?.challengesCompleted || 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Challenges Completed" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "bg-white rounded-lg shadow-md p-4",
            whileHover: { scale: 1.02 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-5 h-5 text-purple-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: achievements?.badges?.length || 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Badges Earned" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "bg-white rounded-lg shadow-md p-4",
            whileHover: { scale: 1.02 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-5 h-5 text-orange-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: streaks?.login?.current || 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Day Streak" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StreakCounter,
          {
            current: streaks?.login?.current || 0,
            best: streaks?.login?.best || 0,
            label: "Daily Login Streak",
            size: "large",
            showBest: true,
            animate: true
          }
        ),
        rewardTier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-6 h-6 text-brand-orange" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Reward Tier" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", style: { color: rewardTier.current.color }, children: rewardTier.current.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                achievements?.totalPoints?.toLocaleString() || 0,
                " points"
              ] })
            ] }),
            rewardTier.next && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                "Next: ",
                rewardTier.next.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                rewardTier.pointsToNext.toLocaleString(),
                " more points"
              ] })
            ] })
          ] }),
          rewardTier.next && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProgressBar,
            {
              current: achievements?.totalPoints || 0,
              target: rewardTier.next.minPoints,
              showValues: false,
              color: "purple",
              height: "medium"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Benefits:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: rewardTier.current.benefits.map((benefit, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-gray-600 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3 text-green-500" }),
              benefit
            ] }, index)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 border-b border-gray-200 overflow-x-auto", children: tabs.map((tab) => {
        const Icon = tab.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab(tab.id),
            className: `
                    px-6 py-3 font-semibold text-sm whitespace-nowrap
                    flex items-center gap-2 border-b-2 transition-colors
                    ${activeTab === tab.id ? "border-brand-orange text-brand-orange" : "border-transparent text-gray-600 hover:text-gray-900"}
                  `,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
              tab.label
            ]
          },
          tab.id
        );
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        activeTab === "challenges" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex gap-2 overflow-x-auto pb-2", children: challengeFilters.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setChallengeFilter(filter.id),
              className: `
                      px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap
                      transition-colors
                      ${challengeFilter === filter.id ? "bg-brand-orange text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}
                    `,
              children: filter.label
            },
            filter.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: filteredChallenges.map((challenge) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ChallengeCard,
            {
              challenge,
              showBadge: true
            },
            challenge.id
          )) }),
          filteredChallenges.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 bg-white rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-16 h-16 text-gray-300 mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No challenges found" })
          ] })
        ] }),
        activeTab === "achievements" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-6", children: "Your Badges" }),
          achievements?.badges && achievements.badges.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6", children: achievements.badges.map((badgeId) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            AchievementBadge,
            {
              badgeId,
              size: "large",
              unlocked: true,
              showName: true,
              showTier: true,
              animate: true
            },
            badgeId
          )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-16 h-16 text-gray-300 mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No badges earned yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Complete challenges to earn your first badge!" })
          ] })
        ] }),
        activeTab === "leaderboard" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Leaderboards,
          {
            userType,
            userId,
            initialCategory: "points",
            initialTimeframe: "all"
          }
        ),
        activeTab === "rewards" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-6", children: "Available Rewards" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-green-300 rounded-lg p-4 bg-green-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-6 h-6 text-green-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-green-900", children: "10% Travel Discount" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mb-3", children: "Use your points to get 10% off your next booking" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-green-700", children: "500 points" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700", children: "Redeem" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-gray-300 rounded-lg p-4 bg-gray-50 opacity-60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-6 h-6 text-gray-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-gray-900", children: "Free Room Upgrade" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mb-3", children: "Automatic upgrade to the next room category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-700", children: "2000 points" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: true, className: "px-4 py-2 bg-gray-400 text-white rounded-lg text-sm font-semibold cursor-not-allowed", children: "Not Enough Points" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  Gamification as default
};
//# sourceMappingURL=Gamification-B8PmrtO-.js.map
