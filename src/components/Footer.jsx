import React from "react";

const Footer = () => (
  <footer className="w-full mt-12 py-6 px-4 bg-cream shadow-md flex flex-col items-center text-center border-t border-brand-gold rounded-2xl">
    <div className="font-semibold text-lg text-brand-orange">© 2025 CollEco Travel — The Odyssey of Adventure.</div>
    <a href="https://www.travelcolleco.com" className="text-brand-orange hover:text-brand-highlight transition font-medium mt-2" target="_blank" rel="noopener noreferrer">
      www.travelcolleco.com
    </a>
    <div className="mt-2 text-sm text-brand-russty">Email: <a href="mailto:collecotravel@gmail.com" className="underline hover:text-brand-orange">collecotravel@gmail.com</a> • WhatsApp: 0733994708</div>
  </footer>
);

export default Footer;
