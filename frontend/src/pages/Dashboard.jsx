import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import client, { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { brand } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    client
      .get("/dashboard")
      .then(({ data }) => active && setStats(data))
      .catch((err) => active && setError(apiErrorMessage(err, "Couldn't load your dashboard.")));
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1>Good to see you, {brand?.name}</h1>
          <div className="topbar__meta">Here's how your storefront is doing.</div>
        </div>
        <Link to="/products/new" className="btn">
          Add product
        </Link>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {stats && (
        <div className="stat-row">
          <div className="stat-block">
            <div className="stat-block__value">{stats.totalProducts}</div>
            <div className="stat-block__label">Total products</div>
          </div>
          <div className="stat-block">
            <div className="stat-block__value">{stats.availableProducts}</div>
            <div className="stat-block__label">Available products</div>
          </div>
          <div className="stat-block stat-block--warn">
            <div className="stat-block__value">{stats.outOfStock}</div>
            <div className="stat-block__label">Out of stock</div>
          </div>
          <div className="stat-block">
            <div className="stat-block__value">{stats.totalViews.toLocaleString()}</div>
            <div className="stat-block__label">Product views</div>
          </div>
        </div>
      )}

      <div className="panel">
        <h3 style={{ marginBottom: 10 }}>Next steps</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
          Keep your catalogue current: add new arrivals, update stock as it moves, and mark
          items unavailable while they're being restocked. Buyers see changes as soon as
          you save them.
        </p>
      </div>
    </AppLayout>
  );
}
