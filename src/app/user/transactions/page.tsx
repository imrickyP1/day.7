"use client";
import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  car_name: string;
  car_brand: string;
  car_model: string;
  amount: number;
  status: string;
  payment_method: string;
  notes: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "badge badge-yellow",
  approved:  "badge badge-blue",
  completed: "badge badge-green",
  rejected:  "badge badge-red",
};

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵", credit_card: "💳", bank_transfer: "🏦", financing: "📋",
};

const FILTERS = ["", "pending", "approved", "completed", "rejected"];
const FILTER_LABELS: Record<string, string> = { "": "All Orders", pending: "Pending", approved: "Approved", completed: "Completed", rejected: "Rejected" };

export default function UserTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchTransactions = (status?: string) => {
    setLoading(true);
    const url = status ? `/api/transactions?status=${status}` : "/api/transactions";
    fetch(url)
      .then(r => r.json())
      .then(data => { setTransactions(data.transactions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleFilter = (status: string) => {
    setFilter(status);
    fetchTransactions(status || undefined);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track the status of all your car purchase orders</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(s => (
          <button
            key={s || "all"}
            onClick={() => handleFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === s
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600"
            }`}
          >
            {FILTER_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : transactions.length === 0 ? (
        <div className="panel-card p-16 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-slate-600 font-semibold mb-1">No orders yet</p>
          <p className="text-slate-400 text-sm mb-5">Browse our collection and place your first order</p>
          <a href="/user/cars" className="btn-primary">Browse Cars</a>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((t, i) => (
            <div
              key={t.id}
              className={`panel-card p-5 flex items-center justify-between gap-4 flex-wrap animate-fade-in stagger-${Math.min(i + 1, 5)}`}
            >
              <div className="flex items-center gap-4">
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0
                }}>
                  🚗
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{t.car_name}</h3>
                  <p className="text-xs text-slate-500">{t.car_brand} · {t.car_model}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Order #{String(t.id).padStart(4,"0")} · {new Date(t.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    {" · "}{PAYMENT_ICONS[t.payment_method] || "💰"} {t.payment_method?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">₱{Number(t.amount).toLocaleString()}</p>
                <span className={`${STATUS_STYLES[t.status] || "badge badge-gray"} mt-1`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
