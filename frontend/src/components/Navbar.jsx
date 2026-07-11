import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../auth";
export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }
  return (
    <nav className="navbar">
      <Link to="/" className="logo">BookShelf</Link>
      <div className="nav-links">
        <Link to="/">Books</Link>
        {user && <Link to="/create">Add Book</Link>}
        {user && <Link to="/dashboard">Dashboard</Link>}
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
