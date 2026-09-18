import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ProductForm from "../components/ProductForm";
import client, { apiErrorMessage } from "../api/client";

export default function AddProduct() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    setSubmitting(true);
    setError("");
    try {
      await client.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/products", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't add this product."));
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1>Add product</h1>
          <div className="topbar__meta">This will go live in your catalogue right away.</div>
        </div>
      </div>

      <div className="panel">
        <ProductForm submitting={submitting} error={error} onSubmit={handleSubmit} submitLabel="Add product" />
      </div>
    </AppLayout>
  );
}
