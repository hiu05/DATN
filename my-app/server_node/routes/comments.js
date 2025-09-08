// server_node/routes/comments.js
const express = require("express");
const router = express.Router();
const { sequelize, Comment, User } = require("../database");

// Lấy list comment theo product_id + summary
router.get("/", async (req, res) => {
  try {
    const product_id = Number(req.query.product_id || 0);
    if (!product_id) return res.status(400).json({ error: "product_id required" });

    const items = await Comment.findAll({
      where: { product_id },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["created_at", "DESC"]],
      limit: 100,
    });

    const [rows] = await sequelize.query(
      "SELECT rating, COUNT(*) AS c FROM comments WHERE product_id = ? GROUP BY rating",
      { replacements: [product_id] }
    );
    const count = rows.reduce((s, r) => s + Number(r.c), 0);
    const sum   = rows.reduce((s, r) => s + Number(r.rating) * Number(r.c), 0);
    const average = count ? Math.round((sum / count) * 10) / 10 : 0;
    const histogram = {1:0,2:0,3:0,4:0,5:0};
    rows.forEach(r => histogram[Number(r.rating)] = Number(r.c));

    res.json({ items, summary: { average, count, histogram } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// Tạo comment
router.post("/", async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body || {};
    if (!user_id || !product_id || !rating || !comment?.trim())
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: "rating phải 1..5" });

    const row = await Comment.create({
      user_id, product_id, rating,
      comment: String(comment).slice(0, 1000),
      created_at: new Date(),
    });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
