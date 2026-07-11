import { Link } from "react-router-dom";
export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <img
        src={book.cover_url || "https://placehold.co/200x280?text=No+Cover"}
        alt={book.title}
        className="book-cover"
      />
      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="book-author">{book.author}</p>
        {book.category && <span className="badge">{book.category}</span>}
        <div className="rating">
          ⭐ {Number(book.avg_rating).toFixed(1)} ({book.review_count})
        </div>
      </div>
    </Link>
  );
}
