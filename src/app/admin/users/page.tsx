"use client";
import { useEffect, useState } from "react";

interface User {
  id: number; name: string; email: string; role: string;
  phone: string | null; address: string | null; created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const initials = (name: string) => name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const avatarColors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered customer{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="panel-card p-4 mb-6">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="form-input pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="panel-card p-16 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-600 font-semibold">No users found</p>
        </div>
      ) : (
        <div className="panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: avatarColors[i % avatarColors.length],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                          {initials(user.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={user.role === "admin" ? "badge badge-purple" : "badge badge-blue"}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm">{user.phone || <span className="text-slate-300">—</span>}</td>
                    <td className="text-slate-500 text-sm max-w-xs truncate">{user.address || <span className="text-slate-300">—</span>}</td>
                    <td className="text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
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
