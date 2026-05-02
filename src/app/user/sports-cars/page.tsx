"use client";
import { useEffect, useState } from "react";

interface Car {
  id: number; name: string; brand: string; model: string; year: number;
  price: number; description: string; image_url: string | null;
  stock: number; status: string; type_name: string; is_sports_car: number;
}

export default function SportsCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [purchasing, setPurchasing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/cars?sports=1")
      .then(r => r.json())
      .then(d => { setCars(d.cars || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
      {successMsg && <div className="toast toast-success">{successMsg}</div>}

      {/* Hero banner */}
      <div style={{
        borderRadius: 24, background: "linear-gradient(135deg,#0a0f1e 0%,#1e0b4a 50%,#0f2057 100%)",
        padding: "40px 40px", marginBottom: 32, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-60px", right: "-40px", width: 220, height: 220, borderRadius: "50%", background: "rgba(139,92,246,0.2)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "40%", width: 180, height: 180, borderRadius: "50%", background: "rgba(239,68,68,0.15)", filter: "blur(40px)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-3">
            <span style={{ fontSize: 32 }}>🏎️</span>
            <span className="badge badge-purple" style={{ fontSize: 12 }}>Sports Collection</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8 }}>
            High-Performance<br />
            <span style={{ background: "linear-gradient(90deg,#a78bfa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Sports Cars</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 400 }}>
            Experience the thrill of peak performance. Handpicked sports cars with unmatched power and style.
          </p>
        </div>
      </div>

      {/* Cars grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : cars.length === 0 ? (
        <div className="panel-card p-16 text-center">
          <p className="text-5xl mb-4">🏎️</p>
          <p className="text-slate-600 font-semibold">No sports cars available</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon for new arrivals</p>
        </div>
      ) : (
        <>
          <p className="page-subtitle mb-5">{cars.length} sports car{cars.length !== 1 ? "s" : ""} available</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cars.map((car, i) => (
              <div key={car.id} className={`car-card animate-fade-in stagger-${Math.min(i + 1, 5)}`}>
                <div className="car-image-container">
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.name} />
                  ) : (
                    <div className="car-image-placeholder" style={{ background: "linear-gradient(135deg,#1e0b4a,#2d1060)" }}>
                      <span style={{ fontSize: 60 }}>🏎️</span>
                      <span style={{ fontSize: 12, color: "#a78bfa" }}>Sports Car</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", top: 12, left: 12 }}>
                    <span className="badge badge-purple">⚡ Sports</span>
                  </div>
                  {car.status !== "available" && (
                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      <span className="badge badge-red">{car.status}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "18px 20px 20px" }}>
                  <span className="badge badge-blue mb-2">{car.type_name || "Sports"}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 8, marginBottom: 2 }}>{car.name}</h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{car.brand} · {car.model} · {car.year}</p>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }} className="line-clamp-2">{car.description}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed" }}>₱{Number(car.price).toLocaleString()}</span>
                    {car.status === "available" && car.stock > 0 ? (
                      <button
                        onClick={() => { setSelectedCar(car); setShowPurchase(true); }}
                        className="btn-primary text-sm py-2"
                        style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}
                      >
                        ⚡ Buy Now
                      </button>
                    ) : (
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>Unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Purchase modal */}
      {showPurchase && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowPurchase(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚡ Confirm Purchase</h2>
              <button className="modal-close" onClick={() => setShowPurchase(false)}>×</button>
            </div>
            <div style={{ padding: "0 28px 28px" }}>
              <div style={{ background: "linear-gradient(135deg,#1e0b4a,#2d1060)", borderRadius: 16, padding: 16, marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selectedCar.image_url
                    ? <img src={selectedCar.image_url} alt={selectedCar.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 36 }}>🏎️</span>
                  }
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>{selectedCar.name}</h3>
                  <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{selectedCar.brand} · {selectedCar.model} · {selectedCar.year}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#a78bfa", marginTop: 4 }}>₱{Number(selectedCar.price).toLocaleString()}</p>
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
                <button onClick={handlePurchase} disabled={purchasing} className="btn-primary flex-1 justify-center" style={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
                  {purchasing ? "Processing…" : "⚡ Confirm Order"}
                </button>
                <button onClick={() => setShowPurchase(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
