import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";

export default function EditBook() {
  const { id } = useParams();
  const user = getUser();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getBook(id)
      .then((data) => {
        const b = data.book;
        setTitle(b.title);
        setAuthor(b.author);
        setDescription(b.description || "");
        setCategory(b.category || "");
        setCoverUrl(b.cover_url || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) {
    return (
      <div className="container narrow">
        <p>You need to log in to edit a book.</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.updateBook(id, {
        title,
        author,
        description,
        category,
        cover_url: coverUrl,
        user_id: user.id,
      });
      navigate(`/books/${id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="container">Loading...</div>;
  return (
    <div className="container narrow">
      <h1>Edit Book</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Author *</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} required />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Choose one</option>
          <option value="Fiction">Fiction</option>
          <option value="NonFiction">Non-Fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Poetry">Poetry</option>
        </select>

        <label>Cover image URL</label>
        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
