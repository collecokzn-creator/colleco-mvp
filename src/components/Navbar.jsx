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

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-gold/20 backdrop-blur-sm bg-white/95">
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				<div className="flex items-center justify-between h-14">
					{/* Logo & Branding - Compact */}
					<Link to="/" className="flex items-center gap-2 shrink-0">
						<img
							src={logoPng}
							alt="CollEco"
							className="h-8 w-8 object-contain"
							width="32"
							height="32"
						/>
						<span className="hidden sm:inline text-base font-bold text-brand-orange">CollEco</span>
					</Link>

					{/* Search Bar - Center on desktop */}
					<div className="hidden md:block flex-1 max-w-md mx-6">
						<SearchBar integrated={true} />
					</div>

					{/* Action Buttons - Compact */}
					<div className="flex items-center gap-2">
						{/* Mobile Search Toggle */}
						<button
							type="button"
							onClick={() => setShowMobileSearch(!showMobileSearch)}
							className="md:hidden p-2 text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-colors"
							aria-label={showMobileSearch ? "Close search" : "Open search"}
						>
							<span className="text-lg">{showMobileSearch ? '×' : '🔍'}</span>
						</button>

						{/* Start Living Button */}
						<Link
							to="/login"
							className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-orange hover:bg-brand-highlight rounded-lg transition-colors"
						>
							Start Living
						</Link>

						{/* Menu Toggle */}
						<button
							type="button"
							onClick={toggleSidebar}
							className="p-2 text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-colors"
							aria-label="Menu"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Search Dropdown */}
				{showMobileSearch && (
					<div ref={mobileSearchRef} className="md:hidden pb-3 px-2">
						<SearchBar integrated={true} />
					</div>
				)}
			</div>
		</nav>
	);
}