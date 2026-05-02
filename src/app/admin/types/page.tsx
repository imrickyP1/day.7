"use client";
import { useEffect, useState } from "react";

interface CarType {
  id: number;
  name: string;
  description: string | null;
  car_count: number;
}

const EMPTY = { name: "", description: "" };

export default function AdminTypesPage() {
  const [types, setTypes] = useState<CarType[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<CarType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/car-types");
      const data = await res.json();
      setTypes(data.types || []);
    } catch { showToast("Unable to load car types", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTypes(); }, []);

  const resetForm = () => { setForm(EMPTY); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(editing ? `/api/car-types/${editing.id}` : "/api/car-types", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Save failed", "error"); return; }
      showToast(editing ? "Car type updated!" : "Car type created!");
      resetForm(); fetchTypes();
    } catch { showToast("Something went wrong", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (type: CarType) => {
    if (!confirm(`Delete "${type.name}"? Cars using this type will lose their category label.`)) return;
    try {
      const res = await fetch(`/api/car-types/${type.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Delete failed", "error"); return; }
      if (editing?.id === type.id) resetForm();
      showToast("Car type deleted"); fetchTypes();
    } catch { showToast("Something went wrong", "error"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      {toast && <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Car Types</h1>
          <p className="page-subtitle">Manage categories like SUV, Sedan, Pickup, Van and more</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
        {/* Form */}
        <div className="panel-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">{editing ? "Edit Type" : "Add New Type"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">These labels appear in the car catalog filters</p>
            </div>
            {editing && (
              <button type="button" onClick={resetForm} className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Type Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="form-input"
                placeholder="e.g. SUV, Sedan, Pickup"
                required
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="form-input"
                rows={3}
                placeholder="Brief description of this vehicle category"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? "Saving…" : editing ? "Update Type" : "Create Type"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="panel-card p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-800">Current Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">{types.length} type{types.length !== 1 ? "s" : ""} configured</p>
          </div>

          {types.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl py-14 text-center text-slate-400">
              <p className="text-4xl mb-3">🏷️</p>
              <p className="font-semibold">No car types yet</p>
              <p className="text-sm mt-1">Create your first category on the left</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {types.map(type => (
                <div key={type.id} className="p-4 rounded-16 border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all" style={{ borderRadius: 16 }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">{type.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{type.description || "No description"}</p>
                    </div>
                    <span className="badge badge-blue flex-shrink-0">{type.car_count} cars</span>
                  </div>
                  <div className="flex gap-3 mt-4 pt-3 border-t border-slate-100">
                    <button onClick={() => { setEditing(type); setForm({ name: type.name, description: type.description || "" }); }} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(type)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
