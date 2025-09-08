/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import AuthModal from "./AuthModal";
import AddressUpdateModal from "./AddressUpdateModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function AccountInfoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const [openAddress, setOpenAddress] = useState(false);
  const [openChange, setOpenChange] = useState(false);

  const readUser = () => {
    try {
      const u = localStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (open) readUser();
  }, [open]);

  useEffect(() => {
    const onChanged = () => readUser();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") readUser();
    };
    window.addEventListener("user-changed", onChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("user-changed", onChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <>
      <AuthModal open={open} onClose={onClose} title="Thông tin tài khoản">
        {!user ? (
          <div className="text-red-600 font-medium">
            Vui lòng đăng nhập để xem thông tin tài khoản.
          </div>
        ) : (
          <div className="min-w-[280px]">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700 mr-3">
                {(user.full_name || user.name || user.email || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {user.full_name || user.name || "Người dùng"}
                </div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex items-center">
                <FaUser className="mr-2 text-purple-600" />
                <span>
                  <strong>Họ tên:</strong> {user.full_name || user.name || "—"}
                </span>
              </div>

              <div className="flex items-center">
                <FaEnvelope className="mr-2 text-blue-500" />
                <span>
                  <strong>Email:</strong> {user.email}
                </span>
              </div>

              <div className="flex items-center">
                <FaPhone className="mr-2 text-pink-500" />
                <span>
                  <strong>Số điện thoại:</strong>{" "}
                  {user.phone || user.dien_thoai || "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex items-start">
                <FaMapMarkerAlt className="mr-2 mt-1 text-red-500" />
                <span className="whitespace-pre-line">
                  <strong>Địa chỉ:</strong>{" "}
                  {user.address?.trim() ? user.address : "Chưa cập nhật"}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                className="flex-1 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600"
                onClick={() => setOpenAddress(true)}
              >
                Cập nhật địa chỉ
              </button>
              <button
                className="flex-1 py-2 rounded border hover:bg-gray-50"
                onClick={() => setOpenChange(true)}
              >
                Đổi mật khẩu
              </button>
            </div>
          </div>
        )}
      </AuthModal>

      <AddressUpdateModal open={openAddress} onClose={() => setOpenAddress(false)} />

      <ChangePasswordModal open={openChange} onClose={() => setOpenChange(false)} />
    </>
  );
}
