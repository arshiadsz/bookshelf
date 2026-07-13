import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function BookDetail() {
  const { id } = useParams();
  const user = getUser();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const data = await api.getBook(id, user?.id);
      setBook(data.book);
      setReviews(data.reviews);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleToggleFavorite() {
    if (!user) return navigate("/login");
    try {
      if (book.is_favorited) {
        await api.removeFavorite(id, user.id);
      } else {
        await api.addFavorite(user.id, id);
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLikeReview(reviewId) {
    if (!user) return navigate("/login");
    try {
      await api.likeReview(reviewId, user.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddToList(newStatus) {
    if (!user) return navigate("/login");
    try {
      await api.addToReadingList({ user_id: user.id, book_id: id, status: newStatus });
      setMessage("Added to your reading list");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!user) return navigate("/login");
    try {
      await api.addReview(id, { user_id: user.id, rating, comment });
      setComment("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.deleteBook(id, user.id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="container error">{error}</div>;
  if (!book) return <div className="container">Loading...</div>;

  const isOwner = user && user.id === book.owner_id;

  return (
    <div className="container">
      <div className="book-detail">
        <img
          src={book.cover_url || "https://placehold.co/240x340?text=No+Cover"}
          alt={book.title}
          className="book-cover-large"
        />
        <div>
          <h1>{book.title}</h1>
          <p className="book-author">By {book.author}</p>
          {book.category && <span className="badge">{book.category}</span>}
          <p className="rating">
            ⭐ {Number(book.avg_rating).toFixed(1)} from {book.review_count} reviews
          </p>
          <p>{book.description}</p>

          {isOwner ? (
            <div className="owner-actions">
              <Link to={`/books/${id}/edit`}>
                <button>Edit</button>
              </Link>
              <button className="danger" onClick={handleDelete}>
                Delete Book
              </button>
            </div>
          ) : (
            <div className="reading-actions">
              <button onClick={() => handleAddToList("want")}>Want to Read</button>
              <button onClick={() => handleAddToList("reading")}>Currently Reading</button>
              <button onClick={() => handleAddToList("done")}>Finished</button>
              <button
                className={book.is_favorited ? "favorited" : ""}
                onClick={handleToggleFavorite}
              >
                {book.is_favorited ? "❤️ Favorited" : "🤍 Favorite"}
              </button>
            </div>
          )}
          {message && <p className="success">{message}</p>}
        </div>
      </div>

      <hr />

      <h2>Reviews</h2>
      {user && (
        <form className="form review-form" onSubmit={handleReviewSubmit}>
          <label>Rating</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            <option value={5}>5 stars</option>
            <option value={4}>4 stars</option>
            <option value={3}>3 stars</option>
            <option value={2}>2 stars</option>
            <option value={1}>1 star</option>
          </select>
          <label>Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Write your review..."
          />
          <button type="submit">Submit Review</button>
        </form>
      )}
      <div className="reviews-list">
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <strong>{r.user_name}</strong> — ⭐ {r.rating}
            <p>{r.comment}</p>
            <button
              className={`like-btn ${r.liked_by_me ? "liked" : ""}`}
              onClick={() => handleLikeReview(r.id)}
            >
              👍 {r.like_count > 0 ? r.like_count : ""}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
