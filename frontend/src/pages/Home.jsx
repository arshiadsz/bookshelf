import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import BookCard from "../components/BookCard";
import { getUser } from "../auth";

export default function Home() {
  const user = getUser();
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [topRated, setTopRated] = useState([]);

  function isFavorited(bookId) {
    for (let i = 0; i < favoriteIds.length; i++) {
      if (favoriteIds[i] === bookId) {
        return true;
      }
    }
    return false;
  }

  async function loadBooks() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getBooks({ category, author, keyword, sort, page });
      setBooks(data.books);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTopRated() {
    try {
      const data = await api.getTopRated(5);
      setTopRated(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadFavorites() {
    if (!user) return;
    try {
      const data = await api.getFavorites(user.id);
      const ids = [];
      for (let i = 0; i < data.length; i++) {
        ids.push(data[i].id);
      }
      setFavoriteIds(ids);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadBooks();
    loadTopRated();
    loadFavorites();
  }, [page, sort]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadBooks();
  }

  async function handleToggleFavorite(bookId) {
    if (!user) return;
    const alreadyFavorited = isFavorited(bookId);
    try {
      if (alreadyFavorited) {
        await api.removeFavorite(bookId, user.id);
      } else {
        await api.addFavorite(user.id, bookId);
      }
      loadFavorites();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <h1>Browse Books</h1>

      {topRated.length > 0 && (
        <div className="top-rated-section">
          <h2>🔥 Top Rated</h2>
          <div className="top-rated-row">
            {topRated.map((book, index) => (
              <Link key={book.id} to={`/books/${book.id}`} className="top-rated-card">
                <span className="top-rated-rank">{index + 1}</span>
                <img
                  src={book.cover_url || "https://placehold.co/200x280?text=No+Cover"}
                  alt={book.title}
                  className="top-rated-cover"
                />
                <div className="top-rated-info">
                  <p className="top-rated-title">{book.title}</p>
                  <span className="rating">⭐ {Number(book.avg_rating).toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <form className="filters" onSubmit={handleFilterSubmit}>
        <input
          placeholder="Search (title or description)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="Fiction">Fiction</option>
          <option value="NonFiction">Non-Fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Poetry">Poetry</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Newest</option>
          <option value="rating">Top rated</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
        <button type="submit">Apply filters</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="book-grid">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isFavorited={isFavorited(book.id)}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
          />
        ))}
      </div>
      {books.length === 0 && !loading && <p>No books found.</p>}
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}