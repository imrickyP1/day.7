"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      router.push("/user/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-showcase auth-showcase--emerald">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />

        <Link href="/" className="auth-brand" aria-label="Go to home page">
          <div className="auth-brand-icon">🚗</div>
          <span className="auth-brand-text">
            Auto<span className="auth-brand-accent">Shop</span>
          </span>
        </Link>

        <div className="auth-showcase-content">
          <h1 className="auth-showcase-title">
            Join the
            <br />
            <span>AutoShop Family</span>
          </h1>
          <p className="auth-showcase-copy">
            Create your account to unlock exclusive deals, faster checkout, and real-time order tracking.
          </p>

          <div className="auth-feature-list">
            {[
              { icon: "✅", text: "Free account with no hidden fees" },
              { icon: "🔒", text: "Secure and encrypted transactions" },
              { icon: "📦", text: "Track orders from request to delivery" },
            ].map((feature) => (
              <div key={feature.text} className="auth-feature-item">
                <div className="auth-feature-icon">{feature.icon}</div>
                <span className="auth-feature-text">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-showcase-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>

      <div className="auth-pane">
        <div className="auth-form-wrap animate-fade-in">
          <div className="auth-mobile-brand">
            <span style={{ fontSize: 28 }}>🚗</span>
            <span className="auth-mobile-brand-title">
              Auto<span style={{ color: "#3b82f6" }}>Shop</span>
            </span>
          </div>

          <div className="auth-card">
            <h2 className="auth-heading">Create account</h2>
            <p className="auth-subheading">Get started and browse premium vehicles today.</p>

            {error && (
              <div className="auth-alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Juan dela Cruz"
                />
              </div>
              <div>
                <label className="form-label">Email address</label>
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <div className="auth-input-group">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input pr-16"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    className="auth-inline-button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="auth-password-hint">Use at least 8 characters for better security.</p>
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <div className="auth-input-group">
                  <input
                    name="confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-input pr-16"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    className="auth-inline-button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary justify-center"
                style={{ padding: "13px 20px", fontSize: 15, marginTop: 4, background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg style={{ animation: "spin 0.7s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Creating account...
                  </span>
                ) : "Create Free Account"}
              </button>
            </form>

            <p className="auth-bottom-text">
              Already have an account?{" "}
              <Link href="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}