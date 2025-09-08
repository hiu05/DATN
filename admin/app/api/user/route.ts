import { NextResponse } from "next/server";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { UserModel } from "@/app/lib/models";
import { log } from "console";

// GET /api/users?limit=&offset=&q=&role=&status=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit  = Number(searchParams.get("limit"))  || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  const q      = (searchParams.get("q") || "").trim();
  const role   = (searchParams.get("role") || "").trim();
  const status = searchParams.get("status");

  const where: any = {};
  if (q) {
    where[Op.or] = [
      { full_name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
      { phone: { [Op.like]: `%${q}%` } },
    ];
  }
  if (role) where.role = role;
  if (status !== null) where.status = Number(status);

  const rows = await UserModel.findAll({
    where,
    order: [["id", "desc"]],
    limit,
    offset,
    attributes: { exclude: ["password_hash", "remember_token"] },
  });

  return NextResponse.json(rows);
}

// POST /api/users  (JSON body)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  console.log("POST /api/users body:", body);
  // 1) Kiểm tra dữ liệu bắt buộc
  if (!body.full_name || !body.email || !body.password) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  // 2) Kiểm tra email đã tồn tại chưa
  const existing = await UserModel.findOne({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 });
  }

  // 3) Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(body.password, salt);
  

  // 4) Tạo người dùng mới
  const newUser = await UserModel.create({
    full_name: body.full_name,
    email: body.email,
    phone: body.phone,
    address: body.address,
    password_hash,
    role: body.role || "user",
    status: body.status ? 1 : 0,
  });

  // Trả dữ liệu mới
  return NextResponse.json(newUser, { status: 201 });
}
