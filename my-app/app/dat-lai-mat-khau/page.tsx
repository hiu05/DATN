// app/dat-lai-mat-khau/page.tsx
import Home from "@/app/page";
import ResetPasswordModalClient from "./reset-modal-client";
import ScrollTo from "./ScrollTo";

export default function Page({
  searchParams,
}: { searchParams?: Record<string, string | string[] | undefined> }) {
  const t = Array.isArray(searchParams?.token) ? searchParams!.token![0] : searchParams?.token;
  const token = t ?? "";

  return (
    <>
      <Home />

      <ScrollTo id="xu-huong-2025" />
      <ResetPasswordModalClient token={token} />
    </>
  );
}
