// /lib/vnpay.ts
import crypto from "crypto";

export function sortObj(obj: Record<string, any>) {
  const sorted: Record<string, any> = {};
  Object.keys(obj).sort().forEach((k) => (sorted[k] = obj[k]));
  return sorted;
}

export function hmacSHA512(secret: string, data: string) {
  return crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

export function formatDateYYYYMMDDHHmmss(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}
