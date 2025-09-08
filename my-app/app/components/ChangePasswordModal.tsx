"use client";

import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [currentPassword, setCur] = useState("");
  const [newPassword, setPw1] = useState("");
  const [confirmPassword, setPw2] = useState("");

  const [showCur, setShowCur] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const u = localStorage.getItem("user");
      const parsed = u ? JSON.parse(u) : null;
      setEmail(parsed?.email || "");
    } catch {}
    setCur(""); setPw1(""); setPw2("");
    setMsg(""); setOk(null);
  }, [open]);

  const validate = () => {
    if (!email) return "Bạn cần đăng nhập lại.";
    if (!currentPassword) return "Nhập mật khẩu hiện tại.";
    if (!newPassword || newPassword.length < 6)
      return "Mật khẩu mới phải từ 6 ký tự trở lên.";
    if (newPassword !== confirmPassword)
      return "Nhập lại mật khẩu không khớp.";
    if (newPassword === currentPassword)
      return "Mật khẩu mới phải khác mật khẩu hiện tại.";
    return "";
  };

  const submit = async () => {
    const err = validate();
    if (err) { setMsg(err); setOk(false); return; }

    try {
      setLoading(true);
      setMsg(""); setOk(null);

      const res = await fetch("/api/doi-mat-khau-tai-khoan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(String(data?.message || "Đổi mật khẩu thất bại."));
        setOk(false);
        return;
      }

      setOk(true);
      setMsg("Đổi mật khẩu thành công!");
      setTimeout(onClose, 800);
    } catch {
      setOk(false);
      setMsg("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal open={open} onClose={onClose} title="Đổi mật khẩu">
      <div className="space-y-3">
        <div className="relative">
          <input
            type={showCur ? "text" : "password"}
            placeholder="Mật khẩu hiện tại"
            className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            value={currentPassword}
            onChange={(e) => setCur(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShowCur((v) => !v)}
          >
            {showCur ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <input
            type={show1 ? "text" : "password"}
            placeholder="Mật khẩu mới"
            className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            value={newPassword}
            onChange={(e) => setPw1(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShow1((v) => !v)}
          >
            {show1 ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <input
            type={show2 ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            value={confirmPassword}
            onChange={(e) => setPw2(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            onClick={() => setShow2((v) => !v)}
          >
            {show2 ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {msg && (
          <p className={`text-sm ${ok ? "text-green-600" : "text-red-600"}`}>{msg}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 h-11 rounded bg-[#e23c31] text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Cập nhật mật khẩu"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded border hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </AuthModal>
  );
}
