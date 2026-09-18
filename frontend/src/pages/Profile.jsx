import { useEffect, useRef, useState } from "react";
import AppLayout from "../components/AppLayout";
import client, { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { brand, setBrand } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    website: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!brand) return;
    setForm({
      name: brand.name || "",
      description: brand.description || "",
      location: brand.location || "",
      phone: brand.phone || "",
      whatsapp: brand.whatsapp || "",
      instagram: brand.instagram || "",
      website: brand.website || "",
    });
  }, [brand]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logoFile) formData.append("logo", logoFile);

    try {
      const { data } = await client.put("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBrand(data.brand);
      setLogoFile(null);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save your profile."));
    } finally {
      setSubmitting(false);
    }
  }

  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : brand?.logo;

  return (
    <AppLayout>
      <div className="topbar">
        <div>
          <h1>Brand profile</h1>
          <div className="topbar__meta">This is how buyers find and contact you.</div>
        </div>
      </div>

      <div className="panel">
        {error && <div className="banner banner--error">{error}</div>}
        {success && <div className="banner banner--success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="logo-uploader">
            {logoPreview ? (
              <img className="logo-preview" src={logoPreview} alt="Brand logo" />
            ) : (
              <div className="logo-preview" />
            )}
            <div>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => fileRef.current?.click()}>
                {brand?.logo || logoFile ? "Change logo" : "Upload logo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={(e) => e.target.files[0] && setLogoFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Brand name</label>
              <input id="name" type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div className="field form-grid--full">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Tell buyers what your brand is about."
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input id="whatsapp" type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="instagram">Instagram</label>
              <input
                id="instagram"
                type="text"
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="@yourbrand"
              />
            </div>
            <div className="field">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
