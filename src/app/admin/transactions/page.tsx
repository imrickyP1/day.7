"use client";
import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  user_name: string;
  user_email: string;
  car_name: string;
  car_brand: string;
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

const FILTERS = ["", "pending", "approved", "completed", "rejected"];
const FILTER_LABELS: Record<string, string> = { "": "All", pending: "Pending", approved: "Approved", completed: "Completed", rejected: "Rejected" };

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵", credit_card: "💳", bank_transfer: "🏦", financing: "📋",
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTransactions = (status?: string) => {
    setLoading(true);
    const url = status ? `/api/transactions?status=${status}` : "/api/transactions";
    fetch(url)
      .then(r => r.json())
      .then(data => { setTransactions(data.transactions || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Transaction ${status} successfully`);
      fetchTransactions(filter || undefined);
    } else {
      showToast("Failed to update status", "error");
    }
  };

  const handleFilter = (status: string) => {
    setFilter(status);
    fetchTransactions(status || undefined);
  };

  // Summary counts
  const counts = FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = transactions.filter(t => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="animate-fade-in">
      {toast && <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Review and manage all customer purchase orders</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending", count: counts.pending || 0,   color: "#f59e0b", bg: "#fffbeb" },
          { label: "Approved", count: counts.approved || 0, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Completed",count: counts.completed || 0,color: "#10b981", bg: "#ecfdf5" },
          { label: "Rejected", count: counts.rejected || 0, color: "#ef4444", bg: "#fef2f2" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: 20 }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(s => (
          <button
            key={s || "all"}
            onClick={() => handleFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === s
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
            }`}
          >
            {FILTER_LABELS[s]}
            {s && counts[s] > 0 && (
              <span className="ml-1.5 text-xs opacity-75">({counts[s]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : transactions.length === 0 ? (
        <div className="panel-card p-16 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-slate-600 font-semibold">No transactions found</p>
          <p className="text-slate-400 text-sm mt-1">
            {filter ? `No ${filter} transactions` : "Transactions will appear here once customers place orders"}
          </p>
        </div>
      ) : (
        <div className="panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                        #{String(t.id).padStart(4, "0")}
                      </span>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800 text-sm">{t.user_name}</p>
                      <p className="text-xs text-slate-400">{t.user_email}</p>
                    </td>
                    <td>
                      <p className="font-medium text-slate-700 text-sm">{t.car_name}</p>
                      <p className="text-xs text-slate-400">{t.car_brand}</p>
                    </td>
                    <td className="font-bold text-slate-900">₱{Number(t.amount).toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: 13, color: "#475569" }}>
                        {PAYMENT_ICONS[t.payment_method] || "💰"} {t.payment_method?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td><span className={STATUS_STYLES[t.status] || "badge badge-gray"}>{t.status}</span></td>
                    <td className="text-slate-400 text-sm">
                      {new Date(t.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td>
                      {t.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(t.id, "approved")}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(t.id, "rejected")}
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {t.status === "approved" && (
                        <button
                          onClick={() => updateStatus(t.id, "completed")}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "#059669"; (e.target as HTMLButtonElement).style.color = "#fff"; }}
                          onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "#ecfdf5"; (e.target as HTMLButtonElement).style.color = "#059669"; }}
                        >
                          ✓ Complete
                        </button>
                      )}
                      {(t.status === "completed" || t.status === "rejected") && (
                        <span className="text-xs text-slate-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
