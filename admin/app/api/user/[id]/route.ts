import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserModel } from "@/app/lib/models";
import { IUser } from "@/app/lib/cautrucdata";

// PUT /api/users/:id
export async function PUT(req: Request, ctx: { params: Promise <{ id: string }> }) {
  const { id } = await ctx.params; 
  const body = await req.json().catch(() => ({}));
  // 1) Kiểm tra tồn tại
  const existed = await UserModel.findByPk(id);
  if (!existed) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  // 2) Chuẩn bị dữ liệu cập nhật chỉ khi field được gửi
  const data: Partial<IUser & { password_hash?: string }> = {};

  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.email === "string") data.email = body.email;
  if (typeof body.phone === "string") data.phone = body.phone;
  if (typeof body.address === "string") data.address = body.address;

  // status: chỉ set khi client gửi (true/false hoặc 1/0)
  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    data.status = body.status ? 1 : 0;
  }

  // role: chỉ set khi client gửi
  if (Object.prototype.hasOwnProperty.call(body, "role")) {
    data.role = body.role;
  }

  // password: nếu có thì hash
  if (body.password) {
    const salt = await bcrypt.genSalt(10);
    data.password_hash = await bcrypt.hash(body.password, salt);
  }

  // 3) Nếu không có field nào để cập nhật, trả bản ghi hiện tại (200)
  if (Object.keys(data).length === 0) {
    const fresh = await UserModel.findByPk(id, {
      attributes: { exclude: ["password_hash", "remember_token"] },
    });
    return NextResponse.json(fresh);
  }

  // 4) Cập nhật 
  await UserModel.update(data, { where: { id } });

  // 5) Trả dữ liệu mới
  const fresh = await UserModel.findByPk(id, {
    attributes: { exclude: ["password_hash", "remember_token"] },
  });
  return NextResponse.json(fresh);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // 1) Kiểm tra tồn tại
  const existed = await UserModel.findByPk(id);
  if (!existed) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  // 2) Xoá người dùng
  await UserModel.destroy({ where: { id } });

  // 3) Trả kết quả thành công
  return NextResponse.json({ message: "Xoá thành công" });
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // 1) Kiểm tra tồn tại
  const row = await UserModel.findByPk(id, {
    attributes: { exclude: ["password_hash", "remember_token"] },
  });
  if (!row) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  // 2) Trả dữ liệu người dùng
  return NextResponse.json(row);
}
