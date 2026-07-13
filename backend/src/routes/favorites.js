const express = require("express");
const router = express.Router();
const sql = require("../sql");

router.get("/", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }
    try {
        const result = await sql`
      SELECT favorites.id AS favorite_id, books.*
      FROM favorites
      JOIN books ON books.id = favorites.book_id
      WHERE favorites.user_id = ${user_id}
      ORDER BY favorites.created_at DESC`;
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/", async (req, res) => {
    const { user_id, book_id } = req.body;
    if (!user_id || !book_id) {
        return res.status(400).json({ error: "user_id and book_id are required" });
    }
    try {
        await sql`
      INSERT INTO favorites (user_id, book_id)
      VALUES (${user_id}, ${book_id})
      ON CONFLICT (user_id, book_id) DO NOTHING`;
        res.status(201).json({ message: "Added to favorites" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/:book_id", async (req, res) => {
    const { book_id } = req.params;
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: "user_id is required" });
    }
    try {
        await sql`DELETE FROM favorites WHERE user_id = ${user_id} AND book_id = ${book_id}`;
        res.json({ message: "Removed from favorites" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
