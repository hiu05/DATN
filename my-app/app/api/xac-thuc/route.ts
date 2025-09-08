/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const successUrl = `${appUrl}?success=email_verified`;
  const missingUrl = `${appUrl}?error=missing_token`;
  const invalidUrl = `${appUrl}?error=invalid_token`;
  const serverErrUrl = `${appUrl}?error=server_error`;

  if (!token) {
    return NextResponse.redirect(missingUrl);
  }

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );
    const email = decoded.email as string;

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "newtime_watch", 
    });

    const [colRows]: any = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'email_verified_at'"
    );

    if (Array.isArray(colRows) && colRows.length > 0) {
      const colType: string = colRows[0].Type?.toLowerCase() || "";

      const isDateTime =
        colType.includes("datetime") || colType.includes("timestamp");

      const sql = isDateTime
        ? "UPDATE users SET email_verified_at = NOW() WHERE email = ?"
        : "UPDATE users SET email_verified_at = 1 WHERE email = ?";

      await connection.execute(sql, [email]);
    } else {
    }

    await connection.end();

    return NextResponse.redirect(successUrl);
  } catch (err) {
    console.error("Email verify error:", err);
    return NextResponse.redirect(invalidUrl);
  }
}
