export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay" onMouseDown={onCancel}>
      <div className="modal-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
            <button className={danger ? "btn btn--danger" : "btn"} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
