import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[]; // ✅ Lấy nhiều file

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "Không có file" }, { status: 400 });
  }

  const uploadedPaths: string[] = [];

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(process.cwd(), "public/upload", fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    uploadedPaths.push(`/upload/${fileName}`);
  }

  return NextResponse.json({ filePaths: uploadedPaths }); // ✅ Trả về mảng link
}
