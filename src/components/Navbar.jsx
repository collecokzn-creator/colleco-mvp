import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import logoPng from "../assets/colleco-logo.png";
import SearchBar from "./SearchBar.jsx";

export default function Navbar() {
	const location = useLocation();
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const mobileSearchRef = useRef(null);

	const toggleSidebar = () => {
		window.dispatchEvent(new Event('toggle-sidebar'));
	};

	// Close search on route change for cleanliness
	useEffect(() => { 
		setShowMobileSearch(false);
	}, [location.pathname]);

	// Close search on Esc
	useEffect(() => {
		const onKey = (e) => { 
			if (e.key === 'Escape') {
				setShowMobileSearch(false);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	// Close mobile search on click outside
	useEffect(() => {
		if (!showMobileSearch) return;

		const handleClickOutside = (event) => {
			if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
				// Don't close if clicking on the search button itself
				const searchButton = event.target.closest('button[title="Search"]');
				if (searchButton) return;
				
				setShowMobileSearch(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, [showMobileSearch]);

	return (
		<nav className="bg-gradient-to-r from-cream via-white to-cream text-brand-brown shadow-lg border-b border-cream-border/50 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
			<div className="container mx-auto flex items-center px-4 sm:px-6 h-16">
				{/* Left side - Hamburger Menu */}
				<div className="flex items-center">
					<button
						type="button"
						onClick={toggleSidebar}
						className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-cream-border bg-cream-sand/60 text-brand-brown text-lg hover:bg-cream-sand/80 active:bg-cream-sand transition-colors"
						aria-label="Toggle Explore Menu"
						title="Menu"
					>
						☰
					</button>
				</div>

				{/* Center - Logo and Brand - Prominent display */}
				<div className="flex-1 flex items-center justify-center">
					<Link to="/" className="flex items-center gap-2">
						<img
							src={logoPng}
							alt="CollEco Logo"
							className="h-11 w-11 sm:h-12 sm:w-12 object-contain shrink-0 bg-transparent rounded-lg p-1"
							width="48"
							height="48"
						/>
						<span className="flex flex-col justify-center items-center leading-tight">
							<span className="text-lg sm:text-xl font-bold tracking-tight text-brand-orange leading-tight text-center">CollEco Travel</span>
							<span className="text-[11px] sm:text-[12px] font-light italic text-brand-brown tracking-wide leading-tight text-center" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
								The Odyssey of Adventure
							</span>
						</span>
					</Link>
				</div>

				{/* Right side - Search */}
				<div className="flex items-center justify-end">
					{/* Desktop search bar */}
					<div className="hidden sm:block w-64">
						<SearchBar />
					</div>
					
					{/* Mobile search button */}
					<button
						type="button"
						onClick={() => setShowMobileSearch(!showMobileSearch)}
						className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-cream-border bg-cream-sand/60 text-brand-brown text-lg hover:bg-cream-sand/80 active:bg-cream-sand transition-colors"
						aria-label={showMobileSearch ? "Close search" : "Open search"}
						title="Search"
					>
						🔍
					</button>
				</div>
			</div>
			
			{/* Mobile search overlay */}
			{showMobileSearch && (
				<div ref={mobileSearchRef} className="sm:hidden absolute top-full left-0 right-0 bg-cream border-b border-cream-border shadow-md z-40">
					<div className="container mx-auto px-4 py-3">
						<SearchBar />
					</div>
				</div>
			)}
		</nav>
	);
}