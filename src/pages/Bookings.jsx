import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import LiveStatCard from "../components/ui/LiveStatCard";
import FeesBreakdown from "../components/payments/FeesBreakdown";
import PaymentButton from "../components/payments/PaymentButton";
import Button from "../components/ui/Button.jsx";
import { totalPaid } from "../utils/payments";
import PaymentsHistory from "../components/payments/PaymentsHistory";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import { isApiEnabled as providersApiEnabled, listProviders } from "../api/providersApi";
import WorkflowPanel from "../components/WorkflowPanel";

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
	
	// Smart automation refs
	const autoRefreshTimerRef = useRef(null);
	const lastRecommendationRef = useRef(null);
	
	// Persist preferences
	useEffect(() => { try { localStorage.setItem('bookings:statusFilter', statusFilter); } catch {} }, [statusFilter]);
	useEffect(() => { try { localStorage.setItem('bookings:sortBy', sortBy); } catch {} }, [sortBy]);
	
	// Auto-refresh bookings from localStorage every 30 seconds
	useEffect(() => {
		const refresh = () => {
			try {
				const saved = localStorage.getItem('colleco.bookings');
				if (saved) {
					// Silent refresh - updates happen in background
					const _bookings = JSON.parse(saved); // future state usage
					// Store would update here if using state management
				}
			} catch {}
		};
		
		autoRefreshTimerRef.current = setInterval(refresh, 30000);
		return () => {
			if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
		};
	}, []);
	
	// Smart urgency detection - auto-sort pending items by date proximity
	const smartSort = useCallback((items) => {
		const now = new Date();
		return items.sort((a, b) => {
			// Pending items within 48 hours get priority
			const aDate = new Date(a.date);
			const bDate = new Date(b.date);
			const aUrgent = a.status === 'pending' && (aDate - now) < 48 * 60 * 60 * 1000;
			const bUrgent = b.status === 'pending' && (bDate - now) < 48 * 60 * 60 * 1000;
			
			if (aUrgent && !bUrgent) return -1;
			if (!aUrgent && bUrgent) return 1;
			
			// Then apply user's selected sort
			if (sortBy === 'date') return bDate - aDate;
			if (sortBy === 'price') return b.amount - a.amount;
			if (sortBy === 'status') {
				const order = { pending: 0, confirmed: 1, completed: 2 };
				return order[a.status] - order[b.status];
			}
			return 0;
		});
	}, [sortBy]);
	
	// Auto-recommendation system
	const getSmartRecommendation = (items) => {
		const pendingCount = items.filter(i => i.status === 'pending').length;
		const upcomingCount = items.filter(i => {
			const days = Math.ceil((new Date(i.date) - new Date()) / (1000 * 60 * 60 * 24));
			return days >= 0 && days <= 7 && i.status === 'confirmed';
		}).length;
		
		if (pendingCount > 2) return '⚡ You have multiple pending bookings. Consider confirming soon.';
		if (upcomingCount > 0) return `📅 ${upcomingCount} booking${upcomingCount > 1 ? 's' : ''} coming up this week!`;
		if (items.length === 0) return '✨ Start planning your next adventure!';
		return null;
	};
	
	useEffect(() => {
		(async () => {
			if (!providersApiEnabled) return;
			try { const list = await listProviders(); setProviders(list); } catch {}
		})();
	}, []);
	const verifiedIds = useMemo(() => new Set((providers||[]).filter(p => p.verified).map(p => p.id)), [providers]);
	
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
  
  // Filter and sort logic with smart enhancements
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
    
    // Smart sort with urgency detection
    return smartSort(filtered);
	}, [items, trustedOnly, verifiedIds, statusFilter, searchTerm, smartSort]);
  
  // Get smart recommendation
  const recommendation = useMemo(() => {
    const rec = getSmartRecommendation(filteredAndSortedItems);
    lastRecommendationRef.current = rec;
    return rec;
  }, [filteredAndSortedItems]);
  
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
  
	const _statusBadgeColor = (status) => { // currently not used; placeholder for future badge styling
    if (status === 'confirmed') return 'text-emerald-700';
    if (status === 'pending') return 'text-amber-600';
    if (status === 'completed') return 'text-gray-600';
    return 'text-brand-brown';
  };
  
	return (
		<div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream-sand overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
				{/* Professional Header */}
				<div className="mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
					<div>
						<h1 className="text-3xl sm:text-4xl font-bold text-brand-brown">
							Bookings
						</h1>
							<p className="mt-2 text-brand-russty text-sm sm:text-base">All your confirmed items in one place — always up to date.</p>
						</div>
						<div className="flex items-center gap-2 sm:gap-3">
							<Link to="/check-in">
								<Button variant="primary" size="md">Check-In</Button>
							</Link>
							<Button variant="outline" size="md" onClick={exportToCSV} title="Export to CSV">
								<span className="hidden sm:inline">Export</span>
								<span className="sm:hidden">CSV</span>
							</Button>
						</div>
					</div>
				</div>

				{/* Smart Recommendation */}
				{recommendation && (
					<div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-brand-orange rounded-lg p-4 shadow-sm">
						<p className="text-sm sm:text-base text-brand-brown font-medium">{recommendation}</p>
					</div>
				)}

			<div className="mb-3"><AutoSyncBanner message="Bookings sync with partners automatically — no manual refresh needed." /></div>

			{/* Workflow Panel */}
			<div className="mb-6">
				<WorkflowPanel currentPage="bookings" basketCount={0} />
			</div>

			<section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
				<LiveStatCard title="Upcoming" value="—" />
				<LiveStatCard title="Total paid" value={`$${totalPaid().toFixed(2)}`} />
				<LiveStatCard title="Changes pending" value="—" />
			</section>
			
			{/* Filters and Search */}
			<section className="bg-white rounded-xl shadow-md border border-cream-border p-4 sm:p-6 mb-4 sm:mb-6">
				<h3 className="text-lg font-bold text-brand-brown mb-4">Filter & Search</h3>
				
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-4">
					{/* Search */}
					<div className="flex-1">
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-russty">🔍</span>
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search bookings..."
								className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-cream-border rounded-lg bg-cream focus:border-brand-orange focus:outline-none transition-colors"
								aria-label="Search bookings"
							/>
						</div>
					</div>
					
					{/* Sort */}
					<div className="flex items-center gap-2 sm:min-w-[160px]">
						<span className="text-sm font-semibold text-brand-brown whitespace-nowrap">Sort by:</span>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="flex-1 px-3 py-2.5 text-sm border-2 border-cream-border rounded-lg bg-cream focus:border-brand-orange focus:outline-none transition-colors font-medium"
							aria-label="Sort by"
						>
							<option value="date">Date</option>
							<option value="price">Price</option>
							<option value="status">Status</option>
						</select>
					</div>
				</div>
				
				{/* Status Filter Tabs */}
				<div className="mb-4">
					<p className="text-sm font-semibold text-brand-brown mb-2">Status:</p>
					<div className="flex flex-wrap gap-2">
						{['all', 'pending', 'confirmed', 'completed'].map(status => (
							<button
								key={status}
								onClick={() => setStatusFilter(status)}
								className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
									statusFilter === status
										? 'bg-brand-orange text-white shadow-md'
										: 'bg-cream border-2 border-cream-border text-brand-brown hover:border-brand-orange hover:bg-cream-sand'
								}`}
							>
								{status.charAt(0).toUpperCase() + status.slice(1)}
							</button>
						))}
					</div>
				</div>
				
				{/* Trusted providers toggle */}
				<label className="inline-flex items-center gap-2 text-sm font-medium text-brand-brown cursor-pointer hover:text-brand-orange transition-colors">
					<input type="checkbox" className="w-4 h-4 accent-brand-orange rounded" checked={trustedOnly} onChange={e => setTrustedOnly(e.target.checked)} />
					<span>Show trusted providers only</span>
					<span className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">✓</span>
				</label>
			</section>

			<section className="bg-white rounded-xl shadow-sm border border-cream-border p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-brand-brown">Your Bookings</h3>
					<span className="px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold">
						{filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'}
					</span>
				</div>
				
				{filteredAndSortedItems.length === 0 ? (
					<div className="py-12 sm:py-16 text-center">
						<div className="text-6xl mb-4">📋</div>
						<p className="text-brand-brown/70 text-base sm:text-lg mb-2">No bookings found</p>
						{statusFilter !== 'all' && (
							<p className="text-sm text-brand-russty">Try changing the filter to see more results</p>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{filteredAndSortedItems.map((item, idx) => (
							<div key={idx} className="bg-white border border-cream-border hover:border-brand-orange rounded-xl p-5 transition-all hover:shadow-md">
								<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-start gap-2 mb-3">
											<h4 className="font-bold text-brand-brown text-lg">
												{item.name}
											</h4>
											{providersApiEnabled ? <VerifiedBadge verified={verifiedIds.has(item.providerId)} /> : null}
										</div>
										<div className="flex flex-col gap-2">
											<div className="flex items-center gap-2 text-sm text-brand-russty">
												<span className="font-medium">Date:</span>
												<span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-brand-russty">Amount:</span>
												<span className="font-bold text-brand-orange">${item.amount}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="px-3 py-1 bg-cream-sand text-brand-brown rounded-lg text-xs font-semibold">
													{item.category}
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-start">
										<span className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ${
											item.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
											item.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
											'bg-white text-brand-russty border border-cream-border'
										}`}>
											{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
				
				{filteredAndSortedItems.length > 0 && (
					<div className="mt-6 sm:mt-8 pt-6 border-t-2 border-cream-border overflow-x-auto">
						<h4 className="text-lg font-bold text-brand-brown mb-4">Payment Summary</h4>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
							<div className="lg:col-span-2">
								<FeesBreakdown items={filteredAndSortedItems} currency="USD" />
							</div>
							<div className="flex items-start">
								<PaymentButton items={filteredAndSortedItems} currency="USD" />
							</div>
						</div>
					</div>
				)}

				<div className="mt-6 sm:mt-8 pt-6 border-t-2 border-cream-border">
					<h4 className="text-lg font-bold text-brand-brown mb-4">Payments History</h4>
					<PaymentsHistory />
				</div>
			</section>
		</div>
		</div>
	);
}