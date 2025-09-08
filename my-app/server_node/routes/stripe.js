/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { OrderModel } = require("../database");

const TY_GIA = 25000;
const STRIPE_SECRET_KEY = "sk_test_51Rwn3xHvyBQNCCQGmWPuYVMGOelllOUM33VUKj5oD6nKugyvVn5f0bvCjeBzGnSuUZuN2wl4doTcQa8GRbDuCiXL00NM9Ofguu";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });

// Tạo URL thanh toán
router.post("/create-checkout-url", async (req, res) => {
    console.log("Body:", req.body);
  const { id, cart } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:3001/thanh-toan/hoan-tat?payment=stripe`,
      cancel_url: `http://localhost:3001/thanh-toan/hoan-tat?payment=stripe-cancel`,
      metadata: { id },
      line_items: cart.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.ten_sp },
          unit_amount: Math.round((Number(item.gia_km) / TY_GIA) * 100),
        },
        quantity: item.so_luong,
      })),
    });
    res.json({ url: session.url });

    
  } catch (err) {
    console.error("Lỗi tạo session Stripe:", err);
    res.status(500).json({ message: "Lỗi tạo session Stripe" });
  }
});

// Hủy đơn hàng
router.post("/don_hang_cancel/:id_dh", async (req, res) => {
  try {
    const { id_dh } = req.params;
    const order = await OrderModel.findOne({ id: id_dh });
    if (!order) return res.status(404).json({ thongbao: "Không tìm thấy đơn hàng" });
    
    if (order.trang_thai !== "moi_tao") {
      return res.status(400).json({ thongbao: "Đơn hàng không thể hủy (đã xử lý hoặc thanh toán)" });
    }

    order.trang_thai = "huy";
    await order.save();

    res.json({ message: "Hủy đơn hàng thành công", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật trạng thái đơn hàng sau thanh toán Stripe
router.get("/cap_nhat_trang_thai_don_hang/:id_dh/:session_id", async (req, res) => {
  try {
    const { id_dh, session_id } = req.params;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const ma_giao_dichh = session.payment_intent;

    const order = await OrderModel.findOne({ id: id_dh });
    if (!order) return res.status(404).json({ thongbao: "Không tìm thấy đơn hàng" });

    order.trang_thai = "da_thanh_toan";
    order.ma_giao_dich = ma_giao_dichh;
    await order.save();

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
