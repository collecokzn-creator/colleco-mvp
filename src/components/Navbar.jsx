import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import logoPng from "../assets/colleco-logo.png";
import SearchBar from "./SearchBar.jsx";

function Navbar() {
	const location = useLocation();
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const mobileSearchRef = useRef(null);
	const { user, setUser } = useUser();
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();

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

	// Close dropdown on outside click (and mobile search)
	useEffect(() => {
		if (!showMobileSearch && !showDropdown) return;
		const handleClickOutside = (event) => {
			// Mobile search close
			if (showMobileSearch && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
				const searchButton = event.target.closest('button[title="Search"]');
				if (searchButton) return;
				setShowMobileSearch(false);
			}
			// Dropdown close
			if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, [showMobileSearch, showDropdown]);

    return (
		<nav className="bg-white text-brand-russty shadow-none border-b-0 fixed top-0 left-0 right-0 z-50">
		<div className="container mx-auto flex items-center px-4 sm:px-6 h-16">
					{/* Left side - Hamburger Menu */}
					<div className="flex items-center">
									<button
										type="button"
										onClick={toggleSidebar}
										className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-brand-gold bg-white text-brand-russty text-lg hover:bg-brand-gold/10 active:bg-brand-gold/20 transition-colors"
							aria-label="Toggle Explore Menu"
							title="Menu"
						>
							☰
						</button>
					</div>

					{/* Center - Logo and Brand - Prominent display */}
					<div className="flex-1 flex items-center justify-center">
																		<Link to="/" className="flex items-center gap-0">
																			<img
																				src={logoPng}
																				alt="CollEco Logo"
																				className="h-12 w-12 object-contain shrink-0"
																				width="48"
																				height="48"
																			/>
																			<span className="flex flex-col justify-center items-center leading-tight ml-0">
																				<span className="text-lg sm:text-xl font-bold tracking-tight text-brand-orange leading-tight text-center">CollEco Travel</span>
																				<span className="text-[11px] sm:text-[12px] font-light italic text-brand-orange tracking-wide leading-tight text-center" style={{ fontFamily: 'cursive, Inter, sans-serif' }}>
																					The Odyssey of Adventure
																				</span>
																			</span>
																		</Link>
					</div>

					{/* Right side - Search + User Info */}
								<div className="flex items-center justify-end gap-4">
						{/* Desktop search bar */}
						<div className="hidden sm:block w-64">
							<SearchBar />
						</div>
						{/* Mobile search button */}
												<button
														type="button"
														onClick={() => setShowMobileSearch(!showMobileSearch)}
															className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-brand-orange bg-white text-brand-russty text-lg hover:bg-brand-orange/10 active:bg-brand-orange/20 transition-colors"
							aria-label={showMobileSearch ? "Close search" : "Open search"}
							title="Search"
						>
							🔍
						</button>
						{/* User info and logout */}
						{user ? (
											<div className="relative" ref={dropdownRef}>
												<button
														className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-brand-orange text-brand-russty font-semibold hover:bg-brand-orange/10"
													onClick={() => setShowDropdown((v) => !v)}
													aria-label="User menu"
												>
													<span className="inline-flex h-8 w-8 rounded-full bg-brand-orange text-white font-bold items-center justify-center text-lg mr-1">
														{user?.name ? user.name[0].toUpperCase() : "U"}
													</span>
													<span className="hidden sm:inline">Welcome, {user?.name ?? "User"}</span>
													<span className="inline sm:hidden">{user?.name ?? "User"}</span>
													<svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="ml-1"><path d="M4 6l4 4 4-4" stroke="#a85a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
												</button>
												{showDropdown && (
													<div className="absolute right-0 mt-2 w-44 bg-white border border-brand-orange rounded shadow-lg z-50">
														<div className="px-4 py-2 text-brand-russty text-sm font-semibold border-b border-brand-orange">{user.email}</div>
																		<button
																			className="w-full text-left px-4 py-2 text-brand-russty hover:bg-brand-orange/10 font-semibold"
																			onClick={() => {
																				setUser(null);
																				setShowDropdown(false);
																				navigate("/login");
																			}}
																		>Logout</button>
													</div>
												)}
											</div>
						) : (
							<Link to="/login" className="px-3 py-2 rounded-lg bg-brand-orange text-white font-semibold hover:bg-brand-orange/90">Login</Link>
						)}
					</div>
      </div>
      {/* Mobile search overlay */}
			{showMobileSearch && (
			<div ref={mobileSearchRef} className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-brand-orange shadow-md z-40">
          <div className="container mx-auto px-4 py-3">
            <SearchBar />
          </div>
        </div>
      )}
    </nav>
  );
}

	export default Navbar;