"use client";

import { useEffect, useState } from "react";

interface CarType { id: number; name: string; }
interface Car {
  id: number; name: string; brand: string; model: string; year: number;
  price: number; description: string; car_type_id: number; is_sports_car: number;
  image_url: string | null; stock: number; status: string; type_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  available: "badge badge-green",
  sold:      "badge badge-red",
  reserved:  "badge badge-yellow",
};

export default function UserCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [types, setTypes] = useState<CarType[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [purchasing, setPurchasing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (brandFilter) params.set("brand", brandFilter);
    if (search) params.set("search", search);
    setLoading(true);
    fetch(`/api/cars?${params}`)
      .then(r => r.json())
      .then(d => {
        setCars(d.cars || []);
        setTypes(d.types || []);
        setBrands(d.brands || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, typeFilter, brandFilter]);

  const handlePurchase = async () => {
    if (!selectedCar) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car_id: selectedCar.id, payment_method: paymentMethod, amount: selectedCar.price }),
      });
      if (res.ok) {
        setSuccessMsg(`Order placed for ${selectedCar.name}! Awaiting admin approval.`);
        setShowPurchase(false);
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } finally { setPurchasing(false); }
  };

  return (
    <div className="animate-fade-in">
      {/* Success toast */}
      {successMsg && (
        <div className="toast toast-success">{successMsg}</div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Cars</h1>
          <p className="page-subtitle">Discover your perfect vehicle from our premium collection</p>
        </div>
      </div>

      {/* Filters */}
      <div className="panel-card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="form-input pl-9"
              placeholder="Search cars…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="form-input w-auto" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value="">All Brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Car grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : cars.length === 0 ? (
        <div className="panel-card p-16 text-center">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-slate-600 font-semibold mb-1">No cars found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cars.map((car, i) => (
            <div key={car.id} className={`car-card animate-fade-in stagger-${Math.min(i + 1, 5)}`}>
              {/* Image */}
              <div className="car-image-container">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.name} />
                ) : (
                  <div className="car-image-placeholder">
                    <span style={{ fontSize: 52 }}>{car.is_sports_car === 1 ? "🏎️" : "🚗"}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>No image</span>
                  </div>
                )}
                {car.is_sports_car === 1 && (
                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <span className="badge badge-purple">⚡ Sports</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: "18px 20px 20px" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-blue">{car.type_name || "Car"}</span>
                  <span className={`${STATUS_COLORS[car.status] || "badge badge-gray"} ml-auto`}>{car.status}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{car.name}</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{car.brand} · {car.model} · {car.year}</p>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }} className="line-clamp-2">{car.description}</p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>₱{Number(car.price).toLocaleString()}</span>
                  {car.status === "available" && car.stock > 0 ? (
                    <button
                      onClick={() => { setSelectedCar(car); setShowPurchase(true); }}
                      className="btn-primary text-sm py-2"
                    >
                      Buy Now
                    </button>
                  ) : (
                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Unavailable</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{car.stock} unit{car.stock !== 1 ? "s" : ""} left</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase modal */}
      {showPurchase && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowPurchase(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Purchase</h2>
              <button className="modal-close" onClick={() => setShowPurchase(false)}>×</button>
            </div>
            <div style={{ padding: "0 28px 28px" }}>
              {/* Car preview */}
              <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selectedCar.image_url ? (
                    <img src={selectedCar.image_url} alt={selectedCar.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 32 }}>{selectedCar.is_sports_car === 1 ? "🏎️" : "🚗"}</span>
                  )}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: 16 }}>{selectedCar.name}</h3>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{selectedCar.brand} · {selectedCar.model} · {selectedCar.year}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8", marginTop: 4 }}>₱{Number(selectedCar.price).toLocaleString()}</p>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="form-label">Payment Method</label>
                <select className="form-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="cash">💵 Cash</option>
                  <option value="credit_card">💳 Credit Card</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                  <option value="financing">📋 Financing</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={handlePurchase} disabled={purchasing} className="btn-primary flex-1 justify-center">
                  {purchasing ? "Processing…" : "Confirm Order"}
                </button>
                <button onClick={() => setShowPurchase(false)} className="btn-secondary">Cancel</button>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 12 }}>
                Your order will be reviewed and approved by an admin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
