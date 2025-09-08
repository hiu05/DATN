import { notFound } from 'next/navigation';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

async function getData(slug: string): Promise<Post | null> {
  const res = await fetch(`http://localhost:3000/api/tin-tuc/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ChiTietTinTuc({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug);
  if (!data) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-10 px-5 text-gray-800">
      <h1 className="text-4xl font-bold mb-2 leading-tight">{data.title}</h1>

      <p className="text-sm text-gray-500 mb-6">
        {new Date(data.created_at).toLocaleDateString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
        })}
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.image_url || '/no-image-wide.png'}
        alt={data.title}
        className="rounded-lg w-full max-h-[500px] object-cover mb-8 shadow-md"
      />

      <div
        className="prose lg:prose-xl max-w-none prose-img:rounded-lg prose-img:shadow-md prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-ul:pl-6"
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
      />
    </div>
  );
}
