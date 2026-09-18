import { useRef } from "react";

// existingImages: array of URL strings already saved on the product
// newFiles: array of File objects staged for upload
export default function ImageUploader({ existingImages, onRemoveExisting, newFiles, onAddFiles, onRemoveNew }) {
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, 6 - existingImages.length - newFiles.length);
    if (files.length) onAddFiles(files);
  }

  const atLimit = existingImages.length + newFiles.length >= 6;

  return (
    <div>
      <div className="image-grid">
        {existingImages.map((src) => (
          <div className="image-tile" key={src}>
            <img src={src} alt="Product" />
            <button type="button" className="image-tile__remove" onClick={() => onRemoveExisting(src)} aria-label="Remove image">
              ×
            </button>
          </div>
        ))}

        {newFiles.map((file, i) => (
          <div className="image-tile" key={`${file.name}-${i}`}>
            <img src={URL.createObjectURL(file)} alt={file.name} />
            <button type="button" className="image-tile__remove" onClick={() => onRemoveNew(i)} aria-label="Remove image">
              ×
            </button>
          </div>
        ))}

        {!atLimit && (
          <button type="button" className="upload-tile" onClick={() => inputRef.current?.click()} aria-label="Add image">
            +
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="field-hint">Up to 6 photos, 5MB each. JPG, PNG, WEBP or GIF.</div>
    </div>
  );
}
