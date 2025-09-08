"use client";
import { useRouter } from "next/navigation";
export default function NutXoaLoai( { slug }: { slug: string } ) {
 const router = useRouter();
 const handleDelete = async () => {
  if (!confirm("Bạn có chắc muốn xóa loại này?")) return;
  const res = await fetch(`/api/brands/${slug}`, { method: "DELETE", });
  if (res.ok) router.refresh(); // Làm mới danh sách loại
  else alert("Xóa hãng thất bại!");
 };
 return (
<button
    onClick={handleDelete}
    className="text-red-500 mx-2 hover:cursor-pointer"
>
    Xóa
</button>
 );
}