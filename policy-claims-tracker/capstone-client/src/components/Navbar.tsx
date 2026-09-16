import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">Policy Claims Tracker</div>
      <nav className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
        <NavLink to="/claims" className={({ isActive }) => (isActive ? "active" : "")}>Claims</NavLink>
        <NavLink to="/policies" className={({ isActive }) => (isActive ? "active" : "")}>Policies</NavLink>
      </nav>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <span className="role-badge">{user?.role}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
