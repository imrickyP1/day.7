"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  is_sports_car: number;
  type_name: string;
  image_url: string;
}

export default function HomePage() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cars?limit=6")
      .then((r) => r.json())
      .then((data) => {
        setFeaturedCars(data.cars || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Auto<span className="text-blue-600">Shop</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors rounded-lg hover:bg-gray-100">
              Login
            </Link>
            <Link href="/register" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/25 hover:shadow-md hover:shadow-blue-600/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 25% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 50%, #6366f1 0%, transparent 50%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm text-blue-300 mb-6 border border-white/10">
              <span>✨</span> Premium Car Dealership
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6 text-white tracking-tight">
              Find Your Dream<br/><span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Car Today</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl">
              Browse our premium collection of sedans, SUVs, sports cars, and more.
              Experience the thrill of driving with AutoShop&apos;s curated selection.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
                Browse Cars →
              </Link>
              <Link href="/login" className="px-8 py-3.5 bg-white/10 backdrop-blur text-white rounded-xl font-semibold text-base hover:bg-white/20 transition-all border border-white/20">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 -mt-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: "🚙", label: "Cars Available", value: "500+", color: "from-blue-500 to-blue-600" },
            { icon: "🏆", label: "Happy Customers", value: "2,000+", color: "from-amber-500 to-orange-500" },
            { icon: "⭐", label: "5-Star Reviews", value: "1,500+", color: "from-emerald-500 to-teal-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Our Collection</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Featured Cars</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">Explore our top picks handcrafted for speed, comfort, and style</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p>Loading cars...</p>
          </div>
        ) : featuredCars.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">🚗</div>
            <p className="text-gray-400 text-lg">No cars available yet. Check back soon!</p>
            <p className="text-gray-300 text-sm mt-1">Set up the database to see sample cars</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredCars.map((car, i) => (
              <div key={car.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="w-full h-52 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center text-7xl">
                  {car.is_sports_car ? "🏎️" : "🚗"}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{car.type_name || "Car"}</span>
                    {car.is_sports_car === 1 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Sports</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 mb-3">{car.brand} · {car.model} · {car.year}</p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{car.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-blue-600">${car.price?.toLocaleString()}</span>
                    <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                      View Details <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-20">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 50%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Car?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-md mx-auto">Join AutoShop today and get access to exclusive deals and premium vehicles</p>
          <Link href="/register" className="inline-block bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-semibold text-slate-300">AutoShop</span>
          </div>
          <p className="text-sm">© 2026 AutoShop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
