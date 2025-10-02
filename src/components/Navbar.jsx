import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logoPng from "../assets/colleco-logo.png";
import SearchBar from "./SearchBar.jsx";

export default function Navbar() {
	const location = useLocation();
	const [showMobileSearch, setShowMobileSearch] = useState(false);

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

	return (
		<nav className="bg-cream text-brand-brown shadow-md border-b border-cream-border fixed top-0 left-0 right-0 z-50">
			<div className="container mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
				{/* Left side - Hamburger + Logo/Branding */}
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={toggleSidebar}
						className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-cream-border bg-cream-sand/60 text-brand-brown text-lg hover:bg-cream-sand/80 active:bg-cream-sand transition-colors"
						aria-label="Toggle Explore Menu"
						title="Menu"
					>
						☰
					</button>
					<Link to="/" className="flex items-center gap-1">
						<img
							src={logoPng}
							alt="CollEco Logo"
							className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
							width="44"
							height="44"
						/>
						<span className="hidden sm:flex flex-col justify-center leading-tight">
							<span className="text-lg font-bold tracking-tight text-brand-orange leading-tight">CollEco Travel</span>
							<span className="text-[11px] font-light italic text-brand-brown tracking-wide leading-tight" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
								The Odyssey of Adventure
							</span>
						</span>
					</Link>
				</div>

				{/* Right side - Search */}
				<div className="flex items-center gap-3 flex-1 justify-end">
					{/* Desktop search bar */}
					<div className="hidden sm:block flex-1 max-w-md">
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
						{showMobileSearch ? '×' : '🔍'}
					</button>
				</div>
			</div>
			
			{/* Mobile search overlay */}
			{showMobileSearch && (
				<div className="sm:hidden absolute top-full left-0 right-0 bg-cream border-b border-cream-border shadow-md z-40">
					<div className="container mx-auto px-4 py-3">
						<SearchBar />
					</div>
				</div>
			)}
		</nav>
	);
}