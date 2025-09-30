import Navbar from "./components/Navbar.jsx";
import { Outlet } from "react-router-dom";

export default function RootLayout(){
	return (
		<div className="min-h-screen bg-cream">
			{/* Top system banner height is set inline when present via style="--banner-h:..." */}
			<Navbar />
			<div className="pb-24" style={{ paddingTop: "calc(var(--header-h) + var(--banner-h))" }}>
				<div className="flex">
					{/* Sidebar would go here if present */}
					<main id="main-content" className="flex-1 min-w-0 focus:outline-none focus:ring-0" tabIndex="-1">
						<section className="px-6 py-6">
							<Outlet />
						</section>
					</main>
				</div>
			</div>
			<footer className="fixed bottom-0 left-0 right-0 bg-brand-brown text-white text-center py-4 text-sm border-t border-cream-border font-semibold tracking-wide flex flex-col items-center gap-1 z-40">
				<span>© {new Date().getFullYear()} CollEco Travel</span>
			</footer>
		</div>
	);
}

