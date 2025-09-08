"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthModal from "@/app/components/AuthModal";

export default function ResetPasswordModalClient({ token }: { token: string }) {
  const router = useRouter();

  const [open, setOpen] = useState(true);
  const [mk, setMk] = useState("");
  const [mk2, setMk2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err1, setErr1] = useState("");
  const [err2, setErr2] = useState("");
  const [tb, setTB] = useState("");

  useEffect(() => {
    if (!token) {
      setTB("Liên kết không hợp lệ hoặc đã hết hạn.");
    }
  }, [token]);

  const validate = () => {
    let ok = true;
    if (!mk || mk.length < 6) {
      setErr1("Mật khẩu phải từ 6 ký tự trở lên");
      ok = false;
    } else setErr1("");

    if (mk !== mk2) {
      setErr2("Mật khẩu nhập lại không khớp");
      ok = false;
    } else setErr2("");

    return ok;
  };

  const handleReset = async () => {
    if (!token || !validate()) return;

    try {
      const res = await fetch("/api/dat-lai-mat-khau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: mk }),
      });
      const data = await res.json();

      if (!res.ok) {
        setTB(data?.message || "Có lỗi xảy ra.");
        return;
      }

      setTB("Cập nhật mật khẩu thành công! Đang chuyển về đăng nhập…");
      localStorage.setItem("openLoginAfterReset", "1");
      setTimeout(() => {
        setOpen(false);
        router.replace("/"); 
      }, 1000);
    } catch {
      setTB("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <AuthModal open={open} onClose={() => router.replace("/")} title="Đặt lại mật khẩu">
      <div className="relative mb-4">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">*</span>
        <input
          type={show1 ? "text" : "password"}
          placeholder="Mật khẩu mới"
          value={mk}
          onChange={(e) => setMk(e.target.value)}
          className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={() => setShow1(!show1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {show1 ? <FaEyeSlash /> : <FaEye />}
        </button>
        {err1 && <p className="mt-1 text-sm text-red-600">{err1}</p>}
      </div>

      <div className="relative mb-2">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">*</span>
        <input
          type={show2 ? "text" : "password"}
          placeholder="Nhập lại mật khẩu"
          value={mk2}
          onChange={(e) => setMk2(e.target.value)}
          className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 placeholder-gray-400"
        />
        <button
          type="button"
          onClick={() => setShow2(!show2)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {show2 ? <FaEyeSlash /> : <FaEye />}
        </button>
        {err2 && <p className="mt-1 text-sm text-red-600">{err2}</p>}
      </div>

      {tb && <p className="mb-3 text-sm text-green-600">{tb}</p>}

      <button
        onClick={handleReset}
        className="w-full h-11 rounded bg-[#e23c31] text-white font-semibold hover:opacity-90 transition"
      >
        Cập nhật mật khẩu
      </button>

      <button
        type="button"
        onClick={() => router.replace("/")}
        className="text-black mt-3 w-full h-11 rounded border border-gray-300  hover:bg-gray-100 transition"
      >
        Quay lại đăng nhập
      </button>

      <p className="mt-6 text-center text-xs text-gray-500">
        Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
      </p>
    </AuthModal>
  );
}
