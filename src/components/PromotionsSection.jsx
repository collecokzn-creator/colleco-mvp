import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function PromotionsSection() {
  const [likedPromos, setLikedPromos] = useState({});

  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedPromos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const promos = [
    {
      id: "spring-safari",
      title: "Spring Safari Flash Sale",
      discount: 20,
      cta: { to: "/plan-trip?category=Safari&dest=Kruger", label: "Explore Safaris" },
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop"
    },
    {
      id: "city-long-weekend",
      title: "City Long‑Weekend Deals",
      discount: 15,
      cta: { to: "/plan-trip?category=Hotels&dest=Cape%20Town", label: "View City Deals" },
      image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&h=400&fit=crop"
    },
    {
      id: "island-escape",
      title: "Island Escape Specials",
      discount: 18,
      cta: { to: "/plan-trip?category=Resort&dest=Zanzibar", label: "Plan Island Trip" },
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop"
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold">Current promotions</h2>
        <Link to="/plan-trip" className="text-brand-orange text-sm hover:underline">See all</Link>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {promos.map((p) => (
          <Link 
            key={p.id} 
            to={p.cta.to}
            className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
          >
            {/* Image */}
            <div className="aspect-[4/3] relative overflow-hidden">
              <img 
                src={p.image} 
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {/* Discount Badge */}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-md bg-brand-orange text-white text-sm font-bold shadow-lg">
                -{p.discount}%
              </div>

              {/* Heart Icon */}
              <button
                onClick={(e) => toggleLike(p.id, e)}
                className="absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10"
                aria-label={likedPromos[p.id] ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`w-6 h-6 transition-all duration-300 ${
                    likedPromos[p.id] 
                      ? 'fill-brand-orange stroke-brand-orange' 
                      : 'fill-white stroke-brand-orange'
                  }`}
                  strokeWidth={2}
                />
              </button>

              {/* Minimal Strategic Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-xl text-white">{p.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
