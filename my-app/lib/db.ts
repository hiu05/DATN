import "server-only";
import mysql from "mysql2/promise";

const g = globalThis as unknown as { __dbPool?: mysql.Pool };

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "newtime_watch",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
  });
}

export function getPool() {
  if (!g.__dbPool) g.__dbPool = createPool();
  return g.__dbPool;
}
export const pool = getPool();
