import React, { useEffect, useMemo, useState } from "react";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import LiveStatCard from "../components/ui/LiveStatCard";
import FeesBreakdown from "../components/payments/FeesBreakdown";
import PaymentButton from "../components/payments/PaymentButton";
import { totalPaid } from "../utils/payments";
import PaymentsHistory from "../components/payments/PaymentsHistory";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import { isApiEnabled as providersApiEnabled, listProviders } from "../api/providersApi";
import WorkflowPanel from "../components/WorkflowPanel";
import { BookingStatusBar } from "../components/mvp/EnhancementStubs";

export default function Bookings() {
	const [providers, setProviders] = useState([]);
	const [trustedOnly, setTrustedOnly] = useState(false);
	// Filter and sort state
	const [statusFilter, setStatusFilter] = useState(() => {
		try { return localStorage.getItem('bookings:statusFilter') || 'all'; } catch { return 'all'; }
	}); // 'all' | 'pending' | 'confirmed' | 'completed'
	const [sortBy, setSortBy] = useState(() => {
		try { return localStorage.getItem('bookings:sortBy') || 'date'; } catch { return 'date'; }
	}); // 'date' | 'price' | 'status'
	const [searchTerm, setSearchTerm] = useState('');
	
	// Persist preferences
	useEffect(() => { try { localStorage.setItem('bookings:statusFilter', statusFilter); } catch {} }, [statusFilter]);
	useEffect(() => { try { localStorage.setItem('bookings:sortBy', sortBy); } catch {} }, [sortBy]);
	
	useEffect(() => {
		(async () => {
			if (!providersApiEnabled) return;
			try { const list = await listProviders(); setProviders(list); } catch {}
		})();
	}, []);
	const verifiedIds = new Set((providers||[]).filter(p => p.verified).map(p => p.id));
	
  // Mock items with status and dates
  const items = useMemo(() => ([
		{ 
			name: 'Sea View Hotel (2 nights)', 
			amount: 180, 
			providerId: 'hotel-123',
			status: 'confirmed',
			date: '2024-10-01',
			category: 'Accommodation'
		},
		{ 
			name: 'Table Mountain Hike', 
			amount: 60, 
			providerId: 'hike-789',
			status: 'confirmed',
			date: '2024-10-02',
			category: 'Activity'
		},
		{
			name: 'Airport Transfer',
			amount: 45,
			providerId: 'transfer-456',
			status: 'pending',
			date: '2024-09-30',
			category: 'Transport'
		},
		{
			name: 'Safari Tour (3 days)',
			amount: 320,
			providerId: 'safari-321',
			status: 'completed',
			date: '2024-09-15',
			category: 'Activity'
		}
  ]), []);
  
  // Filter and sort logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];
    
    // Apply trusted filter
    if (trustedOnly && providersApiEnabled) {
      filtered = filtered.filter(it => it.providerId && verifiedIds.has(it.providerId));
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(it => it.status === statusFilter);
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(it => 
        it.name.toLowerCase().includes(term) ||
        it.category.toLowerCase().includes(term) ||
        it.status.toLowerCase().includes(term)
      );
    }
    
    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'status') {
      const order = { pending: 0, confirmed: 1, completed: 2 };
      filtered.sort((a, b) => order[a.status] - order[b.status]);
    }
    
    return filtered;
  }, [items, trustedOnly, verifiedIds, statusFilter, searchTerm, sortBy]);
  
  // Export to CSV
  function exportToCSV() {
  	const headers = ['Name', 'Amount', 'Status', 'Date', 'Category'];
  	const rows = filteredAndSortedItems.map(it => [
  		it.name,
  		it.amount,
  		it.status,
  		it.date,
  		it.category
  	]);
  	const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  	const blob = new Blob([csv], { type: 'text/csv' });
  	const url = URL.createObjectURL(blob);
  	const a = document.createElement('a');
  	a.href = url;
  	a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
  	document.body.appendChild(a);
  	a.click();
  	document.body.removeChild(a);
  	URL.revokeObjectURL(url);
  }
  
  const statusBadgeColor = (status) => {
  	if (status === 'confirmed') return 'text-emerald-700';
  	if (status === 'pending') return 'text-amber-600';
  	if (status === 'completed') return 'text-gray-600';
  	return 'text-brand-brown';
  };
  
	return (
		<div className="overflow-x-hidden">
			<div className="max-w-7xl mx-auto px-6 py-8 text-brand-brown">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-3xl font-bold">Bookings</h1>
					<button
						onClick={exportToCSV}
						className="px-3 py-2 rounded border border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white transition text-sm"
						title="Export to CSV"
					>
						📥 Export
					</button>
				</div>
				<p className="mb-4 text-brand-brown/80">All your confirmed items in one place — always up to date.</p>

			<div className="mb-3"><AutoSyncBanner message="Bookings sync with partners automatically — no manual refresh needed." /></div>

			{/* Workflow Panel */}
			<div className="mb-6">
				<WorkflowPanel currentPage="bookings" basketCount={0} />
			</div>

			<section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
				<LiveStatCard title="Upcoming" value="—" />
				<LiveStatCard title="Total paid" value={`$${totalPaid().toFixed(2)}`} />
				<LiveStatCard title="Changes pending" value="—" />
			</section>
			
			{/* Filters and Search */}
			<section className="bg-cream-sand p-4 border border-cream-border rounded mb-4">
				<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
					{/* Search */}
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search bookings..."
						className="w-full sm:w-64 px-3 py-2 text-sm border border-cream-border rounded bg-white"
						aria-label="Search bookings"
					/>
					
					{/* Sort */}
					<div className="flex items-center gap-2">
						<span className="text-sm text-brand-brown/70">Sort:</span>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="px-2 py-1 text-sm border border-cream-border rounded bg-white"
							aria-label="Sort by"
						>
							<option value="date">Date</option>
							<option value="price">Price</option>
							<option value="status">Status</option>
						</select>
					</div>
				</div>
				
				{/* Status Filter Tabs */}
				<div className="flex flex-wrap gap-2 mb-3">
					{['all', 'pending', 'confirmed', 'completed'].map(status => (
						<button
							key={status}
							onClick={() => setStatusFilter(status)}
							className={`px-3 py-1.5 text-sm rounded-md transition ${
								statusFilter === status
									? 'bg-brand-orange text-white'
									: 'bg-white border border-cream-border text-brand-brown hover:bg-cream-hover'
							}`}
						>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</button>
					))}
				</div>
				
				{/* Trusted providers toggle */}
				<label className="text-sm flex items-center gap-2">
					<input type="checkbox" className="accent-brand-orange" checked={trustedOnly} onChange={e => setTrustedOnly(e.target.checked)} />
					<span>Trusted providers only</span>
				</label>
			</section>

			<section className="bg-cream-sand p-4 border border-cream-border rounded">
				<h3 className="font-bold mb-2">Bookings ({filteredAndSortedItems.length})</h3>
				
				{/* Booking Progress Tracker */}
				<div className="mb-4 bg-white rounded-lg">
					<BookingStatusBar stage="Confirmed" />
				</div>
				
				{filteredAndSortedItems.length === 0 ? (
					<div className="text-sm text-brand-brown/70 py-8 text-center">
						No bookings found. {statusFilter !== 'all' && 'Try changing the filter.'}
					</div>
				) : (
					<ul className="text-sm space-y-2">
						{filteredAndSortedItems.map((item, idx) => (
							<li key={idx} className="rounded border border-cream-border bg-cream p-3 flex items-center justify-between">
								<div>
									<div className="font-semibold">
										{item.name} {providersApiEnabled ? <VerifiedBadge verified={verifiedIds.has(item.providerId)} /> : null}
									</div>
									<div className="text-brand-brown/70">
										{new Date(item.date).toLocaleDateString()} · ${item.amount} · {item.category}
									</div>
								</div>
								<span className={`font-semibold ${statusBadgeColor(item.status)}`}>
									{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
								</span>
							</li>
						))}
					</ul>
				)}
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
					<div className="md:col-span-2">
						<FeesBreakdown items={filteredAndSortedItems} currency="USD" />
					</div>
					<div className="flex items-start">
						<PaymentButton items={filteredAndSortedItems} currency="USD" />
					</div>
				</div>

				<div className="mt-6">
					<h4 className="font-semibold mb-2">Payments history</h4>
					<PaymentsHistory />
				</div>
			</section>
		</div>
		</div>
	);
}