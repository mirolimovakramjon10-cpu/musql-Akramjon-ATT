import mysql from "mysql2/promise";

export default async (req) => {
  let db;
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 4000),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: false,
      },
    });

    if (req.method === "POST") {
      const { name } = await req.json();
      const clean = String(name ?? "").trim().slice(0, 100);
      if (clean) {
        await db.execute("INSERT INTO notes (name) VALUES (?)", [clean]);
      }
    }

    const [rows] = await db.execute(
      "SELECT name, created_at FROM notes ORDER BY id DESC LIMIT 50"
    );
    return Response.json(rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    return Response.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  } finally {
    if (db) await db.end();
  }
};
