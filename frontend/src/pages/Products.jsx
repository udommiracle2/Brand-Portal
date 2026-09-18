import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import client, { apiErrorMessage, resolveMediaUrl } from "../api/client";

function StatusBadge({ product }) {
  if (!product.available) return <span className="badge badge--unavailable">Unavailable</span>;
  if (product.stock <= 0) return <span className="badge badge--out">Out of stock</span>;
  return <span className="badge badge--available">Available</span>;
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    client
      .get("/products", { params: { search, status } })
      .then(({ data }) => setProducts(data.products))
      .catch((err) => setError(apiErrorMessage(err, "Couldn't load your products.")))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeletingId(product.id);
    try {
      await client.delete(`/products/${product.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      alert(apiErrorMessage(err, "Couldn't delete this product."));
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleAvailability(product) {
    try {
      const { data } = await client.patch(`/products/${product.id}/availability`, {
        available: !product.available,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? data.product : p)));
    } catch (err) {
      alert(apiErrorMessage(err, "Couldn't update availability."));
    }
  }

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1>Products</h1>
          <div className="topbar__meta">{products.length} in your catalogue</div>
        </div>
        <Link to="/products/new" className="btn">
          Add product
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="panel" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products yet</h3>
            <p>Add your first product to start selling.</p>
            <Link to="/products/new" className="btn" style={{ marginTop: 14 }}>
              Add product
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          className="product-thumb"
                          src={resolveMediaUrl(p.images[0]) || "https://placehold.co/88x88?text=%20"}
                          alt={p.name}
                        />
                        <div>
                          <div className="product-name">{p.name}</div>
                          <div className="product-category">{p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <StatusBadge product={p} />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn--ghost btn--small" onClick={() => toggleAvailability(p)}>
                          {p.available ? "Mark unavailable" : "Mark available"}
                        </button>
                        <Link to={`/products/${p.id}/edit`} className="btn btn--ghost btn--small">
                          Edit
                        </Link>
                        <button
                          className="btn btn--danger btn--small"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
