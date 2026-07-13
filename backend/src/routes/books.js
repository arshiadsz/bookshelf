const express = require("express");
const router = express.Router();
const sql = require("../sql");

async function getBookRatingInfo(bookId) {
  const result = await sql`
    SELECT AVG(rating) AS avg_rating, COUNT(*) AS review_count
    FROM reviews WHERE book_id = ${bookId}`;
  const row = result[0];
  return {
    avg_rating: row.avg_rating ? Number(row.avg_rating) : 0,
    review_count: Number(row.review_count),
  };
}

function compareByRatingHighToLow(bookA, bookB) {
  return bookB.avg_rating - bookA.avg_rating;
}

function compareByTitleAZ(bookA, bookB) {
  if (bookA.title < bookB.title) return -1;
  if (bookA.title > bookB.title) return 1;
  return 0;
}

function compareByNewestFirst(bookA, bookB) {
  return new Date(bookB.created_at) - new Date(bookA.created_at);
}

router.get("/", async (req, res) => {
  const { category, author, keyword, sort, page } = req.query;
  const booksPerPage = 10;
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  try {
    const allBooks = await sql`SELECT * FROM books`;
    for (const book of allBooks) {
      const ratingInfo = await getBookRatingInfo(book.id);
      book.avg_rating = ratingInfo.avg_rating;
      book.review_count = ratingInfo.review_count;
    }
    const filteredBooks = [];
    for (const book of allBooks) {
      let matches = true;
      if (category && book.category !== category) {
        matches = false;
      }
      if (author && !book.author.toLowerCase().includes(author.toLowerCase())) {
        matches = false;
      }
      if (keyword) {
        const titleHasKeyword = book.title.toLowerCase().includes(keyword.toLowerCase());
        const descriptionHasKeyword =
          book.description && book.description.toLowerCase().includes(keyword.toLowerCase());
        if (!titleHasKeyword && !descriptionHasKeyword) {
          matches = false;
        }
      }
      if (matches) {
        filteredBooks.push(book);
      }
    }
    if (sort === "rating") {
      filteredBooks.sort(compareByRatingHighToLow);
    } else if (sort === "alphabetical") {
      filteredBooks.sort(compareByTitleAZ);
    } else {
      filteredBooks.sort(compareByNewestFirst);
    }
    let totalPages = 0;
    let remainingBooks = filteredBooks.length;
    while (remainingBooks > 0) {
      totalPages = totalPages + 1;
      remainingBooks = remainingBooks - booksPerPage;
    }
    if (totalPages === 0) {
      totalPages = 1;
    }
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;

    const booksForThisPage = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (filteredBooks[i]) {
        booksForThisPage.push(filteredBooks[i]);
      }
    }
    res.json({
      books: booksForThisPage,
      page: currentPage,
      totalCount: filteredBooks.length,
      totalPages: totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/top-rated", async (req, res) => {
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 5;
  try {
    const allBooks = await sql`SELECT * FROM books`;
    for (const book of allBooks) {
      const ratingInfo = await getBookRatingInfo(book.id);
      book.avg_rating = ratingInfo.avg_rating;
      book.review_count = ratingInfo.review_count;
    }
    const reviewedBooks = allBooks.filter((b) => b.review_count > 0);
    reviewedBooks.sort(compareByRatingHighToLow);
    res.json(reviewedBooks.slice(0, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reviews/:reviewId/like", async (req, res) => {
  const { reviewId } = req.params;
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }
  try {
    const existing = await sql`
      SELECT id FROM review_likes WHERE review_id = ${reviewId} AND user_id = ${user_id}`;
    let liked;
    if (existing.length > 0) {
      await sql`DELETE FROM review_likes WHERE id = ${existing[0].id}`;
      liked = false;
    } else {
      await sql`INSERT INTO review_likes (review_id, user_id) VALUES (${reviewId}, ${user_id})`;
      liked = true;
    }
    const countResult = await sql`
      SELECT COUNT(*) AS count FROM review_likes WHERE review_id = ${reviewId}`;
    res.json({ liked, like_count: Number(countResult[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  try {
    const bookResult = await sql`SELECT * FROM books WHERE id = ${id}`;
    if (bookResult.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    const book = bookResult[0];
    const ratingInfo = await getBookRatingInfo(id);
    book.avg_rating = ratingInfo.avg_rating;
    book.review_count = ratingInfo.review_count;

    const reviews = await sql`
      SELECT reviews.*, users.name AS user_name,
        (SELECT COUNT(*) FROM review_likes WHERE review_likes.review_id = reviews.id) AS like_count
      FROM reviews
      JOIN users ON users.id = reviews.user_id
      WHERE reviews.book_id = ${id}
      ORDER BY reviews.created_at DESC`;

    book.is_favorited = false;
    let likedReviewIds = [];

    if (user_id) {
      const favResult = await sql`
        SELECT id FROM favorites WHERE user_id = ${user_id} AND book_id = ${id}`;
      book.is_favorited = favResult.length > 0;

      const likedResult = await sql`
        SELECT review_likes.review_id
        FROM review_likes
        JOIN reviews ON reviews.id = review_likes.review_id
        WHERE review_likes.user_id = ${user_id} AND reviews.book_id = ${id}`;
      likedReviewIds = likedResult.map((r) => r.review_id);
    }
    for (const review of reviews) {
      review.like_count = Number(review.like_count);
      review.liked_by_me = likedReviewIds.includes(review.id);
    }
    res.json({ book, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { title, author, description, category, cover_url, owner_id } = req.body;

  if (!title || !author || !owner_id) {
    return res.status(400).json({ error: "title, author and owner_id are required" });
  }

  try {
    const result = await sql`
      INSERT INTO books (title, author, description, category, cover_url, owner_id)
      VALUES (${title}, ${author}, ${description || null}, ${category || null}, ${cover_url || null}, ${owner_id})
      RETURNING *`;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, description, category, cover_url, user_id } = req.body;
  try {
    const existing = await sql`SELECT owner_id FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (existing[0].owner_id !== user_id) {
      return res.status(403).json({ error: "Only the owner can edit this book" });
    }
    const result = await sql`
      UPDATE books
      SET title = ${title}, author = ${author}, description = ${description},
          category = ${category}, cover_url = ${cover_url}
      WHERE id = ${id}
      RETURNING *`;
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  try {
    const existing = await sql`SELECT owner_id FROM books WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (existing[0].owner_id !== user_id) {
      return res.status(403).json({ error: "Only the owner can delete this book" });
    }
    await sql`DELETE FROM books WHERE id = ${id}`;
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/reviews", async (req, res) => {
  const { id } = req.params;
  const { user_id, rating, comment } = req.body;
  if (!user_id || !rating) {
    return res.status(400).json({ error: "user_id and rating are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be between 1 and 5" });
  }
  try {
    const result = await sql`
      INSERT INTO reviews (book_id, user_id, rating, comment)
      VALUES (${id}, ${user_id}, ${rating}, ${comment || null})
      ON CONFLICT (book_id, user_id)
      DO UPDATE SET rating = ${rating}, comment = ${comment || null}
      RETURNING *`;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
