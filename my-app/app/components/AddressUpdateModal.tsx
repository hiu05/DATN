/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";

export default function AddressUpdateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    try {
      const u = localStorage.getItem("user");
      const parsed = u ? JSON.parse(u) : null;
      setUser(parsed);
      setAddress(parsed?.address || "");
      setPhone(parsed?.phone || parsed?.dien_thoai || "");
    } catch {
      setUser(null);
    }
  }, [open]);

  const submit = async () => {
    if (!user?.email) {
      setMsg("Bạn cần đăng nhập lại.");
      return;
    }
    if (!address.trim()) {
      setMsg("Vui lòng nhập địa chỉ.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/cap-nhat-dia-chi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, address, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.message || "Cập nhật thất bại.");
      } else {
        const updated = { ...user, address, phone };
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("user-changed"));
        setMsg("Đã cập nhật địa chỉ.");
        setTimeout(onClose, 600);
      }
    } catch {
      setMsg("Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthModal open={open} onClose={onClose} title="Cập nhật địa chỉ">
      {!user ? (
        <p className="text-red-600">Vui lòng đăng nhập để cập nhật địa chỉ.</p>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại (tuỳ chọn)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 rounded border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="VD: 0987 654 321"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={3}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành…"
            />
          </div>

          {msg && (
            <p className={`text-sm ${msg.startsWith("Đã") ? "text-green-600" : "text-red-600"}`}>
              {msg}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button onClick={onClose} className="flex-1 py-2 rounded border hover:bg-gray-50">
              Đóng
            </button>
          </div>
        </div>
      )}
    </AuthModal>
  );
}
