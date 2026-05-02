"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      router.push(data.user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-showcase">
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
            Find Your
            <br />
            <span>Dream Car</span>
          </h1>
          <p className="auth-showcase-copy">
            Browse premium vehicles, compare options quickly, and track your orders in one clean dashboard.
          </p>

          <div className="auth-feature-list">
            {[
              { icon: "🏎️", text: "Premium sports car inventory" },
              { icon: "₱", text: "Clear Philippine Peso pricing" },
              { icon: "📱", text: "Easy order tracking and updates" },
            ].map((feature) => (
              <div key={feature.text} className="auth-feature-item">
                <div className="auth-feature-icon">{feature.icon}</div>
                <span className="auth-feature-text">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-showcase-footer">Trusted by 500+ happy AutoShop customers</div>
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
            <h2 className="auth-heading">Welcome back</h2>
            <p className="auth-subheading">Sign in to continue to your AutoShop account.</p>

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

            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              <div>
                <label className="form-label">Email address</label>
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary justify-center"
                style={{ padding: "13px 20px", fontSize: 15, marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg style={{ animation: "spin 0.7s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            <p className="auth-bottom-text">
              Don&apos;t have an account?{" "}
              <Link href="/register">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
