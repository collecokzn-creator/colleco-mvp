import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logoPng from "../assets/colleco-logo.png";
import SearchBar from "./SearchBar.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const [llmInfo, setLlmInfo] = useState(null);
	const [openMenu, setOpenMenu] = useState(null); // 'trip' | 'partner' | null
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const tripRef = useRef(null);
	const partnerRef = useRef(null);

	useEffect(() => {
		let canceled = false;
		(async () => {
			try {
				const tokenParam = import.meta.env.VITE_API_TOKEN ? `?token=${import.meta.env.VITE_API_TOKEN}` : "";
				const res = await fetch(`${API_BASE}/api/ai/config${tokenParam}`);
				if (!res.ok) return;
				const j = await res.json();
				if (!canceled) setLlmInfo(j.llm || null);
			} catch {}
		})();
		return () => { canceled = true; };
	}, []);

	const handleLogout = () => {
		try {
			localStorage.removeItem("authToken");
			localStorage.removeItem("user");
		} finally {
			navigate("/login");
		}
	};

	const toggleSidebar = () => {
		window.dispatchEvent(new Event('toggle-sidebar'));
	};

	// Close menus on route change for cleanliness
	useEffect(() => { 
		setOpenMenu(null); 
		setShowMobileSearch(false);
	}, [location.pathname]);

	// Close menus on outside click
	useEffect(() => {
		const onClick = (e) => {
			const t = tripRef.current;
			const p = partnerRef.current;
			if (openMenu && t && !t.contains(e.target) && p && !p.contains(e.target)) {
				setOpenMenu(null);
			}
		};
		document.addEventListener('mousedown', onClick);
		return () => document.removeEventListener('mousedown', onClick);
	}, [openMenu]);

	// Close on Esc
	useEffect(() => {
		const onKey = (e) => { 
			if (e.key === 'Escape') {
				setOpenMenu(null);
				setShowMobileSearch(false);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	return (
		<nav className="bg-cream text-brand-brown shadow-md border-b border-cream-border fixed top-0 left-0 right-0 z-50">
			<div className="container mx-auto flex justify-between items-center px-3 sm:px-6 h-16 sm:h-[4.5rem]">
				{/* Left side - Logo + Mobile Explore toggle */}
				<div className="flex items-center gap-2 sm:gap-3">
					<button
						type="button"
						onClick={toggleSidebar}
						className="sm:hidden inline-flex items-center justify-center h-11 w-11 rounded border border-cream-border bg-cream-sand/60 text-brand-brown text-lg active:bg-cream-sand/80 transition-colors"
						aria-label="Toggle Explore Sidebar"
						title="Explore"
					>
						☰
					</button>
					<Link to="/" className="flex items-center gap-0 min-w-0">
						<img
							src={logoPng}
							alt="CollEco Logo"
							className="h-10 w-10 sm:h-12 sm:w-12 object-contain -mt-[7px] -mr-[5px] shrink-0"
							width="48"
							height="48"
						/>
						<span className="flex flex-col justify-center items-center leading-tight -mt-px min-w-0">
							<span className="text-[15px] sm:text-lg font-bold tracking-tight text-brand-orange leading-[1.05] w-full text-center truncate">CollEco Travel</span>
							<span className="text-[9px] sm:text-[11px] font-light italic text-brand-brown mt-px tracking-wide leading-[1.1] w-full text-center truncate" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
								The Odyssey of Adventure
							</span>
						</span>
					</Link>
							</div>
							{/* Global search (hidden on very small screens to save space) */}
							<div className="hidden sm:block flex-1 mx-4">
								<SearchBar />
							</div>

									{/* Right side - Menu */}
									<div className="flex space-x-2 sm:space-x-4 lg:space-x-6 items-center">
					{/* Mobile search button (only visible on small screens) */}
					<button
						type="button"
						onClick={() => setShowMobileSearch(!showMobileSearch)}
						className="sm:hidden inline-flex items-center justify-center h-11 w-11 rounded border border-cream-border bg-cream-sand/60 text-brand-brown text-lg active:bg-cream-sand/80 transition-colors"
						aria-label={showMobileSearch ? "Close search" : "Open search"}
						title="Search"
					>
						{showMobileSearch ? '×' : '🔍'}
					</button>

					{/* LLM provider badge (links to metrics) */}
					{llmInfo && (
						<Link to="/ai/metrics" className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-cream-border bg-cream-sand/60 text-[10px] text-brand-brown hover:bg-cream-sand" title="AI metrics">
							<span className="uppercase tracking-wider">LLM</span>
							<span className="font-semibold">{llmInfo.provider}</span>
							{llmInfo.model && <span className="text-brand-brown/70">· {llmInfo.model}</span>}
						</Link>
					)}

					{/* Trip Planner: click-to-toggle menu */}
					<div className="relative" ref={tripRef}>
						<button
							type="button"
							onClick={() => setOpenMenu(m => m === 'trip' ? null : 'trip')}
							className="inline-flex items-center gap-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-1 rounded border border-brand-orange text-brand-orange bg-brand-orange/5 font-semibold hover:bg-brand-orange/10 active:bg-brand-orange/15 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition text-sm sm:text-base min-h-[44px] sm:min-h-0"
							aria-haspopup="menu"
							aria-expanded={openMenu === 'trip'}
							aria-controls="trip-menu"
						>
							<span className="hidden sm:inline">Trip Planner</span>
							<span className="sm:hidden">Trip</span>
							<span className="text-xs" aria-hidden>▾</span>
						</button>
						<div
							id="trip-menu"
							role="menu"
							className={`${openMenu === 'trip' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} absolute right-0 sm:right-auto sm:left-0 mt-2 w-48 sm:w-52 bg-cream border border-cream-border rounded-md shadow-lg transition origin-top-right sm:origin-top-left z-50`}
						>
							<Link to="/plan-trip" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Trip Planner</Link>
							<Link to="/ai" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Trip Assist</Link>
							<Link to="/quote/new" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">New Quote</Link>
							<Link to="/quotes" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Quotes</Link>
							<Link to="/itinerary" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Itinerary</Link>
							<Link to="/bookings" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Bookings</Link>
						</div>
					</div>

					{/* Partner Dashboard: click-to-toggle menu */}
					<div className="relative" ref={partnerRef}>
						<button
							type="button"
							onClick={() => setOpenMenu(m => m === 'partner' ? null : 'partner')}
							className="inline-flex items-center gap-1 px-2 sm:px-3 lg:px-4 py-2 sm:py-1 rounded border border-brand-brown text-brand-brown bg-brand-brown/5 font-semibold hover:bg-brand-brown/10 active:bg-brand-brown/15 focus:outline-none focus:ring-2 focus:ring-brand-brown/30 transition text-sm sm:text-base min-h-[44px] sm:min-h-0"
							aria-haspopup="menu"
							aria-expanded={openMenu === 'partner'}
							aria-controls="partner-menu"
						>
							<span className="hidden sm:inline">Partner Dashboard</span>
							<span className="sm:hidden">Partner</span>
							<span className="text-xs" aria-hidden>▾</span>
						</button>
						<div
							id="partner-menu"
							role="menu"
							className={`${openMenu === 'partner' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} absolute right-0 sm:right-auto sm:left-0 mt-2 w-56 sm:w-60 bg-cream border border-cream-border rounded-md shadow-lg transition origin-top-right sm:origin-top-left z-50`}
						>
							<Link to="/partner-dashboard" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Dashboard</Link>
							<Link to="/collaboration" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Collaboration</Link>
							<Link to="/collab-analytics" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Collab Analytics</Link>
							<Link to="/admin-console" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Admin Console</Link>
							<hr className="border-cream-border my-1" />
							<Link to="/profile" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Profile</Link>
							<Link to="/settings" role="menuitem" className="block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Settings</Link>
							<button onClick={handleLogout} role="menuitem" className="w-full text-left block px-4 py-3 sm:px-3 sm:py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange active:bg-cream-hover/80 transition-colors">Log out</button>
						</div>
					</div>

					{/* Login/Register button styled like previous Admin button */}
					<Link
						to="/login"
						className="px-2 sm:px-3 lg:px-4 py-2 sm:py-1 rounded bg-gradient-to-r from-brand-orange to-brand-brown text-white font-semibold hover:from-brand-highlight hover:to-brand-orange active:from-brand-highlight/90 active:to-brand-orange/90 transition text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center justify-center"
					>
						<span className="hidden sm:inline">Login / Register</span>
						<span className="sm:hidden">Login</span>
					</Link>
				</div>
			</div>
			
			{/* Mobile search overlay */}
			{showMobileSearch && (
				<div className="sm:hidden absolute top-full left-0 right-0 bg-cream border-b border-cream-border shadow-md z-40">
					<div className="container mx-auto px-3 py-3">
						<SearchBar />
					</div>
				</div>
			)}
		</nav>
	);
}