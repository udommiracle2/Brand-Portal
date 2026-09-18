import { useState } from "react";
import ChipInput from "./ChipInput";
import ImageUploader from "./ImageUploader";

const CATEGORIES = [
  "Dresses",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Footwear",
  "Bags",
  "Accessories",
  "Jewelry",
];

// initial: existing product data when editing, or null when creating
export default function ProductForm({ initial, submitting, error, onSubmit, submitLabel }) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [stock, setStock] = useState(initial?.stock ?? "");
  const [sizes, setSizes] = useState(initial?.sizes || []);
  const [colours, setColours] = useState(initial?.colours || []);
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [newFiles, setNewFiles] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("colours", JSON.stringify(colours));
    if (initial) {
      formData.append("keepImages", JSON.stringify(existingImages));
    }
    newFiles.forEach((file) => formData.append("images", file));
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="banner banner--error">{error}</div>}

      <div className="form-grid">
        <div className="field form-grid--full">
          <label htmlFor="name">Product name</label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Linen Wrap Dress" />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="price">Price ($)</label>
          <input
            id="price"
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="field form-grid--full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fabric, fit, care instructions — whatever helps a buyer decide."
          />
        </div>

        <div className="field">
          <label>Sizes</label>
          <ChipInput values={sizes} onChange={setSizes} placeholder="e.g. S, M, L" />
          <div className="field-hint">Press enter or comma to add each size.</div>
        </div>

        <div className="field">
          <label>Colours</label>
          <ChipInput values={colours} onChange={setColours} placeholder="e.g. Black, Sand" />
          <div className="field-hint">Press enter or comma to add each colour.</div>
        </div>

        <div className="field">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            type="number"
            required
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="field form-grid--full">
          <label>Images</label>
          <ImageUploader
            existingImages={existingImages}
            onRemoveExisting={(src) => setExistingImages((prev) => prev.filter((i) => i !== src))}
            newFiles={newFiles}
            onAddFiles={(files) => setNewFiles((prev) => [...prev, ...files])}
            onRemoveNew={(idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
          />
        </div>
      </div>

      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
