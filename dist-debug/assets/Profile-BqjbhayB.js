import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { c as useUser, u as useNavigate, L as Link } from "./index-DlOecmR0.js";
import { B as Button } from "./Button-BvBK5int.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const fileInputRef = reactExports.useRef(null);
  const [profilePicture, setProfilePicture] = reactExports.useState(null);
  const [showCamera, setShowCamera] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    nationality: ""
  });
  const [walletBalance, setWalletBalance] = reactExports.useState(0);
  const [bookings, setBookings] = reactExports.useState([]);
  const [travelHistory, setTravelHistory] = reactExports.useState([]);
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const autoSaveTimerRef = reactExports.useRef(null);
  const lastFormDataRef = reactExports.useRef(formData);
  reactExports.useEffect(() => {
    if (!editing) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (JSON.stringify(formData) !== JSON.stringify(lastFormDataRef.current)) {
        const updatedUser = { ...user, ...formData, profilePicture };
        localStorage.setItem("colleco.user", JSON.stringify(updatedUser));
        lastFormDataRef.current = formData;
      }
    }, 3e3);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [formData, editing, user, profilePicture]);
  const walletRecommendation = reactExports.useMemo(() => {
    const upcomingTotal = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    if (walletBalance < upcomingTotal) {
      const needed = upcomingTotal - walletBalance;
      return {
        type: "warning",
        message: `⚠️ Top up R${needed.toFixed(2)} for upcoming bookings`
      };
    }
    if (walletBalance > 1e4) {
      return {
        type: "info",
        message: "💰 High balance detected. Consider using rewards points!"
      };
    }
    if (walletBalance === 0 && bookings.length > 0) {
      return {
        type: "alert",
        message: "💳 Add funds to wallet for quick checkout"
      };
    }
    return null;
  }, [walletBalance, bookings]);
  const travelInsights = reactExports.useMemo(() => {
    if (travelHistory.length === 0) return null;
    const totalTrips = travelHistory.length;
    const destinations = new Set(travelHistory.map((t) => t.destination));
    const avgTripCost = travelHistory.reduce((sum, t) => sum + (t.cost || 0), 0) / totalTrips;
    let insight = "";
    if (totalTrips >= 5) {
      insight = `🌍 You've traveled to ${destinations.size} destinations! `;
    }
    if (avgTripCost > 5e3) {
      insight += "✨ Premium traveler status available.";
    }
    return insight || null;
  }, [travelHistory]);
  reactExports.useEffect(() => {
    if (formData.phone && !formData.nationality) {
      const phone = formData.phone.replace(/\D/g, "");
      if (phone.startsWith("27")) {
        setFormData((prev) => ({ ...prev, nationality: "South Africa" }));
      } else if (phone.startsWith("1")) {
        setFormData((prev) => ({ ...prev, nationality: "United States" }));
      } else if (phone.startsWith("44")) {
        setFormData((prev) => ({ ...prev, nationality: "United Kingdom" }));
      }
    }
  }, [formData.phone, formData.nationality]);
  reactExports.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        nationality: user.nationality || ""
      });
      setProfilePicture(user.profilePicture || null);
      const savedBalance = localStorage.getItem("colleco.wallet.balance");
      if (savedBalance) setWalletBalance(parseFloat(savedBalance));
      const savedBookings = localStorage.getItem("colleco.bookings");
      if (savedBookings) {
        const allBookings = JSON.parse(savedBookings);
        const userBookings = allBookings.filter((b) => b.status !== "completed" && b.status !== "cancelled");
        setBookings(userBookings);
      }
      const savedHistory = localStorage.getItem("colleco.travel.history");
      if (savedHistory) {
        setTravelHistory(JSON.parse(savedHistory));
      }
    }
    try {
      if (typeof window !== "undefined") {
        window.__E2E_PROFILE_LOADED__ = true;
        if (document && document.body) {
          document.body.setAttribute("data-e2e-login-success", user && user.email || "");
        }
      }
    } catch (e) {
    }
  }, [user]);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target.result);
        localStorage.setItem("colleco.profile.picture", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/png");
      setProfilePicture(imageData);
      localStorage.setItem("colleco.profile.picture", imageData);
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setShowCamera(false);
    }
  };
  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...formData, profilePicture };
    localStorage.setItem("colleco.user", JSON.stringify(updatedUser));
    setEditing(false);
    alert("Profile updated successfully!");
  };
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login");
    }
  };
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown", children: "Please log in to view your profile." }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden bg-cream min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-8", "data-e2e": "profile-ready", "data-e2e-user-email": user?.email || "", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown flex items-center", children: [
        "Account",
        editing && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold", title: "Auto-save enabled, changes saved automatically", children: "Smart Mode" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-brand-russty max-w-prose", children: "Manage your profile, wallet balance, bookings activity and personalization settings." })
    ] }),
    (walletRecommendation || travelInsights) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 space-y-2", children: [
      walletRecommendation && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-lg p-3 text-sm ${walletRecommendation.type === "warning" ? "bg-amber-50 border border-amber-200 text-amber-800" : walletRecommendation.type === "alert" ? "bg-red-50 border border-red-200 text-red-800" : "bg-blue-50 border border-blue-200 text-blue-800"}`, children: walletRecommendation.message }),
      travelInsights && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800", children: travelInsights })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-8 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 rounded-full bg-cream-sand overflow-hidden border-2 border-brand-orange", children: profilePicture ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profilePicture, alt: "Profile", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center text-4xl text-brand-orange", children: "👤" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => fileInputRef.current.click(),
              className: "absolute -bottom-1 -right-1 w-8 h-8 bg-brand-orange text-white rounded-full hover:bg-brand-gold transition flex items-center justify-center text-sm",
              children: "📷"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown mb-1", children: formData.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty text-sm", children: formData.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "xs",
              variant: editing ? "primary" : "subtle",
              onClick: () => editing ? handleSaveProfile() : setEditing(true),
              children: editing ? "💾 Save" : "✏️ Edit Profile"
            }
          ) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "image/*",
          onChange: handleFileUpload,
          className: "hidden"
        }
      ),
      showCamera && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl p-6 max-w-lg w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-4 text-brand-brown", children: "Capture Photo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, className: "w-full rounded-lg mb-4 bg-black" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "flex-1",
              onClick: capturePhoto,
              children: "Capture"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "flex-1",
              variant: "subtle",
              onClick: () => {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach((track) => track.stop());
                setShowCamera(false);
              },
              children: "Cancel"
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-brand-russty mb-1", children: "Phone" }),
        editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "tel",
            value: formData.phone,
            onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
            className: "w-full px-3 py-2 border border-cream-border rounded bg-white text-brand-brown",
            placeholder: "+27 XX XXX XXXX"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown", children: formData.phone || "Not set" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-medium text-brand-russty mb-1", children: [
          "Nationality",
          editing && formData.nationality && formData.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-green-600", children: "✓ Auto-detected" })
        ] }),
        editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.nationality,
            onChange: (e) => setFormData({ ...formData, nationality: e.target.value }),
            className: "w-full px-3 py-2 border border-cream-border rounded bg-white text-brand-brown",
            placeholder: "Country"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown", children: formData.nationality || "Not set" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-brand-russty mb-1", children: "Date of Birth" }),
        editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: formData.dateOfBirth,
            onChange: (e) => setFormData({ ...formData, dateOfBirth: e.target.value }),
            className: "w-full border border-cream-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown text-sm", children: formData.dateOfBirth || "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-brand-russty mb-1", children: "Address" }),
        editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.address,
            onChange: (e) => setFormData({ ...formData, address: e.target.value }),
            className: "w-full border border-cream-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown text-sm", children: formData.address || "—" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-brand-brown", children: "Wallet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "xs", children: "View History" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-3xl font-bold text-brand-brown", children: [
          "R ",
          walletBalance.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-brand-russty", children: "Available Balance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, size: "md", children: "Add Funds" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-brand-brown", children: "Recent Activity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/bookings", className: "text-xs text-brand-orange hover:text-brand-gold transition", children: "View All" })
      ] }),
      bookings.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 mb-6", children: bookings.slice(0, 3).map((booking, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-cream-border last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-brand-brown text-sm", children: booking.destination || booking.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty", children: booking.date })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2.5 py-1 rounded-full text-xs font-medium ${booking.status === "confirmed" ? "bg-cream-sand text-brand-brown" : booking.status === "pending" ? "bg-amber-100 text-brand-russty" : "bg-cream-hover text-brand-brown"}`, children: booking.status })
      ] }, index)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty mb-3", children: "No active bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: "a", href: "/plan-trip", variant: "subtle", size: "sm", children: "Plan a Trip" })
      ] }),
      travelHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cream-border pt-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-brand-russty mb-3", children: "Travel History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: travelHistory.slice(0, 2).map((trip, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown", children: trip.destination }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty", children: trip.date })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-brand-orange", children: [
            "R ",
            trip.amount
          ] })
        ] }, index)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pt-6 border-t border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-brand-brown mb-3", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/settings/notifications",
            className: "flex items-center justify-between p-3 bg-cream-sand rounded-lg hover:bg-cream-hover transition group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "🔔" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-brown", children: "Notifications" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty", children: "Push alerts & preferences" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-brand-russty group-hover:text-brand-brown transition", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/settings",
            className: "flex items-center justify-between p-3 bg-cream-sand rounded-lg hover:bg-cream-hover transition group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "⚙️" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-brown", children: "Account Settings" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty", children: "Privacy & preferences" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-brand-russty group-hover:text-brand-brown transition", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 pt-6 border-t border-cream-border flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleLogout, variant: "ghost", size: "md", children: "Log Out" }) })
  ] }) });
}
export {
  Profile as default
};
//# sourceMappingURL=Profile-BqjbhayB.js.map
