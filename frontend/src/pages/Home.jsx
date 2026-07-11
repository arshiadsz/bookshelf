import { useEffect, useState } from "react";
import { api } from "../api";
import BookCard from "../components/BookCard";
export default function Home() {
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadBooks();
  }, [page, sort]);

  function handleFilterSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadBooks();
  }

  return (
    <div className="container">
      <h1>Browse Books</h1>

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
          <BookCard key={book.id} book={book} />
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