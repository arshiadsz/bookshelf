import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function Dashboard() {
  const user = getUser();
  const navigate = useNavigate();
  const [myBooks, setMyBooks] = useState([]);
  const [readingList, setReadingList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.getUserBooks(user.id).then(setMyBooks).catch((err) => setError(err.message));
    api.getReadingList(user.id).then(setReadingList).catch((err) => setError(err.message));
    api.getFavorites(user.id).then(setFavorites).catch((err) => setError(err.message));
  }, []);

  async function handleRemove(listId) {
    try {
      await api.removeFromReadingList(listId, user.id);
      const freshList = await api.getReadingList(user.id);
      setReadingList(freshList);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(listId, newStatus) {
    try {
      await api.updateReadingListStatus(listId, user.id, newStatus);
      const freshList = await api.getReadingList(user.id);
      setReadingList(freshList);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveFavorite(bookId) {
    try {
      await api.removeFavorite(bookId, user.id);
      setFavorites((list) => list.filter((b) => b.id !== bookId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) return null;

  return (
    <div className="container">
      <h1>{user.name}'s Dashboard</h1>
      {error && <p className="error">{error}</p>}
      <h2>Books I Added</h2>
      {myBooks.length === 0 && <p>You haven't added any books yet.</p>}
      <div className="book-grid">
        {myBooks.map((book) => (
          <Link key={book.id} to={`/books/${book.id}`} className="book-card">
            <img
              src={book.cover_url || "https://placehold.co/200x280?text=No+Cover"}
              alt={book.title}
              className="book-cover"
            />
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="book-author">{book.author}</p>
            </div>
          </Link>
        ))}
      </div>
      <h2>❤️ My Favorites</h2>
      {favorites.length === 0 && <p>You haven't favorited any books yet.</p>}
      <div className="book-grid">
        {favorites.map((book) => (
          <div key={book.id} className="favorite-card-wrapper">
            <Link to={`/books/${book.id}`} className="book-card">
              <img
                src={book.cover_url || "https://placehold.co/200x280?text=No+Cover"}
                alt={book.title}
                className="book-cover"
              />
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="book-author">{book.author}</p>
              </div>
            </Link>
            <button className="danger" onClick={() => handleRemoveFavorite(book.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <h2>My Reading List</h2>
      {readingList.length === 0 && <p>Your reading list is empty.</p>}
      <div className="reading-list-table">
        {readingList.map((item) => (
          <div key={item.list_id} className="reading-list-row">
            <Link to={`/books/${item.id}`}>{item.title}</Link>
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(item.list_id, e.target.value)}
            >
              <option value="want">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="done">Finished</option>
            </select>
            <button className="danger" onClick={() => handleRemove(item.list_id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
