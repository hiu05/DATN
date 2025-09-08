"use client";
import { useRouter } from "next/navigation";

export default function NutXoaSP({ id }: { id: number }) {
  const router = useRouter();
  const handleDelete = async () => {
    if (!confirm("Xóa sản phẩm này hả?")) return;
    const res = await fetch(`/api/san_pham/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh(); // Làm mới danh sách sản phẩm
    else alert("Xóa thất bại!");
  };
  return (
    <button onClick={handleDelete} className="text-red-500 hover:text-red-700 h-7 font-semibold transition text-sm mr-2">
      Xóa
    </button>
  );
}
