	/* eslint-disable no-mixed-spaces-and-tabs */
	import { Link, useLocation } from "react-router-dom";
	import { useEffect, useRef, useState } from "react";
	import logoPng from "../assets/colleco-logo.png";
	import SearchBar from "./SearchBar.jsx";

export default function Navbar() {
	const location = useLocation();
	const [openMenu, setOpenMenu] = useState(null); // 'trip' | 'partner' | null
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const tripRef = useRef(null);
	const partnerRef = useRef(null);
	const mobileSearchRef = useRef(null);




	// NOTE: do not auto-close the mobile search when the sidebar opens — the
	// product requires the search button remain visible. Instead, make the
	// search overlay close on outside taps and ensure the hamburger sits above it.

	const toggleSidebar = () => {
		// Dispatch explicit open/close events so the Navbar can reliably close the
		// sidebar even if there are overlapping elements on mobile.
		try {
			if (window && window.sidebarOpen) {
				window.dispatchEvent(new CustomEvent("close-sidebar"));
			} else {
				window.dispatchEvent(new CustomEvent("open-sidebar"));
			}
		} catch (e) {
			// Fallback to toggle if CustomEvent fails for any reason
			window.dispatchEvent(new Event("toggle-sidebar"));
		}
	};

	// Book menu removed from Navbar — quick booking links moved to Sidebar for discoverability

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
				<nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-cream to-cream-sand/60 text-brand-brown shadow-md border-b border-cream-border">
							<div className="w-full flex items-center px-3 sm:px-6 h-16 sm:h-[4.5rem] relative">
								{/* Mobile: Start Living far left, logo center, hamburger far right */}
								   <div className="flex w-full items-center justify-between">
									   {/* Start Living button: visible on both mobile and desktop */}
									   <div className="flex-none">
										   <Link
											   to="/login"
											   className="h-11 w-11 rounded border border-brand-orange bg-brand-orange text-white font-semibold hover:bg-brand-highlight active:bg-brand-orange/90 transition flex flex-col items-center justify-center text-center p-0"
											   style={{ minWidth: '2.75rem', minHeight: '2.75rem' }}
										   >
											   <span className="leading-tight text-[13px] font-semibold">
												   <span>Start</span><br />
												   <span>Living</span>
											   </span>
										   </Link>
									   </div>

									   {/* Centered logo and branding for desktop and mobile */}
									   <div className="flex-1 flex justify-center">
										   <Link to="/" className="flex items-center gap-0 min-w-0" style={{ pointerEvents: 'auto' }}>
											   <img
												   src={logoPng}
												   alt="CollEco Logo"
												   className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0"
												   width="48"
												   height="48"
											   />
											   <span className="flex flex-col justify-center items-center leading-tight min-w-0">
												   <span className="hidden sm:block text-lg font-bold tracking-tight text-brand-orange leading-[1.05] w-full text-center truncate">CollEco Travel</span>
												   <span className="hidden sm:block text-[11px] font-light italic text-brand-orange mt-px tracking-wide leading-[1.1] w-full text-center truncate" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
													   The Odyssey of Adventure
												   </span>
											   </span>
										   </Link>
									   </div>
								   </div>
								{/* Desktop: SearchBar and hamburger button at far right */}
								<div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 items-center gap-3">
									<div className="w-64">
											<SearchBar />
										</div>
								<button
									type="button"
									onClick={toggleSidebar}
									className="inline-flex items-center justify-center h-11 w-11 rounded border-2 border-brand-orange bg-white text-brand-orange text-lg active:bg-brand-orange/10 transition-colors"
									aria-label="Toggle Sidebar"
									title="Toggle Sidebar"
								>
									<span className="flex flex-col gap-[2px]">
										<span className="block w-6 h-[1.5px] rounded bg-brand-orange"></span>
										<span className="block w-6 h-[1.5px] rounded bg-brand-orange"></span>
										<span className="block w-6 h-[1.5px] rounded bg-brand-orange"></span>
									</span>
								</button>
								</div>
										{/* Mobile: search and hamburger buttons. The search button remains visible when sidebar is open. */}
										<div className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 z-60">
										<button
											type="button"
											onClick={() => setShowMobileSearch(!showMobileSearch)}
											className="inline-flex items-center justify-center h-11 w-11 rounded border border-brand-orange bg-white text-brand-orange text-lg active:bg-brand-orange/10 transition-colors"
											aria-label={showMobileSearch ? "Close search" : "Open search"}
											title="Search"
										>
											{showMobileSearch ? "×" : "🔍"}
										</button>
										{/* Mobile booking removed from navbar per request */}
													<button
													type="button"
													onClick={toggleSidebar}
													className="inline-flex items-center justify-center h-11 w-11 rounded border-2 border-brand-orange bg-white text-brand-orange text-lg active:bg-brand-orange/10 transition-colors"
													aria-label="Toggle Sidebar"
													title="Toggle Sidebar"
													style={{ zIndex: 70 }}
												>
											<span className="flex flex-col gap-[2px]">
												<span className="block w-6 h-[1.5px] rounded bg-brand-orange"></span>
												<span className="block w-6 h-[1.5px] rounded bg-brand-orange"></span>
												<span className="block w-6 h-[1.5px] rounded bg-brand-orange"></span>
											</span>
										</button>
								</div>

					</div>

				{/* Mobile search overlay */}
						{showMobileSearch && (
							<div id="mobile-searchbar" ref={mobileSearchRef} className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-cream-border shadow-md z-50">
								<div className="container mx-auto px-3 py-3">
									<SearchBar whiteBackground={true} />
								</div>
							</div>
						)}
			</nav>
		);
}