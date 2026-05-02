"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { iconMap } from "@/components/Sidebar";

const userLinks = [
  { href: "/user/dashboard",   icon: iconMap.dash,    label: "Dashboard" },
  { href: "/user/cars",        icon: iconMap.car,     label: "Browse Cars" },
  { href: "/user/sports-cars", icon: iconMap.sport,   label: "Sports Cars" },
  { href: "/user/transactions",icon: iconMap.receipt, label: "My Orders" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "user") { router.push("/login"); return; }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4fa" }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading AutoShop...</p>
        </div>
      </div>
    );
  }

  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="min-h-screen" style={{ background: "#f0f4fa" }}>
      <Sidebar links={userLinks} title="Customer Menu" role="Customer" />
      <div className="main-content">
        {/* Top bar */}
        <div className="topbar animate-fade-in">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Customer Portal</p>
            <p className="text-xs text-slate-400">Browse vehicles and track your AutoShop orders</p>
          </div>
          <div className="topbar-user">
            <div className="topbar-avatar" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>{initials}</div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
