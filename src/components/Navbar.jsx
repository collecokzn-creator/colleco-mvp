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
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-brand-gold">
			{/* Main Navbar Container - Footer-inspired design */}
			<div className="w-full px-4 sm:px-6 py-3">
				<div className="max-w-7xl mx-auto">
					{/* Rounded white container matching footer aesthetic */}
					<div className="bg-white rounded-2xl shadow-md border border-brand-gold/30 p-3 sm:p-4">
						<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
							{/* Logo & Branding */}
							<Link to="/" className="flex items-center gap-2 shrink-0">
								<img
									src={logoPng}
									alt="CollEco Logo"
									className="h-10 w-10 object-contain"
									width="40"
									height="40"
								/>
								<div className="flex flex-col leading-tight">
									<span className="text-lg font-bold text-brand-orange">CollEco Travel</span>
									<span className="text-[10px] italic text-brand-orange/80" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
										The Odyssey of Adventure
									</span>
								</div>
							</Link>

							{/* Integrated Search Bar - Hidden on mobile, shown on desktop */}
							<div className="hidden sm:block flex-1">
								<SearchBar integrated={true} />
							</div>

							{/* Action Buttons */}
							<div className="flex items-center gap-2">
								{/* Mobile Search Toggle */}
								<button
									type="button"
									onClick={() => setShowMobileSearch(!showMobileSearch)}
									className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-full bg-brand-orange text-white hover:bg-brand-highlight transition-colors"
									aria-label={showMobileSearch ? "Close search" : "Open search"}
									title="Search"
								>
									{showMobileSearch ? (
										<span className="text-xl">×</span>
									) : (
										<span className="text-base">🔍</span>
									)}
								</button>

								{/* Start Living Button */}
								<Link
									to="/login"
									className="h-10 px-4 rounded-full bg-brand-orange text-white font-semibold hover:bg-brand-highlight transition-colors flex items-center justify-center text-sm whitespace-nowrap"
								>
									Start Living
								</Link>

								{/* Sidebar Toggle */}
								<button
									type="button"
									onClick={toggleSidebar}
									className="inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-brand-orange bg-white text-brand-orange hover:bg-brand-orange/5 transition-colors"
									aria-label="Toggle Sidebar"
									title="Menu"
								>
									<span className="flex flex-col gap-[3px]">
										<span className="block w-5 h-[2px] rounded bg-brand-orange"></span>
										<span className="block w-5 h-[2px] rounded bg-brand-orange"></span>
										<span className="block w-5 h-[2px] rounded bg-brand-orange"></span>
									</span>
								</button>
							</div>
						</div>
					</div>

					{/* Mobile Search Overlay */}
					{showMobileSearch && (
						<div className="sm:hidden border-t border-brand-gold/30 mt-3 rounded-2xl overflow-hidden">
							<div ref={mobileSearchRef} className="px-4 py-3 bg-white">
								<SearchBar integrated={true} />
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}