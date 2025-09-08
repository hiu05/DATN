"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function UploadImage({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (url: string) => void;
}) {
  const [image, setImage] = useState<string | null>(value ?? null);

  useEffect(() => { setImage(value ?? null); }, [value]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data?.filePath) {
      setImage(data.filePath);
      onChange(data.filePath); // ⬅️ đẩy lên parent
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="file" accept="image/*" onChange={handleUpload}
             className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {image && (
        <Image src={image} alt="Hình ảnh" width={200} height={200}
               className="object-cover rounded shadow border border-gray-200" />
      )}
    </div>
  );
}
