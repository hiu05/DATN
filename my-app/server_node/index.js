// server_node/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Op, QueryTypes } = require("sequelize");
const stripe = require("./routes/stripe");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/upload", express.static(path.join(__dirname, "public/upload")));

app.use("/api/stripe", stripe);
// Kết nối Sequelize + Models
const {
  sequelize,
  ProductModel,
  ProductImageModel,
  BrandModel,
  WishlistModel,
  PostModel,
  CommentModel, // ★ dùng cho comments
  UserModel,
} = require("./database");

/* ---------------- Helper: tính summary cho comments ---------------- */
function buildSummary(items) {
  const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const it of items) {
    const r = Math.max(1, Math.min(5, Math.round(Number(it.rating) || 0)));
    histogram[r] = (histogram[r] || 0) + 1;
    sum += r;
  }
  const count = items.length;
  const average = count ? Math.round((sum / count) * 10) / 10 : 0;
  return { average, count, histogram };
}

/* ===================== API: Lọc & sắp xếp sản phẩm ===================== */
app.get("/api/sanpham", async (req, res) => {
  const { brand, sort, ids, exclude, limit } = req.query;
  const where = { status: 1 };

  if (ids) {
    const arrIds = String(ids)
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n > 0);
    if (arrIds.length === 0) return res.json([]);
    where.id = { ...(where.id || {}), [Op.in]: arrIds };
  }
  if (brand) where.brand_id = brand;

  if (exclude) {
    const ex = parseInt(exclude, 10);
    if (Number.isInteger(ex)) where.id = { ...(where.id || {}), [Op.ne]: ex };
  }

  let order = [["created_at", "DESC"]];
  if (sort === "price_asc") order = [["discount_price", "ASC"]];
  if (sort === "price_desc") order = [["discount_price", "DESC"]];
  if (sort === "sale") order = [[sequelize.literal("(price - discount_price) / price"), "DESC"]];
  if (sort === "view") order = [["view", "DESC"]];
  if (sort === "hot") order = [["hot", "DESC"]];
  if (sort === "random") order = [sequelize.literal("RAND()")];

  try {
    const products = await ProductModel.findAll({
      where,
      order,
      limit: limit ? Number(limit) : undefined,
      attributes: [
        "id","name","slug","price","discount_price","view","hot","stock_quantity","created_at","brand_id",
      ],
      include: [
        { model: ProductImageModel, as: "images" },
        { model: BrandModel, as: "brand", attributes: ["id", "name", ["logo_url", "logo"]] },
      ],
    });
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lọc sản phẩm:", err);
    res.status(500).json({ error: "Lỗi khi lọc sản phẩm", details: err });
  }
});

/* ===================== API: Tìm kiếm sản phẩm ===================== */
app.get("/api/sanpham/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 12);

    if (!q) return res.json({ items: [], total: 0, page, pageSize });

    const where = {
      status: 1,
      [Op.or]: [{ name: { [Op.like]: `%${q}%` } }, { slug: { [Op.like]: `%${q}%` } }],
    };

    const { rows, count } = await ProductModel.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      attributes: ["id","name","slug","price","discount_price","view","created_at"],
      include: [
        { model: ProductImageModel, as: "images", attributes: ["image_url", "is_main"] },
        { model: BrandModel, as: "brand", attributes: ["id", "name", ["logo_url", "logo"]] },
      ],
    });

    res.json({ items: rows, total: count, page, pageSize });
  } catch (err) {
    console.error("❌ Lỗi tìm kiếm sản phẩm:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== API: Danh sách thương hiệu ===================== */
app.get("/api/brands", async (req, res) => {
  try {
    const brands = await BrandModel.findAll({
      where: { status: 1 },
      order: [["sort_order", "ASC"]],
      attributes: ["id", "name", "slug", ["logo_url", "logo"]],
    });
    res.json(brands);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách brand:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== API: Chi tiết sản phẩm theo slug ===================== */
app.get("/api/sanpham/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await ProductModel.findOne({
      where: { slug },
      include: [
        { model: ProductImageModel, as: "images" },
        { model: BrandModel, as: "brand", attributes: ["id", "name", ["logo_url", "logo"]] },
      ],
    });
    if (!product) return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    res.json(product);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== API: Sản phẩm liên quan theo thương hiệu ===================== */
app.get("/api/sanpham/:id/lienquan", async (req, res) => {
  const id = Number(req.params.id);
  const limit = Number(req.query.limit) || 6;

  try {
    const current = await ProductModel.findByPk(id, { attributes: ["id", "brand_id"] });
    if (!current) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    const list = await ProductModel.findAll({
      where: { status: 1, brand_id: current.brand_id, id: { [Op.ne]: id } },
      order: [["view", "DESC"]],
      limit,
      attributes: ["id", "name", "slug", "price", "discount_price", "view", "brand_id"],
      include: [{ model: ProductImageModel, as: "images" }],
    });

    res.json(list);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm liên quan:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== API: Tăng lượt xem ===================== */
app.post("/api/tang-view/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await ProductModel.increment("view", { where: { id } });
    res.json({ message: "Đã tăng lượt xem" });
  } catch (err) {
    console.error("❌ Lỗi khi tăng view:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== API: Sản phẩm mới nhất ===================== */
app.get("/api/spmoi/:limit", async (req, res) => {
  const limit = parseInt(req.params.limit, 10) || 6;
  try {
    const products = await ProductModel.findAll({
      where: { status: 1 },
      order: [["created_at", "DESC"]],
      limit,
      attributes: ["id","name","slug","price","discount_price","created_at","view", "stock_quantity"],
      include: [{ model: ProductImageModel, as: "images" }],
    });
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm mới:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== API: Sản phẩm hot ===================== */
app.get("/api/sphot/:limit", async (req, res) => {
  const limit = parseInt(req.params.limit, 10) || 6;
  try {
    const products = await ProductModel.findAll({
      where: { hot: 1, status: 1 },
      order: [["view", "DESC"]],
      limit,
      attributes: ["id","name","slug","price","discount_price","created_at","view", "stock_quantity"],
      include: [{ model: ProductImageModel, as: "images" }],
    });
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lấy sản phẩm hot:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== API: Tin tức (posts) ===================== */
app.get("/api/tin-tuc", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 13);

    const where = { is_published: 1 };
    if (q) where[Op.or] = [{ title: { [Op.like]: `%${q}%` } }, { excerpt: { [Op.like]: `%${q}%` } }];

    const { rows, count } = await PostModel.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      attributes: ["id", "title", "slug", "excerpt", "image_url", "created_at"],
    });

    res.json({ items: rows, total: count, page, pageSize });
  } catch (err) {
    console.error("❌ Lỗi tải tin tức:", err);
    res.status(500).json({ error: "Lỗi tải tin tức", details: err });
  }
});

app.get("/api/tin-tuc/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const post = await PostModel.findOne({
      where: { slug, is_published: 1 },
      attributes: ["id", "title", "slug", "excerpt", "content", "image_url", "created_at"],
    });
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.json(post);
  } catch (err) {
    console.error("❌ Lỗi lấy bài viết:", err);
    res.status(500).json({ error: "Lỗi lấy bài viết", details: err });
  }
});

/* ===================== API: WISHLIST ===================== */
function getUserId(req) {
  return (
    parseInt(req.header("x-user-id"), 10) ||
    parseInt(req.query.user_id, 10) ||
    parseInt(req.body && req.body.user_id, 10) ||
    null
  );
}

app.get("/api/wishlist", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Thiếu user_id" });

  try {
    const rows = await WishlistModel.findAll({
      where: { user_id: userId },
      attributes: ["id", "product_id", "added_at"],
      include: [
        {
          model: ProductModel,
          as: "product",
          attributes: ["id", "name", "slug", "price", "discount_price", "view"],
          include: [{ model: ProductImageModel, as: "images", attributes: ["image_url", "is_main"] }],
        },
      ],
    });

    const out = rows.map((r) => {
      const plain = r.get ? r.get({ plain: true }) : r;
      const p = plain?.product || null;
      let pid = null;
      if (plain?.product_id != null) pid = plain.product_id;
      else if (p?.id != null) pid = p.id;

      const images = Array.isArray(p?.images)
        ? p.images.map((img) => ({ image_url: img.image_url, is_main: img.is_main }))
        : [];

      return {
        product_id: pid,
        product: p
          ? { id: p.id, name: p.name, slug: p.slug, price: p.price, discount_price: p.discount_price, view: p.view, images }
          : null,
      };
    });

    res.json(out);
  } catch (err) {
    console.error("❌ Lỗi khi lấy wishlist:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.post("/api/wishlist", async (req, res) => {
  const userId = getUserId(req);
  const { product_id } = req.body || {};
  if (!userId) return res.status(401).json({ error: "Thiếu user_id" });
  if (!product_id) return res.status(400).json({ error: "Thiếu product_id" });

  try {
    const existed = await WishlistModel.findOne({ where: { user_id: userId, product_id } });
    if (existed) return res.json({ message: "Đã tồn tại trong yêu thích" });
    await WishlistModel.create({ user_id: userId, product_id });
    res.json({ message: "Đã thêm vào yêu thích" });
  } catch (err) {
    console.error("❌ Lỗi khi thêm wishlist:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.delete("/api/wishlist/:product_id", async (req, res) => {
  const userId = getUserId(req);
  const product_id = req.params.product_id;
  if (!userId) return res.status(401).json({ error: "Thiếu user_id" });

  try {
    await WishlistModel.destroy({ where: { user_id: userId, product_id } });
    res.json({ message: "Đã xoá khỏi yêu thích" });
  } catch (err) {
    console.error("❌ Lỗi khi xoá wishlist:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/* ===================== ★ API: COMMENTS (LƯU DB) ===================== */
// === REPLACE nguyên khối GET /api/comments bằng đoạn này ===
app.get("/api/comments", async (req, res) => {
  try {
    const product_id = Number(req.query.product_id || 0);
    if (!product_id) return res.status(400).json({ error: "product_id required" });

    // Chỉ select email để tránh lỗi Unknown column
    const rows = await sequelize.query(
      `
      SELECT
        c.id, c.user_id, c.product_id, c.rating, c.comment, c.created_at,
        u.email AS user_email
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.product_id = ?
      ORDER BY c.created_at DESC
      `,
      { replacements: [product_id], type: sequelize.QueryTypes.SELECT }
    );

    const items = rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      product_id: r.product_id,
      rating: Number(r.rating) || 0,
      comment: r.comment,
      created_at: r.created_at,
      user: {
        id: r.user_id,
        name: r.user_email || `User #${r.user_id}`,
        email: r.user_email || undefined,
      },
    }));

    // summary an toàn
    const histogram = {1:0,2:0,3:0,4:0,5:0};
    let sum = 0;
    for (const it of items) {
      const rt = Math.max(1, Math.min(5, Math.round(it.rating)));
      histogram[rt] = (histogram[rt] || 0) + 1;
      sum += rt;
    }
    const count = items.length;
    const average = count ? Math.round((sum / count) * 10) / 10 : 0;

    return res.json({ items, summary: { average, count, histogram } });
  } catch (e) {
    console.error("❌ GET /api/comments error:", e);
    return res.status(500).json({ error: "server error" });
  }
});


/** POST /api/comments  Body: { user_id, product_id, rating, comment } */
app.post("/api/comments", async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body || {};
    if (!user_id || !product_id || !rating || !comment?.trim()) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating phải 1..5" });
    }

    // Tạo bằng ORM để chắc chắn lấy được id mới chèn
    const row = await CommentModel.create({
      user_id,
      product_id,
      rating,
      comment: String(comment).slice(0, 1000),
      created_at: new Date(),
    });

    // Chỉ lấy email để tránh lỗi thiếu cột
    let u = null;
    try {
      u = await UserModel.findByPk(user_id, { attributes: ["id", "email"] });
    } catch (_) {
      // nếu model không match DB cũng bỏ qua
    }

    return res.status(201).json({
      id: row.id,
      user_id: row.user_id,
      product_id: row.product_id,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        name: u?.email || `User #${row.user_id}`,
        email: u?.email,
      },
    });
  } catch (e) {
    console.error("❌ POST /api/comments error:", e);
    return res.status(500).json({ error: "server error" });
  }
});

/* ===================== KHỞI ĐỘNG SERVER ===================== */
const server = app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
server.on("error", (err) => {
  console.error("❌ Lỗi khi chạy server:", err);
});
