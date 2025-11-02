import React from "react";
import globePng from "./assets/Globeicon.png";

export default function Home() {
  return (
    <section className="relative px-0 py-10">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-orange mb-4 text-left">
          Plan unforgettable group adventures
        </h1>
        <p className="text-brand-russty text-lg max-w-2xl text-left mb-6">
          CollEco Travel makes trip planning effortless—co-create itineraries, generate quotes,
          collect payments, and collaborate with partners, all in one.
        </p>
      </div>
      <img
        src={globePng}
        alt="CollEco Bird Logo"
        className="absolute right-8 top-1/2 -translate-y-1/2 h-40 w-auto opacity-90"
        width={160}
        height={160}
      />
    </section>
  );
}