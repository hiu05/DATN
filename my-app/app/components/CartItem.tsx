import { ICart } from "./cautrucdata";

export default function CartItem({ sp }: { sp: ICart }) {
  return (
    <div className="flex gap-4 items-center border-b py-4">
      <img src={sp.hinh} alt={sp.ten_sp} className="w-[100px] h-[100px] object-cover rounded" />
      <div className="flex-1">
        <div className="font-semibold">{sp.ten_sp}</div>
        <div>Số lượng: {sp.so_luong}</div>
        <div>Đơn giá: {sp.gia_mua.toLocaleString("vi-VN")} ₫</div>
        <div>Thành tiền: {(sp.gia_mua * sp.so_luong).toLocaleString("vi-VN")} ₫</div>
      </div>
    </div>
  );
}
