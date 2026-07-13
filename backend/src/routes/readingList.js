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
      SELECT reading_list.id AS list_id, reading_list.status, books.*
      FROM reading_list
      JOIN books ON books.id = reading_list.book_id
      WHERE reading_list.user_id = ${user_id}
      ORDER BY reading_list.created_at DESC`;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { user_id, book_id, status } = req.body;
  if (!user_id || !book_id) {
    return res.status(400).json({ error: "user_id and book_id are required" });
  }
  try {
    const result = await sql`
      INSERT INTO reading_list (user_id, book_id, status)
      VALUES (${user_id}, ${book_id}, ${status || "want"})
      ON CONFLICT (user_id, book_id) DO UPDATE SET status = ${status || "want"}
      RETURNING *`;
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, status } = req.body;
  try {
    const existing = await sql`SELECT user_id FROM reading_list WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    if (existing[0].user_id !== user_id) {
      return res.status(403).json({ error: "You cannot change this entry" });
    }
    const result = await sql`
      UPDATE reading_list SET status = ${status} WHERE id = ${id}
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
    const existing = await sql`SELECT user_id FROM reading_list WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    if (existing[0].user_id !== user_id) {
      return res.status(403).json({ error: "You cannot delete this entry" });
    }
    await sql`DELETE FROM reading_list WHERE id = ${id}`;
    res.json({ message: "Removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;