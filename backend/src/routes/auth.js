const express = require("express");
const router = express.Router();
const sql = require("../sql");
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  try {
    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${password})
      RETURNING id, name, email`;
    res.status(201).json(result[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "This email is already registered" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  try {
    const result = await sql`
      SELECT id, name, email FROM users
      WHERE email = ${email} AND password = ${password}`;
    if (result.length === 0) {
      return res.status(401).json({ error: "Wrong email or password" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;