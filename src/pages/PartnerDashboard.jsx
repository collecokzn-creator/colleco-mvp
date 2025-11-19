// --- COMPLIANCE & DATA HANDLING STUBS ---
// API-first design; future: wire to modular API calls (products, compliance, payouts),
// add compliance status indicators and document expiry notifications.
import React from "react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { Link } from "react-router-dom";
import { BedDouble, Mountain, UtensilsCrossed, Ticket, Car, Plane, BarChart3, CreditCard, ShieldCheck, Megaphone, BookOpen, MessageSquare, CheckCircle2 } from "lucide-react";
import { useLocalStorageState } from "../useLocalStorageState";
import LiveStatCard from "../components/ui/LiveStatCard";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import ComplianceStatusCard from "../components/ui/ComplianceStatusCard";
import PromotionsBalanceCard from "../components/ui/PromotionsBalanceCard";

const PARTNER_CATEGORIES = [
  {
    title: "Product Owners",
    items: [
      { key: "hotel", label: "Hotels, lodges, guesthouses, B&Bs" },
      { key: "car-hire", label: "Car hire companies" },
      { key: "tour-activity", label: "Tour and activity operators" },
      { key: "airline", label: "Airlines (via API or direct partnerships)" },
      { key: "transfer-shuttle", label: "Transfer & shuttle providers" },
      { key: "restaurant", label: "Restaurants (Experiences & Add-Ons)" },
      { key: "sports-events", label: "Sports/Events (Events & Ticketing)" },
    ],
  },
  {
    title: "Travel Trade Partners",
    items: [
      { key: "travel-agent", label: "Travel agents" },
      { key: "tour-operator", label: "Tour operators" },
      { key: "dmc", label: "Destination management companies" },
    ],
  },
  {
    title: "Content & Marketing Partners",
    items: [
      { key: "content-creator", label: "Content creators & media" },
      { key: "marketing-agency", label: "Marketing agencies" },
    ],
  },
  {
    title: "Value-Add Partners",
    items: [
      { key: "addons", label: "Add-on suppliers (restaurants, wellness, events)" },
    ],
  },
];

export default function PartnerDashboard() {
  const [role, setRole] = useLocalStorageState("partnerRole", null);

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-7xl mx-auto text-brand-brown">
      <Breadcrumbs />
      {/* Hero / Welcome */}
      <section className="mb-4 bg-cream-sand border border-cream-border rounded p-4">
        <h2 className="text-xl font-bold">Welcome to the CollEco Partner Dashboard</h2>
        <p className="text-sm text-brand-brown/80">Your hub to manage and grow with us.</p>
      </section>

      {/* Auto-sync notice */}
      <div className="mb-4"><AutoSyncBanner /></div>

      {/* Snapshots */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <LiveStatCard title="Bookings this month" value="—" to="/bookings" icon={Ticket} />
        <LiveStatCard title="Revenue earned" value="—" to="/reports" icon={BarChart3} />
  <LiveStatCard title="Documents status" value={<span className="inline-flex items-center gap-2">Valid <VerifiedBadge verified /></span>} to="/compliance" icon={ShieldCheck} highlight="bg-emerald-500" />
      </section>

      {/* Role chip + change */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">Partner type:</span>
        <span className="px-2 py-0.5 rounded bg-brand-orange/10 text-brand-brown text-sm font-semibold">
          {(() => {
            if (!role) return "Not selected";
            for (const cat of PARTNER_CATEGORIES) {
              const found = cat.items.find((i) => i.key === role);
              if (found) return found.label;
            }
            return role;
          })()}
        </span>
        <button onClick={() => setRole(null)} className="ml-2 text-xs underline hover:text-brand-orange">
          {role ? "Change" : "Select"}
        </button>
      </div>

      {/* If no role selected, show grouped partner categories */}
      {!role && (
        <section className="bg-cream-sand p-4 border border-cream-border rounded mb-6">
          <p className="mb-3">Choose who you are partnering as:</p>
          <div className="space-y-4">
            {PARTNER_CATEGORIES.map((cat) => (
              <div key={cat.title}>
                <h3 className="font-bold mb-2 text-brand-brown">{cat.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <button
                      key={item.key}
                      className="px-3 py-2 rounded border border-brand-brown text-brand-brown bg-brand-brown/5 hover:bg-brand-brown/10 font-semibold text-left"
                      onClick={() => setRole(item.key)}
                      aria-label={`Select ${item.label}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Partner Categories (tiles with icons) */}
      <section className="mb-6">
        <h3 className="font-bold mb-2">Where to manage your business</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CategoryTile icon={BedDouble} title="Hotels & Lodges" desc="Manage rooms, rates, availability, commissions." onClick={() => setRole("hotel")} />
          <CategoryTile icon={Mountain} title="Tours & Activities" desc="Add or edit guided tours, adventure activities, day trips." onClick={() => setRole("tour-activity")} />
          <CategoryTile icon={UtensilsCrossed} title="Restaurants & Dining" desc="Promote dining packages, events, daily specials." onClick={() => setRole("restaurant")} />
          <CategoryTile icon={Ticket} title="Events & Sports" desc="List concerts, festivals, sports and local happenings." onClick={() => setRole("sports-events")} />
          <CategoryTile icon={Car} title="Car Hire & Transport" desc="Vehicle rentals, transfers, shuttle services." onClick={() => setRole("car-hire")} />
          <CategoryTile icon={Plane} title="Flights (Airlines / Agents)" desc="Inventory, pricing, and direct deals." onClick={() => setRole("airline")} />
        </div>
      </section>

      {/* Tools & Features */}
      <section className="mb-6">
        <h3 className="font-bold mb-2">Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ToolTile icon={BarChart3} title="Performance" to="/reports" desc="Bookings, revenue, exposure." />
          <ToolTile icon={CreditCard} title="Payments & Payouts" to="/payouts" desc="Payouts and reconciliation." />
          <ToolTile icon={ShieldCheck} title="Compliance Center" to="/compliance" desc="Upload licenses and insurance." />
          <ToolTile icon={Megaphone} title="Promotions Hub" to="/promotions" desc="Buy exposure or featured placements." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <ComplianceStatusCard valid={2} expiring={1} missing={0} />
          <PromotionsBalanceCard balance={0} />
        </div>
      </section>

      {/* Engagement & Support */}
      <section className="bg-cream-sand p-4 border border-cream-border rounded mb-6">
        <h3 className="font-bold mb-2">Engagement & Support</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-3 rounded border border-cream-border">
            <div className="flex items-center gap-2 mb-1"><MessageSquare className="h-5 w-5 text-brand-brown" /><span className="font-semibold">Chatbot</span></div>
            <p className="text-sm text-brand-brown/80">Use the chat bubble to get quick help.</p>
          </div>
          <Link to="/about" className="p-3 rounded border border-cream-border hover:border-brand-orange">
            <div className="flex items-center gap-2 mb-1"><BookOpen className="h-5 w-5 text-brand-brown" /><span className="font-semibold">Knowledge base</span></div>
            <p className="text-sm text-brand-brown/80">Searchable FAQs and guides.</p>
          </Link>
          <Link to="/about" className="p-3 rounded border border-cream-border hover:border-brand-orange">
            <div className="flex items-center gap-2 mb-1"><Megaphone className="h-5 w-5 text-brand-brown" /><span className="font-semibold">Partner stories</span></div>
            <p className="text-sm text-brand-brown/80">Success stories and tips.</p>
          </Link>
        </div>
      </section>

      {/* CollEco Advantage */}
      <section className="bg-cream p-4 border border-cream-border rounded">
        <h3 className="font-bold mb-2">Why partners love CollEco</h3>
        <ul className="space-y-1 text-sm">
          <AdvantageItem text="Visibility to international clients" />
          <AdvantageItem text="Automated payments" />
          <AdvantageItem text="Marketing support" />
          <AdvantageItem text="24/7 partner support" />
        </ul>
      </section>
    </div>
    </div>
  );
}

function CategoryTile({ icon: Icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="text-left bg-cream-sand border border-cream-border rounded p-4 hover:border-brand-orange hover:shadow-sm transition">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={18} className="text-brand-orange" />
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-sm text-brand-brown/80">{desc}</p>
    </button>
  );
}

function ToolTile({ icon: Icon, title, desc, to }) {
  return (
    <Link to={to} className="block bg-cream-sand border border-cream-border rounded p-4 hover:border-brand-orange hover:shadow-sm transition">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={18} className="text-brand-orange" />
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-sm text-brand-brown/80">{desc}</p>
    </Link>
  );
}

function AdvantageItem({ text }) {
  return (
    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-orange" /> <span>{text}</span></li>
  );
}
