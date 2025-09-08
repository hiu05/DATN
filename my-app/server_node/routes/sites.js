/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const router = express.Router();
const DonHang = require("../models/DonHang");
const DonHangChiTiet = require("../models/DonHangChiTiet");
const SanPham = require("../models/SanPham");
const jwt = require("node-jsonwebtoken");

// API lưu đơn hàng và giỏ hàng
router.post('/api/luu_don_hang_va_gio_hang/', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token
    if (!token) return res.status(400).json({ status: 2, thongbao: "Không có token" });
    
    let decoded;
    try { 
       decoded = jwt.verify(token, "troi oi"); 
    } catch (err) {
      return res.status(400).json({ status: 2, thongbao: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const { id } = decoded;
    const { cart, user, paymentMethod } = req.body;
    if (!cart?.length) return res.status(400).json({ thongbao: "Giỏ hàng trống" });
    
    let dh =  {
        id_user: id,       
        ten_nguoi_nhan: user.ho_ten,
        dia_chi: user.dia_chi,
        email: user.email,
        dien_thoai: user.dien_thoai,
        trang_thai: "moi_tao", 
        thoi_diem_mua: new Date(),
        hinh_thuc_thanh_toan: paymentMethod
    };

    if (isNaN(dh.id_user))  return res.status(401).json({ "thongbao":"id_user chưa có", "id":"-1" });
    if (!dh.ten_nguoi_nhan) return res.status(401).json({ "thongbao":"ho_ten chưa có", "id":"-1" });
    if (!dh.dia_chi)  return res.status(401).json({ "thongbao":"dia_chi chưa có", "id":"-1" });
    if (!dh.email) return res.status(401).json({ "thongbao":"email chưa có", "id":"-1" });
    if (!dh.dien_thoai) return res.status(401).json({ "thongbao":"dien_thoai chưa có", "id":"-1" });

    try {
      const doc  = await DonHang.find({}).select("id").sort({"id" : -1}).limit(1).exec();
      const id_dh = doc.length > 0 ? doc[0].id + 1 : 1;
      dh.id = id_dh;

      await DonHang.create(dh);

      for (const item of cart) {
        const id_sp = Number(item.id);  
        const sp = await SanPham.findOne({ id: id_sp });
        if (!sp) return res.json({ 'thongbao': `SP có id=${id_sp} không tồn tại` });

        const docCT  = await DonHangChiTiet.find({}).select("id").sort({"id" : -1}).limit(1).exec();
        const id_ct = docCT.length > 0 ? docCT[0].id + 1 : 1;

        let dhct =  {
            id: id_ct, 
            id_dh: id_dh, 
            id_sp: sp.id,
            gia: sp.gia,
            sku: sp.sku,
            hinh: sp.hinh, 
            so_luong: Number(item.so_luong || 1)
        };
        await DonHangChiTiet.create(dhct);
      }

      res.json({ "thongbao": "Đã tạo đơn hàng", id_dh });
    } catch (error) {
      console.log("Lỗi lưu đơn hàng:", error);
      res.status(500).json({ thongbao: "Lỗi lưu đơn hàng", error });
    }
});

module.exports = router;
