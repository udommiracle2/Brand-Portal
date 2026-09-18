import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ProductForm from "../components/ProductForm";
import client, { apiErrorMessage } from "../api/client";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    client
      .get(`/products/${id}`)
      .then(({ data }) => active && setProduct(data.product))
      .catch((err) => active && setLoadError(apiErrorMessage(err, "Couldn't load this product.")));
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError("");
    try {
      await client.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/products", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save your changes."));
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1>Edit product</h1>
          <div className="topbar__meta">Changes are visible to buyers as soon as you save.</div>
        </div>
      </div>

      {loadError && (
        <div className="banner banner--error">
          {loadError} <Link to="/products">Back to products</Link>
        </div>
      )}

      {!loadError && !product && <div className="panel">Loading…</div>}

      {product && (
        <div className="panel">
          <ProductForm
            initial={product}
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
          />
        </div>
      )}
    </AppLayout>
  );
}
