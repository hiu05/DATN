'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

export default function BrandSlider() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState('');
  const router = useRouter(); // ✅ Thêm

  useEffect(() => {
    fetch('http://localhost:3000/api/brands')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBrands(data);
        else setError('Dữ liệu thương hiệu không hợp lệ');
      })
      .catch(() => setError('Không thể tải danh sách thương hiệu'));
  }, []);

  const handleClick = (brandId: number) => {
    router.push(`/san-pham?brand=${brandId}`);
  };

  return (
    <div className="my-10">
      <h2 className="text-xl font-bold mb-4 uppercase text-gray-800">
        🏷 Thương hiệu nổi bật
      </h2>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleClick(brand.id)} // ✅ Sử dụng router.push
            className="border rounded-lg p-3 flex justify-center items-center hover:shadow-md bg-white cursor-pointer"
          >
            <img
              src={brand.logo || '/no-brand.png'}
              alt={brand.name}
              className="h-10 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
