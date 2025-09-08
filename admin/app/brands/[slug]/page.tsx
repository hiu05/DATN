import { IBrand } from "@/app/lib/cautrucdata";
import BrandForm from "./brandform";

export default async function BrandDetail({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const data = await fetch(`${process.env.APP_URL}/api/brands/${slug}`);
    const brand: IBrand = await data.json();

    if (!brand) return <p className="text-red-500">Hãng không tồn tại</p>;

    return <BrandForm brand={brand} />;
}
