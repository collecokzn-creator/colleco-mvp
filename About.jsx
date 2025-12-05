import React from "react";

export default function About() {
	return (
		<main className="min-h-screen bg-cream flex flex-col items-center justify-center overflow-x-hidden px-4">
			<section className="w-full max-w-xl bg-white rounded-xl shadow-md border border-cream-border p-6 my-8">
				<h1 className="text-3xl sm:text-4xl font-bold text-brand-brown mb-4 text-center">About Us</h1>
				<p className="text-brand-brown/80 text-base sm:text-lg leading-relaxed mb-4 text-center">
					CollEco Travel is a collaborative travel platform designed to connect travelers, partners, and influencers for seamless trip planning and event discovery. Our mission is to make travel more social, accessible, and rewarding for everyone.
				</p>
				<ul className="list-disc list-inside text-brand-brown/70 text-left space-y-2">
					<li>Discover curated events and experiences</li>
					<li>Collaborate with friends and partners</li>
					<li>Book travel and accommodations easily</li>
					<li>Access exclusive influencer content</li>
				</ul>
			</section>
			<footer className="text-xs text-brand-brown/60 mt-4 mb-2 text-center w-full">
				&copy; {new Date().getFullYear()} CollEco Travel. All rights reserved.
			</footer>
		</main>
	);
}
