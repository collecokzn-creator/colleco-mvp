import { r as reactExports, j as jsxRuntimeExports, m as motion } from "./motion-D9fZRtSt.js";
import { c as useUser, n as Breadcrumbs } from "./index-DlOecmR0.js";
import { g as getEarningsSummary, a as getPartnerSubscription, b as getPartnerTransactions, c as getUpcomingPayoutAmount, d as getPayoutMethods, e as getPayoutHistory, f as getMonthlyEarningsReport, i as initiatePayout } from "./payoutsSystem-wwSz4I24.js";
import { F as Footer } from "./Footer-ByqUfdvj.js";
import { a as DollarSign, T as TrendingUp, a1 as Percent, G as Award, a2 as ArrowUpRight, C as Calendar, a3 as Banknote, A as AlertCircle, D as Download, a4 as CheckCircle, o as Clock, l as CreditCard } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./subscriptionPlans-rkZPWK28.js";
function PartnerEarnings() {
  const { user } = useUser();
  const partnerId = user?.id || "demo-partner";
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [summary, setSummary] = reactExports.useState(null);
  const [subscription, setSubscription] = reactExports.useState(null);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [payoutInfo, setPayoutInfo] = reactExports.useState(null);
  const [payoutMethods, setPayoutMethods] = reactExports.useState([]);
  const [payoutHistory, setPayoutHistory] = reactExports.useState([]);
  const [monthlyReport, setMonthlyReport] = reactExports.useState(null);
  const loadData = reactExports.useCallback(() => {
    const earningsSummary = getEarningsSummary(partnerId);
    setSummary(earningsSummary);
    const sub = getPartnerSubscription(partnerId);
    setSubscription(sub);
    const txns = getPartnerTransactions(partnerId, 10);
    setTransactions(txns);
    const payout = getUpcomingPayoutAmount(partnerId);
    setPayoutInfo(payout);
    const methods = getPayoutMethods(partnerId);
    setPayoutMethods(methods);
    const history = getPayoutHistory(partnerId, 5);
    setPayoutHistory(history);
    const report = getMonthlyEarningsReport(partnerId, 0);
    setMonthlyReport(report);
  }, [partnerId]);
  reactExports.useEffect(() => {
    loadData();
  }, [loadData]);
  const handleRequestPayout = reactExports.useCallback(() => {
    if (!payoutInfo?.isReadyForPayout) {
      alert(`Minimum payout is R${payoutInfo?.minimumThreshold || 100}. Current balance: R${payoutInfo?.payoutAmount || 0}`);
      return;
    }
    if (payoutMethods.length === 0) {
      alert("Please add a payment method first");
      return;
    }
    const result = initiatePayout(partnerId);
    if (result.success) {
      alert("Payout request submitted! Expected delivery: " + result.payout.expectedDate);
      loadData();
    } else {
      alert("Error: " + result.message);
    }
  }, [partnerId, payoutInfo, payoutMethods, loadData]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0
    }).format(amount);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const getCommissionRateColor = (rate) => {
    if (rate >= 15) return "text-red-600";
    if (rate >= 12) return "text-orange-600";
    if (rate >= 8) return "text-green-600";
    return "text-emerald-600";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumbs, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-brand-brown mb-2", children: "Earnings & Payouts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty", children: "Track your commission earnings, manage payouts, and optimize your subscription plan." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          icon: DollarSign,
          label: "This Month",
          value: formatCurrency(summary?.thisMonthEarned || 0),
          trend: `+${((summary?.thisMonthEarned || 0) / (summary?.lastMonthEarned || 1) * 100 - 100).toFixed(1)}%`,
          trendUp: summary?.thisMonthEarned >= summary?.lastMonthEarned
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          icon: TrendingUp,
          label: "Available Balance",
          value: formatCurrency(payoutInfo?.payoutAmount || 0),
          subtitle: payoutInfo?.isReadyForPayout ? "Ready for payout" : "Below R100 threshold",
          highlight: payoutInfo?.isReadyForPayout
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          icon: Percent,
          label: "Commission Rate",
          value: `${subscription?.currentRate || 20}%`,
          subtitle: subscription?.planName || "Free Plan",
          className: getCommissionRateColor(subscription?.currentRate || 20)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          icon: Award,
          label: "Total Earned (YTD)",
          value: formatCurrency(summary?.yearToDateTotal || 0),
          subtitle: `${summary?.totalBookings || 0} bookings`
        }
      )
    ] }),
    subscription && subscription.currentRate > 12 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        className: "mb-8 bg-gradient-to-r from-brand-orange to-yellow-500 text-white rounded-lg p-6 shadow-lg",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-6 w-6" }),
              "Lower Your Commission Rate!"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-4", children: [
              "You're currently on the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: subscription.planName }),
              " plan with a ",
              subscription.currentRate,
              "% commission rate. Upgrade to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pro" }),
              " (12%) or ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Enterprise" }),
              " (8%) to keep more of your earnings."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/20 rounded-lg px-4 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm opacity-90", children: "Current Monthly Fee" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(subscription.monthlyFee || 0) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-8 w-8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/20 rounded-lg px-4 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm opacity-90", children: "Potential Savings" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency((subscription.currentRate - 8) / 100 * (summary?.thisMonthEarned || 0)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "/subscription/manage",
              className: "ml-4 bg-white text-brand-orange px-6 py-3 rounded-lg font-bold hover:bg-cream-sand transition shadow-lg hover:shadow-xl",
              children: "Upgrade Now"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 border-b border-cream-border overflow-x-auto", children: ["overview", "transactions", "payouts"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setActiveTab(tab),
        className: `px-6 py-3 font-semibold capitalize transition border-b-2 whitespace-nowrap ${activeTab === tab ? "border-brand-orange text-brand-orange" : "border-transparent text-brand-brown hover:text-brand-orange"}`,
        children: tab
      },
      tab
    )) }) }),
    activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5" }),
          "This Month's Earnings"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MetricBox, { label: "Gross Earnings", value: formatCurrency(monthlyReport?.grossEarnings || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricBox,
            {
              label: "Subscription Cost",
              value: `-${formatCurrency(monthlyReport?.subscriptionCost || 0)}`,
              negative: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricBox,
            {
              label: "Net Earnings",
              value: formatCurrency(monthlyReport?.netEarnings || 0),
              highlight: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-cream-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-russty", children: "Bookings this month:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-brown", children: monthlyReport?.bookingCount || 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-russty", children: "Average commission per booking:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-brown", children: formatCurrency((monthlyReport?.grossEarnings || 0) / (monthlyReport?.bookingCount || 1)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-5 w-5" }),
          "Request Payout"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-russty", children: "Available for Payout" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-brand-brown", children: formatCurrency(payoutInfo?.payoutAmount || 0) }),
            !payoutInfo?.isReadyForPayout && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-amber-600 mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-4 w-4" }),
              "Minimum payout: R",
              payoutInfo?.minimumThreshold || 100
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleRequestPayout,
              disabled: !payoutInfo?.isReadyForPayout,
              className: `px-6 py-3 rounded-lg font-bold transition shadow-md ${payoutInfo?.isReadyForPayout ? "bg-brand-orange text-white hover:bg-yellow-600 hover:shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`,
              children: "Request Payout"
            }
          )
        ] }),
        payoutMethods.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-amber-900", children: "No payment method on file" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-amber-700", children: "Add a bank account to receive payouts." })
          ] })
        ] })
      ] })
    ] }),
    activeTab === "transactions" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-cream-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown", children: "Recent Transactions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-2 text-brand-orange hover:text-yellow-600 font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          "Export CSV"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-cream-sand", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase", children: "Booking" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase", children: "Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase", children: "Commission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-brand-brown uppercase", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-cream-border", children: transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "7", className: "px-6 py-12 text-center text-brand-russty", children: "No transactions yet. Your earnings will appear here once bookings are confirmed." }) }) : transactions.map((txn) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-cream-sand/50 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-sm", children: formatDate(txn.date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-sm font-mono text-brand-brown", children: txn.bookingId }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-sm capitalize", children: txn.bookingType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-sm font-semibold", children: formatCurrency(txn.bookingAmount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${getCommissionRateColor(txn.commissionRate)}`, children: [
              txn.commissionRate,
              "%"
            ] }),
            txn.bonusApplied && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded", children: [
              "+",
              txn.bonusApplied,
              "% bonus"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-sm font-bold text-emerald-600", children: [
            "+",
            formatCurrency(txn.commissionEarned)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: txn.status }) })
        ] }, txn.id)) })
      ] }) })
    ] }),
    activeTab === "payouts" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 border-b border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown", children: "Payout History" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-cream-border", children: payoutHistory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-12 text-center text-brand-russty", children: "No payouts yet. Request your first payout when you reach R100 balance." }) : payoutHistory.map((payout) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 hover:bg-cream-sand/50 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-12 h-12 rounded-full flex items-center justify-center ${payout.status === "completed" ? "bg-green-100" : payout.status === "failed" ? "bg-red-100" : payout.status === "processing" ? "bg-blue-100" : "bg-gray-100"}`, children: [
              payout.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }),
              payout.status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-6 w-6 text-red-600" }),
              payout.status === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-6 w-6 text-blue-600" }),
              payout.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-6 w-6 text-gray-600" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-brand-brown", children: formatCurrency(payout.amount) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-brand-russty", children: [
                "Requested: ",
                formatDate(payout.requestedAt)
              ] }),
              payout.completedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-green-700", children: [
                "Completed: ",
                formatDate(payout.completedAt)
              ] }),
              payout.expectedDate && payout.status === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-700", children: [
                "Expected: ",
                formatDate(payout.expectedDate)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PayoutStatusBadge, { status: payout.status }),
            payout.referenceNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-russty mt-1", children: [
              "Ref: ",
              payout.referenceNumber
            ] })
          ] })
        ] }) }, payout.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5" }),
          "Payment Methods"
        ] }),
        payoutMethods.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-12 w-12 text-gray-300 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty mb-4", children: "No payment methods added yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-brand-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition", children: "Add Bank Account" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: payoutMethods.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between p-4 border border-cream-border rounded-lg hover:border-brand-orange transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5 text-brand-orange" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: method.bankName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-brand-russty", children: [
                    "****",
                    method.accountNumber.slice(-4)
                  ] })
                ] })
              ] }),
              method.isDefault && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-brand-orange text-white text-xs px-3 py-1 rounded-full font-semibold", children: "Default" })
            ]
          },
          method.id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
function SummaryCard({ icon: Icon, label, value, subtitle, trend, trendUp, highlight, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white rounded-lg shadow-sm border p-6 ${highlight ? "border-brand-orange ring-2 ring-brand-orange/20" : "border-cream-border"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-5 w-5 ${highlight ? "text-brand-orange" : "text-brand-brown"}` }),
      trend && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold ${trendUp ? "text-green-600" : "text-red-600"}`, children: trend })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-russty mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${className || "text-brand-brown"}`, children: value }),
    subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-russty mt-1", children: subtitle })
  ] });
}
function MetricBox({ label, value, negative, highlight }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-lg ${highlight ? "bg-green-50 border-2 border-green-200" : negative ? "bg-red-50 border border-red-200" : "bg-cream-sand border border-cream-border"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-russty mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xl font-bold ${highlight ? "text-green-700" : negative ? "text-red-700" : "text-brand-brown"}`, children: value })
  ] });
}
function StatusBadge({ status }) {
  const styles = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${styles[status] || styles.pending}`, children: [
    status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-3 w-3" }),
    status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
    status === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-3 w-3" }),
    status === "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-3 w-3" }),
    status
  ] });
}
function PayoutStatusBadge({ status }) {
  const styles = {
    completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
    processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" }
  };
  const style = styles[status] || styles.pending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`, children: style.label });
}
export {
  PartnerEarnings as default
};
//# sourceMappingURL=PartnerEarnings-DFK0ymPL.js.map
