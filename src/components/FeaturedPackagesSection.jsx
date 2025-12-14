import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function FeaturedPackagesSection() {
  const [likedPackages, setLikedPackages] = useState({});

  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedPackages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const packages = [
    {
      id: "cape-winelands-getaway",
      title: "Cape Town + Winelands",
      nights: 4,
      priceFrom: 899,
      to: "/plan-trip?dest=Cape%20Town&category=Tour",
      image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&h=400&fit=crop"
    },
    {
      id: "kruger-big5-lodge",
      title: "Kruger Big 5 Safari",
      nights: 3,
      priceFrom: 1199,
      to: "/plan-trip?dest=Kruger&category=Safari",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop"
    },
    {
      id: "zanzibar-group-retreat",
      title: "Zanzibar Beach Retreat",
      nights: 5,
      priceFrom: 1290,
      to: "/plan-trip?dest=Zanzibar&category=Resort",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop"
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-orange">Featured packages</h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <Link 
            key={pkg.id} 
            to={pkg.to}
            className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
          >
            {/* Image */}
            <div className="aspect-[4/3] relative overflow-hidden">
              <img 
                src={pkg.image} 
                alt={pkg.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {/* Heart Icon */}
              <button
                onClick={(e) => toggleLike(pkg.id, e)}
                className="absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10"
                aria-label={likedPackages[pkg.id] ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`w-6 h-6 transition-all duration-300 ${
                    likedPackages[pkg.id] 
                      ? 'fill-brand-orange stroke-brand-orange' 
                      : 'fill-white stroke-brand-orange'
                  }`}
                  strokeWidth={2}
                />
              </button>

              {/* Minimal Strategic Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-xl text-white mb-2">{pkg.title}</h3>
                <div className="flex items-center justify-between text-white/90 text-sm">
                  <span>{pkg.nights} nights</span>
                  <span className="font-semibold">From ${pkg.priceFrom}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
