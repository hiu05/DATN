"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
};

export default function DangKyForm({ onSuccess, onSwitchToLogin }: Props) {
  const [ho_ten, setHT] = useState("");
  const [email, setEmail] = useState("");
  const [mat_khau, setPass1] = useState("");
  const [mat_khau2, setPass2] = useState("");
  const [sdt, setSdt] = useState("");
  const [tb, setTB] = useState("");

  const [errName, setErrName] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPass1, setErrPass1] = useState("");
  const [errPass2, setErrPass2] = useState("");
  const [errSdt, setErrSdt] = useState("");

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const vName = (v: string) => {
    if (!v) return "Họ tên không được để trống";
    if (/\d/.test(v)) return "Họ tên không được chứa số";
    return "";
  };
  const vEmail = (v: string) => {
    if (!v) return "Email không được để trống";
    if (!/^\S+@\S+\.\S+$/.test(v)) return "Email không hợp lệ";
    return "";
  };
  const vPass1 = (v: string) => {
    if (!v) return "Mật khẩu không được để trống";
    if (v.length < 6) return "Mật khẩu phải ít nhất 6 ký tự";
    return "";
  };
  const vPass2 = (v: string, p1: string) => {
    if (!v) return "Vui lòng nhập lại mật khẩu";
    if (v !== p1) return "Mật khẩu nhập lại không khớp";
    return "";
  };
  const vPhone = (v: string) => {
    if (!v) return "Số điện thoại không được để trống";
    if (!/^\d{9,11}$/.test(v)) return "Số điện thoại không hợp lệ (9–11 số)";
    return "";
  };

  const handleDangKy = async () => {
    setTB("");

    const eName = vName(ho_ten);
    const eEmail = vEmail(email);
    const eP1 = vPass1(mat_khau);
    const eP2 = vPass2(mat_khau2, mat_khau);
    const eSdt = vPhone(sdt);

    setErrName(eName);
    setErrEmail(eEmail);
    setErrPass1(eP1);
    setErrPass2(eP2);
    setErrSdt(eSdt);

    if (eName || eEmail || eP1 || eP2 || eSdt) {
      setTB("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      const res = await fetch("/api/dang-ky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ho_ten, email, mat_khau, sdt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setTB(String(data?.message || "Đăng ký thất bại"));
        return;
      }

      setTB("Đăng ký thành công! Kiểm tra mail để xác thực.");
      setHT("");
      setEmail("");
      setPass1("");
      setPass2("");
      setSdt("");

      try {
        sessionStorage.setItem("prefill_login_email", data?.email || email);
      } catch {}

      onSuccess?.();
      setTimeout(() => onSwitchToLogin?.(), 0);
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      setTB("Lỗi kết nối máy chủ");
    }
  };

  return (
    <>
      <div className="relative mb-4">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">
          *
        </span>
        <input
          type="text"
          placeholder="Họ và tên"
          value={ho_ten}
          onChange={(e) => {
            setHT(e.target.value);
            setErrName(vName(e.target.value));
          }}
          className="w-full h-11 rounded border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        {errName && <p className="text-red-500 text-xs mt-1">{errName}</p>}
      </div>

      <div className="relative mb-4">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">
          *
        </span>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrEmail(vEmail(e.target.value));
          }}
          className="w-full h-11 rounded border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        {errEmail && <p className="text-red-500 text-xs mt-1">{errEmail}</p>}
      </div>

      <div className="relative mb-4">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">
          *
        </span>
        <input
          type={showPass1 ? "text" : "password"}
          placeholder="Mật khẩu"
          value={mat_khau}
          onChange={(e) => {
            setPass1(e.target.value);
            setErrPass1(vPass1(e.target.value));
          }}
          className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <button
          type="button"
          onClick={() => setShowPass1(!showPass1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPass1 ? <FaEyeSlash /> : <FaEye />}
        </button>
        {errPass1 && <p className="text-red-500 text-xs mt-1">{errPass1}</p>}
      </div>

      <div className="relative mb-4">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">
          *
        </span>
        <input
          type={showPass2 ? "text" : "password"}
          placeholder="Nhập lại mật khẩu"
          value={mat_khau2}
          onChange={(e) => {
            setPass2(e.target.value);
            setErrPass2(vPass2(e.target.value, mat_khau));
          }}
          className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <button
          type="button"
          onClick={() => setShowPass2(!showPass2)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPass2 ? <FaEyeSlash /> : <FaEye />}
        </button>
        {errPass2 && <p className="text-red-500 text-xs mt-1">{errPass2}</p>}
      </div>

      <div className="relative mb-2">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">
          *
        </span>
        <input
          type="text"
          placeholder="Số điện thoại"
          value={sdt}
          onChange={(e) => {
            setSdt(e.target.value);
            setErrSdt(vPhone(e.target.value));
          }}
          className="w-full h-11 rounded border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        {errSdt && <p className="text-red-500 text-xs mt-1">{errSdt}</p>}
      </div>

      {tb && <p className="mb-3 text-sm text-red-600">{tb}</p>}

      <button
        onClick={handleDangKy}
        className="mt-2 w-full h-11 rounded bg-[#e23c31] text-white font-semibold hover:opacity-90 transition"
      >
        Đăng ký
      </button>
      <div className="flex justify-end items-center mb-3 text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="mt-1 text-blue-600 hover:underline"
        >
          Đã có tài khoản? Đăng nhập
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-gray-500">
        Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
      </p>
    </>
  );
}
