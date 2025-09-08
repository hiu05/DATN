import { ISanPham } from "../components/cautrucdata";
import Show1SP from "../components/Show1SP";
//app/tim-kiem/page.tsx
export default async function SearchPage(
  { 
    searchParams,
  }: 
  {
    searchParams: { [key: string]: string | undefined };
  }
) {
// lấy dữ liệu
let tu_khoa = searchParams.tu_khoa; 
let page = Number(searchParams.page) || 1 ;
let resSP = await fetch(`http://localhost:3000/api/timkiem/${tu_khoa}`);
let kq_sp = await resSP.json();
let sp_arr:ISanPham[] = kq_sp as ISanPham[];

return (
  <div className="timkiem">
    <h2 className="bg-emerald-50 p-2 my-2 text-[1.2em] uppercase"> 
  Kết quả tìm kiếm theo từ khóa {tu_khoa}
</h2>
<div className="grid grid-cols-3 gap-4">
  {sp_arr.map( (sp:ISanPham) => <Show1SP key={sp.id} sp={sp} /> )}
</div>

  </div>
)}
