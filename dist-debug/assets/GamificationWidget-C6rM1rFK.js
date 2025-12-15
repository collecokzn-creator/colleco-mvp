import { r as reactExports, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from "./motion-D9fZRtSt.js";
import { g as getAchievements, a as getStreaks, b as getRewardTier } from "./gamificationEngine-BquAD8q6.js";
import { u as Trophy, v as Flame, w as ChevronRight, x as Star } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
function GamificationWidget({ userId, compact = false }) {
  const navigate = useNavigate();
  const [achievements, setAchievements] = reactExports.useState(null);
  const [streaks, setStreaks] = reactExports.useState(null);
  const [rewardTier, setRewardTier] = reactExports.useState(null);
  const [showTooltip, setShowTooltip] = reactExports.useState(false);
  const [justEarnedPoints, setJustEarnedPoints] = reactExports.useState(null);
  const loadData = reactExports.useCallback(() => {
    const achievementsData = getAchievements(userId);
    const streaksData = getStreaks(userId);
    const tierData = getRewardTier(userId);
    setAchievements(achievementsData);
    setStreaks(streaksData);
    setRewardTier(tierData);
  }, [userId]);
  reactExports.useEffect(() => {
    if (!userId) return;
    loadData();
  }, [loadData, userId]);
  reactExports.useEffect(() => {
    const handlePointsAwarded = (event) => {
      if (event.detail.userId === userId) {
        setJustEarnedPoints(event.detail.points);
        loadData();
        setTimeout(() => setJustEarnedPoints(null), 3e3);
      }
    };
    window.addEventListener("gamification:points-awarded", handlePointsAwarded);
    return () => window.removeEventListener("gamification:points-awarded", handlePointsAwarded);
  }, [userId, loadData]);
  if (!achievements) return null;
  const points = achievements.totalPoints || 0;
  const streak = streaks?.login?.current || 0;
  const tier = rewardTier?.current;
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => navigate("/gamification"),
        onMouseEnter: () => setShowTooltip(true),
        onMouseLeave: () => setShowTooltip(false),
        className: "relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-brand-orange to-amber-500 text-white rounded-full hover:shadow-lg transition-all",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm", children: points.toLocaleString() }),
          streak > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 border-l border-white/30 pl-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-3 h-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: streak })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: justEarnedPoints && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 1, y: 0, scale: 1 },
              animate: { opacity: 0, y: -30, scale: 1.2 },
              exit: { opacity: 0 },
              transition: { duration: 2 },
              className: "absolute -top-6 right-0 text-green-400 font-bold text-sm whitespace-nowrap",
              children: [
                "+",
                justEarnedPoints,
                " pts"
              ]
            }
          ) }),
          showTooltip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-full mt-2 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap z-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
              tier?.name,
              " Tier"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-300", children: [
              points.toLocaleString(),
              " points"
            ] }),
            streak > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-orange-300", children: [
              streak,
              "-day streak 🔥"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 mt-1", children: "Click for details" })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      onClick: () => navigate("/gamification"),
      className: "bg-gradient-to-br from-brand-orange to-amber-500 rounded-xl p-4 text-white cursor-pointer hover:shadow-xl transition-shadow relative overflow-hidden",
      whileHover: { scale: 1.02 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 opacity-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-32 h-32 -mr-8 -mt-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Gamification" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-xs", children: "Total Points" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: points.toLocaleString() })
            ] }),
            tier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-xs", children: "Tier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: tier.name })
              ] })
            ] }),
            streak > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-xs", children: "Daily Streak" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm", children: [
                  streak,
                  " days"
                ] })
              ] })
            ] }),
            achievements.badges && achievements.badges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-white/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/80 text-xs", children: "Badges Earned" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: achievements.badges.length })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: justEarnedPoints && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 1, scale: 1, y: 0 },
              animate: { opacity: 0, scale: 1.5, y: -20 },
              exit: { opacity: 0 },
              transition: { duration: 2 },
              className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-300 font-bold text-3xl pointer-events-none",
              children: [
                "+",
                justEarnedPoints
              ]
            }
          ) })
        ] })
      ]
    }
  );
}
export {
  GamificationWidget as G
};
//# sourceMappingURL=GamificationWidget-C6rM1rFK.js.map
