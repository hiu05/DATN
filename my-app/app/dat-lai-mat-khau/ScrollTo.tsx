"use client";
import { useEffect } from "react";

export default function ScrollTo({ id }: { id: string }) {
  useEffect(() => {
    const tick = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(tick);
  }, [id]);

  return null;
}
