"use client";

import { useEffect, useState, useRef } from "react";

interface CarType { id: number; name: string; }
interface Car {
  id: number; name: string; brand: string; model: string; year: number;
  price: number; description: string; car_type_id: number; is_sports_car: number;
  image_url: string | null; stock: number; status: string; type_name: string;
}

const EMPTY_FORM = {
  name: "", brand: "", model: "", year: new Date().getFullYear(),
  price: "", description: "", car_type_id: "", is_sports_car: false,
  image_url: "", stock: 1, status: "available",
};

const STATUS_STYLES: Record<string, string> = {
  available: "badge badge-green",
  sold:      "badge badge-red",
  reserved:  "badge badge-yellow",
};

export default function AdminCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [types, setTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    setLoading(true);
    fetch("/api/cars")
      .then(r => r.json())
      .then(data => { setCars(data.cars || []); setTypes(data.types || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setPreviewUrl(null); setShowModal(true); };
  const openEdit = (car: Car) => {
    setEditing(car);
    setForm({
      name: car.name, brand: car.brand, model: car.model, year: car.year,
      price: String(car.price), description: car.description || "",
      car_type_id: String(car.car_type_id || ""), is_sports_car: car.is_sports_car === 1,
      image_url: car.image_url || "", stock: car.stock, status: car.status,
    });
    setPreviewUrl(car.image_url || null);
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageFile = async (file: File) => {
    if (!file) return;
    setUploadingImg(true);
    const local = URL.createObjectURL(file);
    setPreviewUrl(local);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, image_url: data.url }));
        showToast("Image uploaded successfully");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form, price: parseFloat(String(form.price)),
      year: Number(form.year), stock: Number(form.stock),
      car_type_id: form.car_type_id ? Number(form.car_type_id) : null,
    };
    try {
      const res = await fetch(editing ? `/api/cars/${editing.id}` : "/api/cars", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(editing ? "Car updated!" : "Car added!");
        setShowModal(false);
        load();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed", "error");
      }
    } catch { showToast("Something went wrong", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this car? This action cannot be undone.")) return;
    const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Car deleted"); load(); }
    else showToast("Delete failed", "error");
  };

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.brand?.toLowerCase().includes(q) || c.model?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Car Inventory</h1>
          <p className="page-subtitle">{cars.length} vehicles in your dealership</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Car
        </button>
      </div>

      {/* Filters */}
      <div className="panel-card p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="form-input pl-9"
            placeholder="Search by name, brand, model…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="panel-card p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <p className="text-slate-600 font-semibold mb-1">No cars found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search or add a new car</p>
        </div>
      ) : (
        <div className="panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((car) => (
                  <tr key={car.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-12 overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center" style={{ borderRadius: 12 }}>
                          {car.image_url ? (
                            <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
                              <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{car.name}</p>
                          <p className="text-xs text-slate-400">{car.brand} · {car.model} · {car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{car.type_name || "—"}</span>
                      {car.is_sports_car === 1 && <span className="badge badge-purple ml-1">Sports</span>}
                    </td>
                    <td className="font-bold text-slate-900">₱{Number(car.price).toLocaleString()}</td>
                    <td>
                      <span className={`font-semibold text-sm ${car.stock <= 1 ? "text-red-600" : "text-slate-700"}`}>
                        {car.stock} unit{car.stock !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td><span className={STATUS_STYLES[car.status] || "badge badge-gray"}>{car.status}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(car)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? "Edit Car" : "Add New Car"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="form-label">Car Photo</label>
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="upload-preview" />
                    <button
                      type="button"
                      onClick={() => { setPreviewUrl(null); setForm(f => ({ ...f, image_url: "" })); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                    {uploadingImg && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-14" style={{ borderRadius: 14 }}>
                        <div className="spinner" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                    />
                    <div className="pointer-events-none">
                      <svg className="mx-auto mb-3 text-slate-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <p className="text-sm font-semibold text-slate-600">Click or drag & drop image</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="form-label">Car Name *</label>
                <input name="name" className="form-input" value={form.name} onChange={handleChange} required placeholder="e.g. Toyota Camry 2024" />
              </div>

              {/* Brand / Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Brand *</label>
                  <input name="brand" className="form-input" value={form.brand} onChange={handleChange} required placeholder="e.g. Toyota" />
                </div>
                <div>
                  <label className="form-label">Model *</label>
                  <input name="model" className="form-input" value={form.model} onChange={handleChange} required placeholder="e.g. Camry" />
                </div>
              </div>

              {/* Year / Price / Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Year</label>
                  <input name="year" type="number" className="form-input" value={form.year} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Price (₱) *</label>
                  <input name="price" type="number" step="0.01" className="form-input" value={form.price} onChange={handleChange} required placeholder="0.00" />
                </div>
                <div>
                  <label className="form-label">Stock</label>
                  <input name="stock" type="number" className="form-input" value={form.stock} onChange={handleChange} min={0} />
                </div>
              </div>

              {/* Type / Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Car Type</label>
                  <select name="car_type_id" className="form-input" value={form.car_type_id} onChange={handleChange}>
                    <option value="">Select type</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the vehicle's features..." />
              </div>

              {/* Sports car */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="is_sports_car" id="is_sports_car" checked={form.is_sports_car} onChange={handleChange} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">This is a Sports Car</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploadingImg} className="btn-primary flex-1 justify-center">
                  {saving ? "Saving…" : editing ? "Update Car" : "Add Car"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
