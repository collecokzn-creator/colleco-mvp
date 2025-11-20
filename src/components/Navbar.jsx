/* eslint-disable no-mixed-spaces-and-tabs */
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logoPng from "../assets/colleco-logo.png";
import SearchBar from "./SearchBar.jsx";

export default function Navbar() {
	const location = useLocation();
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const mobileSearchRef = useRef(null);

	const toggleSidebar = () => {
		try {
			if (window && window.sidebarOpen) {
				window.dispatchEvent(new CustomEvent("close-sidebar"));
			} else {
				window.dispatchEvent(new CustomEvent("open-sidebar"));
			}
		} catch (e) {
			window.dispatchEvent(new Event("toggle-sidebar"));
		}
	};

	// Close mobile search on route change
	useEffect(() => { 
		setShowMobileSearch(false);
	}, [location.pathname]);

	// Close on Esc
	useEffect(() => {
		const onKey = (e) => { 
			if (e.key === 'Escape') {
				setShowMobileSearch(false);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	// Close mobile search on outside click/tap
	useEffect(() => {
		if (!showMobileSearch) return undefined;
		const onDown = (e) => {
			const node = mobileSearchRef.current;
			if (!node) return;
			if (!node.contains(e.target)) setShowMobileSearch(false);
		};
		document.addEventListener('mousedown', onDown);
		document.addEventListener('touchstart', onDown, { passive: true });
		return () => {
			document.removeEventListener('mousedown', onDown);
			document.removeEventListener('touchstart', onDown);
		};
	}, [showMobileSearch]);

	const primaryLinks = [
		{ to: '/plan-trip', label: 'Plan' },
		{ to: '/itinerary', label: 'Itinerary' },
		{ to: '/ai', label: 'Trip Assist' },
		{ to: '/bookings', label: 'Bookings' }
	];

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm shadow-md border-b border-brand-gold/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				<div className="flex items-center justify-between h-16">
				{/* Logo & Branding */}
				<Link to="/" className="flex items-center gap-2.5 shrink-0">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-brand-gold/20 rounded-lg blur-sm"></div>
						<img
							src={logoPng}
							alt="CollEco Travel"
							className="relative h-10 w-10 object-contain transition-all duration-300 hover:scale-110"
							style={{
								filter: 'drop-shadow(3px 3px 6px rgba(179, 84, 30, 0.4)) drop-shadow(-2px -2px 3px rgba(255, 255, 255, 0.9)) brightness(1.1) contrast(1.1)',
								transform: 'perspective(200px) rotateY(-8deg) rotateX(2deg)',
								background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,247,238,0.8))',
								borderRadius: '8px',
								padding: '2px'
							}}
							width="40"
							height="40"
						/>
					</div>
					<div className="hidden sm:flex flex-col leading-tight">
						<span className="text-base font-bold text-brand-orange">CollEco Travel</span>
						<span className="text-[10px] text-brand-brown italic" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>The Odyssey of Adventure</span>
					</div>
				</Link>					{/* Search Bar - Center on desktop */}
					<div className="hidden md:block flex-1 max-w-lg mx-6">
						<SearchBar integrated={true} />
					</div>

					{/* Action Buttons */}
					<div className="hidden lg:flex items-center gap-4 ml-4">
						{primaryLinks.map(l => {
							const active = location.pathname.startsWith(l.to);
							return (
								<Link
									key={l.to}
									to={l.to}
									className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${active ? 'bg-brand-orange text-white shadow-sm' : 'text-brand-brown hover:bg-cream-hover'}`}
								>
									{l.label}
								</Link>
							);
						})}
					</div>
					<div className="flex items-center gap-3 ml-auto">
						{/* Mobile Search Toggle */}
						<button
							type="button"
							onClick={() => setShowMobileSearch(!showMobileSearch)}
							className="md:hidden p-2 text-brand-brown hover:text-brand-orange hover:bg-cream-hover rounded-md transition-colors"
							aria-label={showMobileSearch ? "Close search" : "Open search"}
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</button>

						{/* Start Living Button */}
						<Link
							to="/login"
							className="px-4 py-2 text-sm font-semibold text-white bg-brand-orange hover:bg-brand-highlight rounded-md shadow-sm transition-colors"
						>
							Start Living
						</Link>

						{/* Menu Toggle */}
						<button
							type="button"
							onClick={toggleSidebar}
							className="p-2 text-brand-brown hover:text-brand-orange hover:bg-cream-hover rounded-md transition-colors"
							aria-label="Menu"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Search Dropdown */}
				{showMobileSearch && (
					<div ref={mobileSearchRef} className="md:hidden border-t border-brand-gold/20 pb-3 px-2">
						<div className="pt-3">
							<SearchBar integrated={true} />
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}