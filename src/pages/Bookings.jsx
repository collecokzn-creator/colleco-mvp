import React, { useEffect, useMemo, useState } from "react";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import LiveStatCard from "../components/ui/LiveStatCard";
import FeesBreakdown from "../components/payments/FeesBreakdown";
import PaymentButton from "../components/payments/PaymentButton";
import { totalPaid } from "../utils/payments";
import PaymentsHistory from "../components/payments/PaymentsHistory";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import { isApiEnabled as providersApiEnabled, listProviders } from "../api/providersApi";
import { BookingStatusBar } from "../components/mvp/EnhancementStubs";

export default function Bookings() {
	const [providers, setProviders] = useState([]);
	const [trustedOnly, setTrustedOnly] = useState(false);
	useEffect(() => {
		(async () => {
			if (!providersApiEnabled) return;
			try { const list = await listProviders(); setProviders(list); } catch {}
		})();
	}, []);
	const verifiedIds = new Set((providers||[]).filter(p => p.verified).map(p => p.id));
  const items = useMemo(() => ([
		{ name: 'Sea View Hotel (2 nights)', amount: 180, providerId: 'hotel-123' },
		{ name: 'Table Mountain Hike', amount: 60, providerId: 'hike-789' },
  ]), []);
	const displayItems = trustedOnly && providersApiEnabled
		? items.filter(it => it.providerId && verifiedIds.has(it.providerId))
		: items;
	return (
		<div className="px-6 py-8 text-brand-brown">
			<h1 className="text-3xl font-bold mb-2">Bookings</h1>
			<p className="mb-4 text-brand-brown/80">All your confirmed items in one place — always up to date.</p>

			<div className="mb-3"><AutoSyncBanner message="Bookings sync with partners automatically — no manual refresh needed." /></div>

			<section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
				<LiveStatCard title="Upcoming" value="—" />
				<LiveStatCard title="Total paid" value={`$${totalPaid().toFixed(2)}`} />
				<LiveStatCard title="Changes pending" value="—" />
			</section>

			<section className="bg-cream-sand p-4 border border-cream-border rounded">
				<h3 className="font-bold mb-2">Upcoming bookings</h3>
				
				{/* Booking Progress Tracker */}
				<div className="mb-4 bg-white rounded-lg">
					<BookingStatusBar stage="Confirmed" />
				</div>
				
				<div className="flex items-center justify-between mb-2">
					<div className="text-sm text-brand-brown/70">Toggle trusted providers to see verified-only options.</div>
					<label className="text-sm flex items-center gap-2">
						<input type="checkbox" className="accent-brand-orange" checked={trustedOnly} onChange={e => setTrustedOnly(e.target.checked)} />
						<span>Trusted providers only</span>
					</label>
				</div>
				<ul className="text-sm space-y-2">
					<li className="rounded border border-cream-border bg-cream p-3 flex items-center justify-between">
						<div>
							<div className="font-semibold">Sea View Hotel {providersApiEnabled ? <VerifiedBadge verified={verifiedIds.has('hotel-123')} /> : null}</div>
							<div className="text-brand-brown/70">Oct 1–3 · 2 nights</div>
						</div>
						<span className="text-emerald-700 font-semibold">Confirmed</span>
					</li>
					<li className="rounded border border-cream-border bg-cream p-3 flex items-center justify-between">
						<div>
							<div className="font-semibold">Table Mountain Hike {providersApiEnabled ? <VerifiedBadge verified={verifiedIds.has('hike-789')} /> : null}</div>
							<div className="text-brand-brown/70">Oct 2 · 08:00</div>
						</div>
						<span className="text-emerald-700 font-semibold">Confirmed</span>
					</li>
				</ul>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
					<div className="md:col-span-2">
						<FeesBreakdown items={displayItems} currency="USD" />
					</div>
					<div className="flex items-start">
						<PaymentButton items={displayItems} currency="USD" />
					</div>
				</div>

				<div className="mt-6">
					<h4 className="font-semibold mb-2">Payments history</h4>
					<PaymentsHistory />
				</div>
			</section>
		</div>
	);
}