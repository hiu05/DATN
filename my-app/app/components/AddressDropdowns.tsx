/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo, useState } from "react";

type Province = { code: number; name: string };
type District = { code: number; name: string };
type Ward = { code: number; name: string };

export type AddressType = {
  province: string;
  district: string;
  ward: string;
};

export default function AddressDropdowns({
  onChange,
  className = "",
  initial,
}: {
  onChange: (value: AddressType) => void;
  className?: string;
  initial?: Partial<AddressType>; // optional: giá trị khởi tạo
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  const [loadingP, setLoadingP] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingW, setLoadingW] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoadingP(true);
        setErr("");
        const res = await fetch("https://provinces.open-api.vn/api/?depth=1", {
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Không tải được danh sách Tỉnh/TP");
        const data: Province[] = await res.json();
        setProvinces(data);

        if (initial?.province) {
          const p = data.find(
            (x) => x.name.toLowerCase() === initial.province!.toLowerCase()
          );
          if (p) setSelectedProvince(String(p.code));
        }
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Lỗi tải Tỉnh/TP");
      } finally {
        setLoadingP(false);
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    if (!selectedProvince) return;

    const ac = new AbortController();
    (async () => {
      try {
        setLoadingD(true);
        setErr("");
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error("Không tải được Quận/Huyện");
        const data = await res.json();
        const dists: District[] = data.districts || [];
        setDistricts(dists);

        if (initial?.district) {
          const d = dists.find(
            (x) => x.name.toLowerCase() === initial.district!.toLowerCase()
          );
          if (d) setSelectedDistrict(String(d.code));
        }
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Lỗi tải Quận/Huyện");
      } finally {
        setLoadingD(false);
      }
    })();
    return () => ac.abort();
  }, [selectedProvince]);

  useEffect(() => {
    setSelectedWard("");
    setWards([]);

    if (!selectedDistrict) return;

    const ac = new AbortController();
    (async () => {
      try {
        setLoadingW(true);
        setErr("");
        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`,
          { signal: ac.signal }
        );
        if (!res.ok) throw new Error("Không tải được Phường/Xã");
        const data = await res.json();
        const ws: Ward[] = data.wards || [];
        setWards(ws);

        if (initial?.ward) {
          const w = ws.find(
            (x) => x.name.toLowerCase() === initial.ward!.toLowerCase()
          );
          if (w) setSelectedWard(String(w.code));
        }
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e.message || "Lỗi tải Phường/Xã");
      } finally {
        setLoadingW(false);
      }
    })();
    return () => ac.abort();
  }, [selectedDistrict]);

  const value = useMemo(() => {
    const p = provinces.find((x) => String(x.code) === selectedProvince)?.name || "";
    const d = districts.find((x) => String(x.code) === selectedDistrict)?.name || "";
    const w = wards.find((x) => String(x.code) === selectedWard)?.name || "";
    return { province: p, district: d, ward: w };
  }, [provinces, districts, wards, selectedProvince, selectedDistrict, selectedWard]);

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      <div>
        <select
          className="w-full p-2 border rounded"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          disabled={loadingP}
        >
          <option value="">{loadingP ? "Đang tải..." : "Chọn Tỉnh/TP"}</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          className="w-full p-2 border rounded"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          disabled={!selectedProvince || loadingD}
        >
          <option value="">
            {!selectedProvince ? "Chọn Tỉnh trước" : loadingD ? "Đang tải..." : "Chọn Quận/Huyện"}
          </option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          className="w-full p-2 border rounded"
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          disabled={!selectedDistrict || loadingW}
        >
          <option value="">
            {!selectedDistrict ? "Chọn Quận trước" : loadingW ? "Đang tải..." : "Chọn Phường/Xã"}
          </option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {err && <p className="sm:col-span-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}
