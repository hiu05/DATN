export function vnpLog(tag: string, data: any) {
  if (process.env.DEBUG_VNPAY !== "1") return;
  try {
    console.log(`[VNPay][${tag}]`, typeof data === "string" ? data : JSON.stringify(data, null, 2));
  } catch {
    console.log(`[VNPay][${tag}]`, data);
  }
}
