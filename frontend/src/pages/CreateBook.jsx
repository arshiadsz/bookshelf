import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { getUser } from "../auth";
export default function CreateBook() {
  const user = getUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="container narrow">
        <p>You need to log in to add a book.</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !author.trim()) {
      setError("Title and author are required");
      return;
    }

    try {
      const book = await api.createBook({
        title,
        author,
        description,
        category,
        cover_url: coverUrl,
        owner_id: user.id,
      });
      navigate(`/books/${book.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container narrow">
      <h1>Add a New Book</h1>
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

        <label>Cover image URL (optional)</label>
        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />

        {error && <p className="error">{error}</p>}

        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}
