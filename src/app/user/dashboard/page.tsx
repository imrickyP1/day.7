"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Transaction {
  id: number; car_name: string; amount: number; status: string; created_at: string;
}
interface Car {
  id: number; name: string; brand: string; model: string; year: number;
  price: number; stock: number; status: string; type_name: string; image_url: string | null; is_sports_car: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "badge badge-yellow",
  approved:  "badge badge-blue",
  completed: "badge badge-green",
  rejected:  "badge badge-red",
  available: "badge badge-green",
};

export default function UserDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions").then(r => r.json()),
      fetch("/api/cars?limit=4").then(r => r.json()),
    ]).then(([txData, carData]) => {
      setTransactions(txData.transactions || []);
      setCars((carData.cars || []).filter((c: Car) => c.status === "available").slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  const totalSpent = transactions.filter(t => t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const pending = transactions.filter(t => t.status === "pending").length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Overview of your AutoShop activity</p>
        </div>
        <Link href="/user/cars" className="btn-primary">Browse Cars</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Orders",   value: transactions.length,             color: "#3b82f6", bg: "linear-gradient(135deg,#eff6ff,#dbeafe)", icon: "📋" },
          { label: "Pending Review", value: pending,                          color: "#f59e0b", bg: "linear-gradient(135deg,#fffbeb,#fef3c7)", icon: "⏳" },
          { label: "Total Spent",    value: `₱${totalSpent.toLocaleString()}`,color: "#10b981", bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)", icon: "💰" },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card animate-fade-in stagger-${i + 1}`}>
            <div className="stat-card-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.3fr,0.7fr] gap-6 mb-6">
        {/* Featured cars */}
        <div className="panel-card p-6 animate-fade-in stagger-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Featured Vehicles</h2>
              <p className="text-xs text-slate-400 mt-0.5">Available cars for you to browse</p>
            </div>
            <Link href="/user/cars" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              View all →
            </Link>
          </div>

          {cars.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-3xl mb-2">🚗</p>
              <p className="text-sm">No available cars at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cars.map(car => (
                <div key={car.id} style={{ border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(15,23,42,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ""; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
                >
                  <div style={{ height: 100, background: "linear-gradient(135deg,#f0f4ff,#e0e7ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                    {car.image_url
                      ? <img src={car.image_url} alt={car.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : car.is_sports_car === 1 ? "🏎️" : "🚗"
                    }
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <p className="font-bold text-slate-900 text-sm truncate">{car.name}</p>
                    <p className="text-xs text-slate-400">{car.brand} · {car.year}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-base font-bold text-blue-700">₱{Number(car.price).toLocaleString()}</span>
                      <Link href="/user/cars" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Details →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="panel-card p-6 animate-fade-in stagger-3">
          <h2 className="text-base font-bold text-slate-800 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: "/user/cars",         label: "Browse All Cars",   icon: "🚗", color: "#3b82f6", bg: "#eff6ff" },
              { href: "/user/sports-cars",  label: "Sports Cars",       icon: "🏎️", color: "#8b5cf6", bg: "#f5f3ff" },
              { href: "/user/transactions", label: "My Orders",         icon: "📋", color: "#10b981", bg: "#ecfdf5" },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, border: `1px solid ${a.bg}`, background: a.bg, textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
              >
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: a.color }}>{a.label}</span>
                <span style={{ marginLeft: "auto", color: a.color, fontSize: 16 }}>→</span>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: 16, borderRadius: 16, background: "linear-gradient(135deg,#0a0f1e,#0f2057)", color: "#fff" }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🎉 Ready to buy?</p>
            <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>Browse our full catalog and find your dream car today.</p>
            <Link href="/user/cars" style={{ display: "inline-block", marginTop: 12, padding: "8px 16px", background: "#3b82f6", color: "#fff", borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              Shop Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="panel-card p-6 animate-fade-in stagger-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your latest purchase activity</p>
          </div>
          <Link href="/user/transactions" className="btn-secondary text-xs py-2 px-4">View all</Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-600 font-semibold text-sm">No orders yet</p>
            <p className="text-slate-400 text-xs mt-1 mb-4">Start browsing to place your first order</p>
            <Link href="/user/cars" className="btn-primary text-sm">Browse Cars</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(t => (
                  <tr key={t.id}>
                    <td className="font-semibold text-slate-800">{t.car_name}</td>
                    <td className="font-bold text-slate-900">₱{Number(t.amount).toLocaleString()}</td>
                    <td><span className={STATUS_STYLES[t.status] || "badge badge-gray"}>{t.status}</span></td>
                    <td className="text-slate-400">{new Date(t.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
