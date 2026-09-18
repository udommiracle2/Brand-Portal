import { useCallback, useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import client, { apiErrorMessage } from "../api/client";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [lowOnly, setLowOnly] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    client
      .get("/products")
      .then(({ data }) => setProducts(data.products))
      .catch((err) => setError(apiErrorMessage(err, "Couldn't load your inventory.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function stockValue(p) {
    return pending[p.id] ?? p.stock;
  }

  async function saveStock(p) {
    const value = Number(pending[p.id]);
    if (Number.isNaN(value) || value < 0) return;
    setSavingId(p.id);
    try {
      const { data } = await client.patch(`/products/${p.id}/stock`, { stock: value });
      setProducts((prev) => prev.map((row) => (row.id === p.id ? data.product : row)));
      setPending((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
    } catch (err) {
      alert(apiErrorMessage(err, "Couldn't update stock."));
    } finally {
      setSavingId(null);
    }
  }

  const visible = lowOnly ? products.filter((p) => p.stock <= 3) : products;

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1>Inventory</h1>
          <div className="topbar__meta">Update stock as it moves. Changes save per item.</div>
        </div>
      </div>

      <div className="toolbar">
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Show low stock only (3 or fewer)
        </label>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="panel" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading inventory…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing to show</h3>
            <p>{lowOnly ? "No products are low on stock right now." : "Add products to start tracking stock."}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current stock</th>
                  <th>Update</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const dirty = pending[p.id] !== undefined && Number(pending[p.id]) !== p.stock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          <img
                            className="product-thumb"
                            src={p.images[0] || "https://placehold.co/88x88?text=%20"}
                            alt={p.name}
                          />
                          <div className="product-name">{p.name}</div>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        {p.stock <= 0 ? (
                          <span className="badge badge--out">0 in stock</span>
                        ) : p.stock <= 3 ? (
                          <span className="badge badge--out">{p.stock} left</span>
                        ) : (
                          <span className="badge badge--available">{p.stock} in stock</span>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="stock-input"
                          value={stockValue(p)}
                          onChange={(e) =>
                            setPending((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn--ghost btn--small"
                          disabled={!dirty || savingId === p.id}
                          onClick={() => saveStock(p)}
                        >
                          {savingId === p.id ? "Saving…" : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
