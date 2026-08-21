import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
  { name: "Dashboard", path: "/dashboard", icon: "⌂" },
  { name: "Subjects", path: "/subjects", icon: "▦" },
  { name: "Tasks", path: "/tasks", icon: "✓" },
  { name: "Schedule", path: "/schedule", icon: "▤" },
  { name: "Study Timer", path: "/timer", icon: "◷" },
  { name: "Goals", path: "/goals", icon: "◎" },
  { name: "Analytics", path: "/analytics", icon: "▥" },
  { name: "Achievements", path: "/achievements", icon: "★" },
];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">S</div>

        <div>
          <h2>Study Tracker</h2>
          <span>Stay productive</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-heading">MENU</p>

        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="user-info">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || ""}</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;