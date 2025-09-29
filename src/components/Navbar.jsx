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
	useEffect(() => { setOpenMenu(null); }, [location.pathname]);

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
		const onKey = (e) => { if (e.key === 'Escape') setOpenMenu(null); };
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	return (
		<nav className="bg-cream text-brand-brown shadow-md border-b border-cream-border fixed top-0 left-0 right-0 z-50">
			<div className="container mx-auto flex justify-between items-center px-6 h-16">
				{/* Left side - Logo + Mobile Explore toggle */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={toggleSidebar}
						className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded border border-cream-border bg-cream-sand/60 text-brand-brown"
						aria-label="Toggle Explore Sidebar"
						title="Explore"
					>
						☰
					</button>
					<Link to="/" className="flex items-center gap-0">
						<img
							src={logoPng}
							alt="CollEco Logo"
							className="h-11 w-11 sm:h-12 sm:w-12 object-contain -mt-[7px] -mr-[5px]"
							width="48"
							height="48"
						/>
						<span className="flex flex-col justify-center items-center leading-tight -mt-px">
							<span className="text-[17px] sm:text-lg font-bold tracking-tight text-brand-orange leading-[1.05] w-full text-center">CollEco Travel</span>
							<span className="text-[10px] sm:text-[11px] font-light italic text-brand-brown mt-px tracking-wide leading-[1.1] w-full text-center" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
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
									<div className="flex space-x-6 items-center">
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
							className="inline-flex items-center gap-1 px-4 py-1 rounded border border-brand-orange text-brand-orange bg-brand-orange/5 font-semibold hover:bg-brand-orange/10 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition"
							aria-haspopup="menu"
							aria-expanded={openMenu === 'trip'}
							aria-controls="trip-menu"
						>
							<span>Trip Planner</span>
							<span className="text-xs" aria-hidden>▾</span>
						</button>
						<div
							id="trip-menu"
							role="menu"
							className={`${openMenu === 'trip' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} absolute right-0 mt-2 w-48 bg-cream border border-cream-border rounded-md shadow-lg transition origin-top-right z-50`}
						>
							<Link to="/plan-trip" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Trip Planner</Link>
							<Link to="/ai" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Trip Assist</Link>
							<Link to="/quote/new" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">New Quote</Link>
							<Link to="/quotes" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Quotes</Link>
							<Link to="/itinerary" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Itinerary</Link>
							<Link to="/bookings" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Bookings</Link>
						</div>
					</div>

					{/* Partner Dashboard: click-to-toggle menu */}
					<div className="relative" ref={partnerRef}>
						<button
							type="button"
							onClick={() => setOpenMenu(m => m === 'partner' ? null : 'partner')}
							className="inline-flex items-center gap-1 px-4 py-1 rounded border border-brand-brown text-brand-brown bg-brand-brown/5 font-semibold hover:bg-brand-brown/10 focus:outline-none focus:ring-2 focus:ring-brand-brown/30 transition"
							aria-haspopup="menu"
							aria-expanded={openMenu === 'partner'}
							aria-controls="partner-menu"
						>
							<span>Partner Dashboard</span>
							<span className="text-xs" aria-hidden>▾</span>
						</button>
						<div
							id="partner-menu"
							role="menu"
							className={`${openMenu === 'partner' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} absolute right-0 mt-2 w-56 bg-cream border border-cream-border rounded-md shadow-lg transition origin-top-right z-50`}
						>
							<Link to="/partner-dashboard" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Dashboard</Link>
							<Link to="/collaboration" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Collaboration</Link>
							<Link to="/collab-analytics" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Collab Analytics</Link>
							<Link to="/admin-console" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Admin Console</Link>
							<hr className="border-cream-border my-1" />
							<Link to="/profile" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Profile</Link>
							<Link to="/settings" role="menuitem" className="block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Settings</Link>
							<button onClick={handleLogout} role="menuitem" className="w-full text-left block px-3 py-2 text-brand-brown hover:bg-cream-hover hover:text-brand-orange">Log out</button>
						</div>
					</div>

					{/* Login/Register button styled like previous Admin button */}
					<Link
						to="/login"
						className="px-4 py-1 rounded bg-gradient-to-r from-brand-orange to-brand-brown text-white font-semibold hover:from-brand-highlight hover:to-brand-orange transition"
					>
						Login / Register
					</Link>
				</div>
			</div>
		</nav>
	);
}