import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { B as Button } from "./Button-BvBK5int.js";
import { ad as Heart } from "./icons-C4AMPM7L.js";
import { L as Link, H as logo } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function useInViewOnce(options = { threshold: 0.2, root: null, rootMargin: "0px" }) {
  const ref = reactExports.useRef(null);
  const [inView, setInView] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!ref.current || inView || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      });
    }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options, inView]);
  return [ref, inView];
}
function PromotionsSection() {
  const [likedPromos, setLikedPromos] = reactExports.useState({});
  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedPromos((prev) => ({
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
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-6xl mx-auto px-6 py-10 sm:py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-bold", children: "Current promotions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/plan-trip", className: "text-brand-orange text-sm hover:underline", children: "See all" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: promos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: p.cta.to,
        className: "group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[4/3] relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: p.image,
              alt: p.title,
              className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 px-3 py-1.5 rounded-md bg-brand-orange text-white text-sm font-bold shadow-lg", children: [
            "-",
            p.discount,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => toggleLike(p.id, e),
              className: "absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10",
              "aria-label": likedPromos[p.id] ? "Remove from favorites" : "Add to favorites",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Heart,
                {
                  className: `w-6 h-6 transition-all duration-300 ${likedPromos[p.id] ? "fill-brand-orange stroke-brand-orange" : "fill-white stroke-brand-orange"}`,
                  strokeWidth: 2
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-xl text-white", children: p.title }) })
        ] })
      },
      p.id
    )) })
  ] });
}
function FeaturedPackagesSection() {
  const [likedPackages, setLikedPackages] = reactExports.useState({});
  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedPackages((prev) => ({
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
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-6xl mx-auto px-6 py-10 sm:py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-brand-orange", children: "Featured packages" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: packages.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: pkg.to,
        className: "group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-[4/3] relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: pkg.image,
              alt: pkg.title,
              className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => toggleLike(pkg.id, e),
              className: "absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10",
              "aria-label": likedPackages[pkg.id] ? "Remove from favorites" : "Add to favorites",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Heart,
                {
                  className: `w-6 h-6 transition-all duration-300 ${likedPackages[pkg.id] ? "fill-brand-orange stroke-brand-orange" : "fill-white stroke-brand-orange"}`,
                  strokeWidth: 2
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-xl text-white mb-2", children: pkg.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-white/90 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                pkg.nights,
                " nights"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                "From $",
                pkg.priceFrom
              ] })
            ] })
          ] })
        ] })
      },
      pkg.id
    )) })
  ] });
}
function Home() {
  const [heroRef, heroIn] = useInViewOnce({ threshold: 0.3 });
  const [featRef, featIn] = useInViewOnce({ threshold: 0.2 });
  const [howRef, howIn] = useInViewOnce({ threshold: 0.2 });
  const [ctaRef, ctaIn] = useInViewOnce({ threshold: 0.2 });
  const [hasDraft, setHasDraft] = reactExports.useState(false);
  const [hasBasket, setHasBasket] = reactExports.useState(false);
  const [currentSlide, setCurrentSlide] = reactExports.useState(0);
  const ctaImages = [
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=2400&h=1200&fit=crop&q=90",
    // Zanzibar beach
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2400&h=1200&fit=crop&q=90",
    // Safari elephants
    "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=2400&h=1200&fit=crop&q=90",
    // Cape Town
    "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=2400&h=1200&fit=crop&q=90"
    // Mauritius
  ];
  reactExports.useEffect(() => {
    try {
      const draft = localStorage.getItem("colleco.aiDraft");
      const basket = localStorage.getItem("colleco.basket");
      setHasDraft(!!draft);
      setHasBasket(basket ? JSON.parse(basket).length > 0 : false);
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ctaImages.length);
    }, 5e3);
    return () => clearInterval(interval);
  }, [ctaImages.length]);
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CollEco Travel",
    url: "https://www.collecotravel.com",
    logo: "https://www.collecotravel.com/logo.png"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-full bg-white text-brand-brown", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("script", { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(orgJsonLd) } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        ref: heroRef,
        className: `relative overflow-hidden bg-white px-6 pt-10 pb-14 sm:pt-12 sm:pb-20 rounded-b-xl shadow-sm border-white ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} transition duration-700`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "video",
              {
                autoPlay: true,
                loop: true,
                muted: true,
                playsInline: true,
                className: "absolute inset-0 w-full h-full object-cover opacity-20",
                poster: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=90",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("source", { src: "https://assets.mixkit.co/active_storage/videos/47066/47066-720.mp4", type: "video/mp4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-brand-brown", children: "Curated Adventures" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-semibold uppercase tracking-[0.45em] text-brand-orange/80", children: "Business or Pleasure" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-brand-brown/80 text-base sm:text-lg max-w-prose", children: "Making trip planning effortless for friends, teams, partners, and individuals who love to explore." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-3 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: Link, to: "/book", variant: "primary", size: "md", "data-e2e": "open-booking", "aria-label": "Book now", children: "Book Now" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: Link, to: "/plan-trip", variant: "outline", size: "md", "aria-label": "Plan a trip", children: "Plan a Trip" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: Link, to: "/ai", variant: "outline", size: "md", "aria-label": "Try Trip Assist AI", children: "Try Trip Assist" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-brand-brown/70", children: "No credit card required • Free to get started" }),
              (hasDraft || hasBasket) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3 rounded-lg bg-brand-orange/10 border border-brand-orange/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold text-brand-brown mb-1 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🎯" }),
                  " Continue Planning"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/70 mb-2", children: hasDraft && hasBasket ? "You have a draft and items in your basket." : hasDraft ? "You have an AI-generated draft ready." : "You have items in your basket." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  hasDraft && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: Link, to: "/itinerary", size: "xs", variant: "primary", children: "View Draft" }),
                  hasBasket && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: Link, to: "/plan-trip", size: "xs", variant: "outline", children: "My Basket" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center md:justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-white shadow-lg border border-cream-border flex items-center justify-center overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=90",
                  alt: "Travel destination",
                  className: "w-full h-full object-cover opacity-10"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "CollEco logo", className: "relative z-10 h-32 w-32 sm:h-40 sm:w-40 object-contain" })
            ] }) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "max-w-6xl mx-auto px-6 py-8 bg-white border-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-white bg-cream p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Secure Payments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-brown/80", children: "PCI-aware flows and trusted processors" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-white bg-cream p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Reliable Platform" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-brown/80", children: "Rate-limited APIs and safety guardrails" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-white bg-cream p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Human Support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-brown/80", children: "We're here when you need us" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-6xl mx-auto px-6 py-6 bg-white border-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs uppercase tracking-wider text-brand-brown/60", children: "Trusted by group organizers and partners" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap justify-center gap-3", children: ["SafariCo", "CityTours", "VoyagePlus", "BeachLine", "PeakGuides", "NomadHub"].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded border border-cream-border bg-white/70 text-[11px] text-brand-brown/80", children: n }, n)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        ref: featRef,
        className: `max-w-6xl mx-auto px-6 py-10 sm:py-14 ${featIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} transition duration-700`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-bold", children: "Why CollEco" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: [
            {
              title: "AI Itineraries",
              desc: "Generate curated drafts in seconds; refine with your own style, budget and pace.",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" }) })
            },
            {
              title: "Quotes & Payments",
              desc: "Share quotes, collect deposits or full payments, and track balances securely.",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) })
            },
            {
              title: "Collaboration",
              desc: "Work with partners and travelers—comments, approvals, and shared updates.",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) })
            },
            {
              title: "All-in-one",
              desc: "From discovery to booking—avoid tool sprawl and keep everything in sync.",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) })
            },
            {
              title: "Metrics & Insights",
              desc: "Keep an eye on conversion, spend, and latency—optimize your flow.",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) })
            },
            {
              title: "Safe & Reliable",
              desc: "Session history, rate limits, and guardrails so things stay smooth.",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) })
            }
          ].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-cream-border bg-cream p-5 shadow-sm hover:shadow transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 w-12 h-12 rounded bg-brand-orange flex items-center justify-center text-white shadow-sm", children: f.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-brand-brown mb-2", children: f.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70", children: f.desc })
          ] }, f.title)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PromotionsSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedPackagesSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        ref: howRef,
        className: `bg-cream-sand/50 border-y border-cream-border px-6 py-10 sm:py-14 ${howIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} transition duration-700`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-bold", children: "How it works" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "mt-6 grid sm:grid-cols-3 gap-5 list-decimal list-inside", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-md bg-white/70 border border-cream-border p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Plan" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "Describe your trip, group size, budget, and vibe." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-md bg-white/70 border border-cream-border p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Refine" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "Tailor the itinerary with AI assist and partner input." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-md bg-white/70 border border-cream-border p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Book" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "Share quotes, collect payments, and confirm." })
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-6xl mx-auto px-6 py-10 sm:py-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-center", children: "What organizers say" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5", children: [
        {
          quote: "We planned a 30-person retreat in days, not weeks. Payments and updates were seamless.",
          name: "Nadia M.",
          role: "Retreat Host"
        },
        {
          quote: "AI drafts got us 80% there instantly, then we fine-tuned the rest together.",
          name: "Thabo K.",
          role: "Travel Organizer"
        },
        {
          quote: "Vendors love the collaboration—fewer emails, clearer approvals, faster bookings.",
          name: "Lauren D.",
          role: "Group Leader"
        }
      ].map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("blockquote", { className: "rounded-lg border border-cream-border bg-cream p-5 shadow-sm hover:shadow transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-brand-brown/90", children: [
          "“",
          t.quote,
          "”"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-3 text-sm font-semibold text-brand-brown", children: [
          t.name,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-brand-brown/70", children: [
            "— ",
            t.role
          ] })
        ] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-6xl mx-auto px-6 py-10 sm:py-14 bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-center mb-6", children: "Popular right now" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [
        { emoji: "🏖️", name: "Zanzibar", blurb: "Island escape with spice markets and turquoise waters.", img: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=90" },
        { emoji: "🌆", name: "Cape Town", blurb: "Table Mountain hikes, wine country, and coastline.", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=90" },
        { emoji: "🐘", name: "Kruger", blurb: "Big Five safaris and unforgettable sunsets.", img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=90" },
        { emoji: "🏞️", name: "Drakensberg", blurb: "Peaks, trails, and cozy lodges.", img: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=90" },
        { emoji: "🏝️", name: "Mauritius", blurb: "Resorts, reefs, and rum distilleries.", img: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=90" },
        { emoji: "🏙️", name: "Johannesburg", blurb: "Culture, cuisine, and vibrant neighborhoods.", img: "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=1200&q=90" }
      ].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative rounded-lg overflow-hidden border border-cream-border bg-white shadow-sm hover:shadow-lg transition-shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-video relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: d.img,
              alt: d.name,
              className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-brand-brown mb-1", children: d.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70 mb-3", children: d.blurb }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: `/plan-trip?dest=${encodeURIComponent(d.name)}`,
              className: "inline-block text-sm text-brand-orange hover:text-brand-brown font-semibold transition-colors",
              children: [
                "Plan ",
                d.name,
                " →",
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
              ]
            }
          )
        ] })
      ] }, d.name)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        ref: ctaRef,
        className: `max-w-6xl mx-auto px-6 py-16 sm:py-20 ${ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} transition duration-700`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/plan-trip",
            className: "relative block rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group h-[400px] sm:h-[500px]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0", children: [
                ctaImages.map((img, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: img,
                        alt: `Destination ${index + 1}`,
                        className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      }
                    )
                  },
                  index
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full flex flex-col items-center justify-center text-center px-8 py-12", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-5xl sm:text-6xl font-bold text-white mb-4 drop-shadow-2xl", children: "Ready to explore?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl sm:text-2xl text-white/95 max-w-2xl leading-relaxed drop-shadow-lg", children: "Start planning your perfect adventure" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-8 left-0 right-0 flex justify-center gap-2", children: ctaImages.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-8" : "bg-white/40"}`
                  },
                  index
                )) })
              ] })
            ]
          }
        )
      }
    )
  ] }) });
}
export {
  Home as default
};
//# sourceMappingURL=Home-CsMrKiu0.js.map
