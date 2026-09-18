import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/products/new", label: "Add product" },
  { to: "/inventory", label: "Inventory" },
  { to: "/profile", label: "Brand profile" },
];

export default function Sidebar() {
  const { brand, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const closeMobileMenu = () => setMobileOpen(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      navigate("/register", { replace: true });
    } catch (err) {
      setDeleteError(err?.response?.data?.error || "Could not delete your account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-row">
          <div>
            <div className="sidebar__brand-name">{brand?.name || "Your brand"}</div>
            <div className="sidebar__brand-sub">Seller portal</div>
          </div>
          <button
            type="button"
            className="sidebar__menu-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`sidebar__body${mobileOpen ? " sidebar__body--open" : ""}`}>
        <nav className="sidebar__nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/products"}
              className={({ isActive }) =>
                "sidebar__link" + (isActive ? " sidebar__link--active" : "")
              }
              onClick={closeMobileMenu}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div>{brand?.email}</div>
          <button className="sidebar__logout" onClick={logout}>
            Sign out
          </button>
          <button className="sidebar__delete-account" onClick={() => setConfirmingDelete(true)}>
            Delete account
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete account"
          message="This permanently deletes your brand account, every product in your catalogue, and your uploaded images. This can't be undone."
          confirmLabel={deleting ? "Deleting…" : "Delete account"}
          danger
          onCancel={() => {
            if (!deleting) {
              setConfirmingDelete(false);
              setDeleteError("");
            }
          }}
          onConfirm={handleDeleteAccount}
        />
      )}
      {deleteError && <p className="sidebar__delete-error">{deleteError}</p>}
    </aside>
  );
}
