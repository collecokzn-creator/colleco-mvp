import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { U as UserContext, m as PushNotificationService } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
const NotificationSettings = () => {
  const { user } = reactExports.useContext(UserContext);
  const [permission, setPermission] = reactExports.useState("default");
  const [isSubscribed, setIsSubscribed] = reactExports.useState(false);
  const [isPWA, setIsPWA] = reactExports.useState(false);
  const [deviceType, setDeviceType] = reactExports.useState("unknown");
  const [loading, setLoading] = reactExports.useState(false);
  const [_showInstructions, setShowInstructions] = reactExports.useState(false);
  reactExports.useEffect(() => {
    checkNotificationStatus();
  }, []);
  const checkNotificationStatus = async () => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    const installed = PushNotificationService.isInstalledPWA();
    setIsPWA(installed);
    const mobile = PushNotificationService.isMobileDevice();
    setDeviceType(mobile ? "mobile" : "desktop");
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error("Failed to check subscription:", error);
    }
  };
  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await PushNotificationService.requestPermission();
      if (granted) {
        await PushNotificationService.subscribeToNotifications(user.id);
        await PushNotificationService.sendTestNotification();
        await checkNotificationStatus();
        alert("✅ Notifications enabled! You should see a test notification.");
      } else {
        alert("❌ Notification permission denied. Please enable in your browser/device settings.");
        setShowInstructions(true);
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      alert("❌ Failed to enable notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await PushNotificationService.unsubscribeFromNotifications(user.id);
      await checkNotificationStatus();
      alert("🔕 Notifications disabled");
    } catch (error) {
      console.error("Failed to disable notifications:", error);
      alert("❌ Failed to disable notifications");
    } finally {
      setLoading(false);
    }
  };
  const getDeviceIcon = () => {
    if (deviceType === "mobile") {
      return isPWA ? "📱 Mobile App" : "📱 Mobile Browser";
    }
    return "💻 Desktop";
  };
  const getStatusColor = () => {
    if (permission === "granted" && isSubscribed) return "text-green-600";
    if (permission === "denied") return "text-red-600";
    return "text-yellow-600";
  };
  const getStatusText = () => {
    if (permission === "granted" && isSubscribed) return "✅ Enabled";
    if (permission === "denied") return "❌ Blocked";
    if (permission === "granted") return "⚠️ Permission granted, not subscribed";
    return "🔔 Not enabled";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-cream-border px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "🔔 Notification Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage your push notifications and stay updated on bookings, messages, and payments" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand border border-cream-border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-gray-900 mb-3", children: "Current Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: "Notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${getStatusColor()}`, children: getStatusText() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: "Device" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: getDeviceIcon() })
          ] }),
          deviceType === "mobile" && !isPWA && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800", children: [
            "💡 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
            " Install the CollEco app for the best notification experience!"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: permission === "granted" && isSubscribed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "✅" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-green-900", children: "You're All Set!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700 mt-1", children: "You'll receive instant notifications for:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-green-700 mt-2 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "📋 New bookings and updates" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "💰 Payments received and due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "💬 New messages from clients" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "📄 Quote requests and responses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🤝 Collaboration invites" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleDisableNotifications,
            disabled: loading,
            className: "w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium",
            children: loading ? "⏳ Processing..." : "🔕 Disable Notifications"
          }
        )
      ] }) : permission === "denied" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "❌" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-red-900", children: "Notifications Blocked" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 mt-1", children: "You've blocked notifications for CollEco. To enable them:" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand border border-cream-border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "How to Enable:" }),
          deviceType === "mobile" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-900", children: "iPhone/iPad:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside mt-1 ml-2 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Go to Settings → Notifications → CollEco" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Toggle on "Allow Notifications"' }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Refresh this page" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-900", children: "Android:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside mt-1 ml-2 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Go to Settings → Apps → CollEco → Notifications" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Toggle on notifications" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Refresh this page" })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-900", children: "Desktop Browser:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside mt-1 ml-2 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Click the 🔒 lock icon in the address bar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Find "Notifications" in the permissions list' }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: 'Change to "Allow"' }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Refresh this page" })
            ] })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-[#FFF8F1] border border-[#D2691E] rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🔔" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Enable Push Notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mt-1", children: "Get instant alerts for bookings, payments, and messages. Never miss an important update!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-gray-600 mt-3 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Instant booking notifications" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Payment alerts with vibration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Client message updates" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "✓ Works even when app is closed" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleEnableNotifications,
            disabled: loading,
            className: "w-full bg-[#D2691E] text-white px-6 py-3 rounded-lg hover:bg-[#B8591A] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium text-lg",
            children: loading ? "⏳ Enabling..." : "🔔 Enable Notifications"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 text-center", children: "We'll ask for your permission in the next step" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cream-border pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-gray-900 mb-3", children: "What You'll Receive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          { icon: "📋", title: "Bookings", desc: "New bookings and confirmations" },
          { icon: "💰", title: "Payments", desc: "Payment received and due alerts" },
          { icon: "💬", title: "Messages", desc: "New messages from clients" },
          { icon: "📄", title: "Quotes", desc: "Quote requests and responses" },
          { icon: "🤝", title: "Collaborations", desc: "Partner collaboration invites" },
          { icon: "⚠️", title: "Alerts", desc: "Important system updates" }
        ].map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: item.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-gray-900 text-sm", children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-600", children: item.desc })
          ] })
        ] }) }, index)) })
      ] })
    ] })
  ] }) });
};
export {
  NotificationSettings as default
};
//# sourceMappingURL=NotificationSettings-B0X8EiKr.js.map
