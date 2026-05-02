"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  totalCars: number;
  totalTypes: number;
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingTransactions: number;
}

interface Transaction {
  id: number;
  user_name: string;
  car_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface CarsByType {
  type_name: string;
  total: number;
}

interface LowStockCar {
  id: number;
  name: string;
  brand: string;
  stock: number;
  status: string;
  type_name: string;
}

const STATUS_STYLES: Record<string, string> = {
  available: "badge badge-green",
  sold:      "badge badge-red",
  reserved:  "badge badge-yellow",
  pending:   "badge badge-yellow",
  approved:  "badge badge-blue",
  completed: "badge badge-green",
  rejected:  "badge badge-red",
};

const BAR_COLORS = [
  "linear-gradient(90deg,#3b82f6,#06b6d4)",
  "linear-gradient(90deg,#8b5cf6,#6366f1)",
  "linear-gradient(90deg,#f59e0b,#f97316)",
  "linear-gradient(90deg,#10b981,#059669)",
  "linear-gradient(90deg,#ec4899,#f43f5e)",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [carsByType, setCarsByType] = useState<CarsByType[]>([]);
  const [lowStockCars, setLowStockCars] = useState<LowStockCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecent(data.recentTransactions || []);
        setCarsByType(data.carsByType || []);
        setLowStockCars(data.lowStockCars || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `₱${(stats?.totalRevenue || 0).toLocaleString()}`,
      sub: "All-time sales",
      color: "#3b82f6",
      bg: "linear-gradient(135deg,#eff6ff,#dbeafe)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      label: "Total Cars",
      value: stats?.totalCars ?? 0,
      sub: "In inventory",
      color: "#8b5cf6",
      bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      sub: "Registered customers",
      color: "#10b981",
      bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      label: "Pending Orders",
      value: stats?.pendingTransactions ?? 0,
      sub: "Awaiting approval",
      color: "#f59e0b",
      bg: "linear-gradient(135deg,#fffbeb,#fef3c7)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ];

  const maxType = Math.max(...carsByType.map(t => Number(t.total)), 1);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with AutoShop today.</p>
        </div>
        <Link href="/admin/cars" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Car
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, i) => (
          <div key={stat.label} className={`stat-card animate-fade-in stagger-${i + 1}`}>
            <div className="stat-card-icon" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid xl:grid-cols-[1.2fr,0.8fr] gap-6 mb-8">
        {/* Bar chart */}
        <div className="panel-card p-6 animate-fade-in stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-700 text-slate-800 font-bold">Inventory by Type</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribution of cars across categories</p>
            </div>
            <Link href="/admin/types" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Manage →
            </Link>
          </div>
          <div className="space-y-5">
            {carsByType.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No inventory data yet.</p>
            ) : (
              carsByType.map((item, idx) => {
                const pct = Math.max((Number(item.total) / maxType) * 100, 6);
                return (
                  <div key={item.type_name}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-700">{item.type_name}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{item.total} units</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: BAR_COLORS[idx % BAR_COLORS.length], transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mini revenue bar chart */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Revenue Overview</p>
            <div className="flex items-end gap-2 h-24">
              {[45, 72, 60, 88, 55, 95, 78, 65, 82, 90, 70, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${h}%`,
                      background: i === 11 ? "linear-gradient(180deg,#3b82f6,#2563eb)" : "linear-gradient(180deg,#e2e8f0,#cbd5e1)",
                      transition: "height 0.6s ease",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
            </div>
          </div>
        </div>

        {/* Low stock */}
        <div className="panel-card p-6 animate-fade-in stagger-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Low Stock Alerts</h2>
              <p className="text-xs text-slate-400 mt-0.5">Vehicles needing restocking</p>
            </div>
            <Link href="/admin/cars" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Inventory →
            </Link>
          </div>

          {lowStockCars.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-sm font-semibold text-slate-600">All stock levels healthy</p>
              <p className="text-xs text-slate-400 mt-1">No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockCars.map((car) => (
                <div key={car.id} className="flex items-start justify-between p-3 rounded-14 bg-amber-50 border border-amber-100 gap-3" style={{ borderRadius: 14 }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{car.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{car.brand} · {car.type_name}</p>
                    <p className="text-xs text-amber-700 font-semibold mt-1.5">⚠ Only {car.stock} unit{car.stock !== 1 ? "s" : ""} left</p>
                  </div>
                  <span className={STATUS_STYLES[car.status] || "badge badge-gray"}>{car.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick stats */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-14 p-3" style={{ borderRadius: 14 }}>
              <p className="text-xl font-bold text-blue-700">{stats?.totalTransactions ?? 0}</p>
              <p className="text-xs text-blue-500 font-medium mt-0.5">Total Orders</p>
            </div>
            <div className="bg-purple-50 rounded-14 p-3" style={{ borderRadius: 14 }}>
              <p className="text-xl font-bold text-purple-700">{stats?.totalTypes ?? 0}</p>
              <p className="text-xs text-purple-500 font-medium mt-0.5">Car Types</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="panel-card p-6 animate-fade-in stagger-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Transactions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest customer purchases and admin approvals</p>
          </div>
          <Link href="/admin/transactions" className="btn-secondary text-xs py-2 px-4">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p className="text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold text-slate-800">{t.user_name}</td>
                    <td>{t.car_name}</td>
                    <td className="font-bold text-slate-900">₱{Number(t.amount).toLocaleString()}</td>
                    <td><span className={STATUS_STYLES[t.status] || "badge badge-gray"}>{t.status}</span></td>
                    <td className="text-slate-400">{new Date(t.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
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
