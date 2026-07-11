const express = require("express");
const router = express.Router();
const sql = require("../sql");
router.get("/:id/books", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql`
      SELECT * FROM books WHERE owner_id = ${id} ORDER BY created_at DESC`;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
