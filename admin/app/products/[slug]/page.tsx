import ProductForm from "../EditProductForm";

export default async function EditBySlug({ params }: { params: { slug: string } }) {
  const detail = await fetch(`${process.env.APP_URL}/api/products/${params.slug}`, { cache: "no-store" }).then(r=>r.json());
  const brands = await fetch(`${process.env.APP_URL}/api/brands`, { cache: "no-store" }).then(r=>r.json());
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Sửa: {detail.name}</h1>
      <ProductForm
        initial={detail}
        brands={brands}
        submitTo={`/api/products/${params.slug}`}
        method="PUT"
        redirectTo="/products"
      />
    </div>
  );
}