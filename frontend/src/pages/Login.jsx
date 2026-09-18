import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "We couldn't sign you in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__side">
        <div className="auth-screen__mark">Atelier</div>
        <div className="auth-screen__pitch">
          <h2>Welcome back.</h2>
          <p>Sign in to check stock, update pricing, and see how your products are doing.</p>
        </div>
        <div className="auth-screen__note">A single portal for every product you sell.</div>
      </div>

      <div className="auth-screen__form">
        <div className="auth-card">
          <h1>Sign in</h1>
          <p className="auth-card__sub">Enter your brand account details.</p>

          {error && <div className="banner banner--error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@brand.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Your password"
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="auth-card__switch">
            New here? <Link to="/register">Create a brand account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
