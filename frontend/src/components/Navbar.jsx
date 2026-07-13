import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
import { getTheme, toggleTheme } from "../theme";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getTheme());

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleThemeToggle() {
    setTheme(toggleTheme());
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">BookShelf</Link>
      <div className="nav-links">
        <Link to="/">Books</Link>
        {user && <Link to="/create">Add Book</Link>}
        {user && <Link to="/dashboard">Dashboard</Link>}
        <button className="theme-toggle" onClick={handleThemeToggle} title="Toggle dark mode">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
