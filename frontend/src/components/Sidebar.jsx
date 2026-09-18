import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/products/new", label: "Add product" },
  { to: "/inventory", label: "Inventory" },
  { to: "/profile", label: "Brand profile" },
];

export default function Sidebar() {
  const { brand, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-name">{brand?.name || "Your brand"}</div>
        <div className="sidebar__brand-sub">Seller portal</div>
      </div>

      <nav className="sidebar__nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/products"}
            className={({ isActive }) =>
              "sidebar__link" + (isActive ? " sidebar__link--active" : "")
            }
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
      </div>
    </aside>
  );
}
