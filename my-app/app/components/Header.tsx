"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const FALLBACKS = ["/images/banner1.jpg", "/images/banner2.webp", "/images/banner3.webp"];

const withBase = (u: string) => {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")) return u;
  const base = (process.env.NEXT_PUBLIC_IMAGE_BASE || "").replace(/\/+$/, "");
  return base ? `${base}/${u.replace(/^\/+/, "")}` : `/${u.replace(/^\/+/, "")}`;
};

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/"; // ✅ chỉ hiện ở trang chủ

  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  // Nếu không ở trang chủ → không fetch, không render
  useEffect(() => {
    if (!isHome) return;
    let mounted = true;
    fetch("/api/banners", { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (!mounted) return;
        const arr = Array.isArray(j?.images) && j.images.length > 0 ? j.images : FALLBACKS;
        setImages(arr);
        setIndex(0);
      })
      .catch(() => setImages(FALLBACKS));
    return () => { mounted = false; };
  }, [isHome]);

  useEffect(() => {
    if (!isHome || images.length === 0) return;
    const t = setInterval(() => setIndex(i => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [isHome, images]);

  if (!isHome || images.length === 0) return null;

  return (
    <div className="relative w-full h-[520px] overflow-hidden shadow-md rounded-b-xl">
      <img
        src={withBase(images[index])}
        alt="Banner"
        className="w-full h-full object-cover transition-all duration-1000"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACKS[0]; }}
      />
      <button
        aria-label="Prev"
        onClick={() => setIndex(i => (i - 1 + images.length) % images.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full grid place-items-center hover:bg-black/60"
      >‹</button>
      <button
        aria-label="Next"
        onClick={() => setIndex(i => (i + 1) % images.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full grid place-items-center hover:bg-black/60"
      >›</button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full cursor-pointer ${i === index ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
