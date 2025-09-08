"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserInit = {
  id?: number;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: "user" | "admin";
  status?: 0 | 1;
};

export default function UserForm({
  initial = {},
  mode = "create", // "create" | "edit"
}: {
  initial?: UserInit;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [full_name, setFullName] = useState(initial.full_name || "");
  const [email, setEmail] = useState(initial.email || "");
  const [phone, setPhone] = useState(initial.phone || "");
  const [address, setAddress] = useState(initial.address || "");
  const [role, setRole] = useState<"user" | "admin">(initial.role ?? "user");
  const [status, setStatus] = useState<0 | 1>(initial.status ?? 1);
  const [password, setPassword] = useState(""); // chỉ dùng khi tạo mới / đổi mật khẩu
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Vui lòng nhập email");

    const body: any = { full_name, email, phone, address, role, status };
    if (password.trim()) body.password = password.trim();

    setSaving(true);
    const res = await fetch(mode === "edit"
        ? `/api/user/${initial.id}`
        : `/api/user`,
      {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setSaving(false);

    if (res.ok) {
      router.push("/users");
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Không thể lưu người dùng");
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow border p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">
          {mode === "edit" ? "Sửa người dùng" : "Thêm người dùng"}
        </h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => history.back()} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-5 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Họ tên">
          <input name="full_name" className="w-full border rounded px-3 py-2" value={full_name} onChange={(e)=>setFullName(e.target.value)} />
        </Field>
        <Field label="Email">
          <input name="email" className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </Field>
        <Field label="Phone">
          <input name="phone" className="w-full border rounded px-3 py-2" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        </Field>
        <Field label="Địa chỉ">
          <input name="address" className="w-full border rounded px-3 py-2" value={address} onChange={(e)=>setAddress(e.target.value)} />
        </Field>
        <Field label="Vai trò">
          <select name="role" className="w-full border rounded px-3 py-2" value={role} onChange={(e)=>setRole(e.target.value as "user"|"admin")}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </Field>
        <Field label="Trạng thái">
          <select name="status" className="w-full border rounded px-3 py-2" value={status} onChange={(e)=>setStatus(Number(e.target.value) as 0|1)}>
            <option value={1}>Hiện</option>
            <option value={0}>Ẩn</option>
          </select>
        </Field>

        {/* Mật khẩu: hiện khi tạo mới, hoặc cho phép đổi khi sửa */}
        <Field label={mode === "edit" ? "Đổi mật khẩu (để trống nếu không đổi)" : "Mật khẩu (tuỳ chọn)"}>
          <input name="password_hash" className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </Field>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
