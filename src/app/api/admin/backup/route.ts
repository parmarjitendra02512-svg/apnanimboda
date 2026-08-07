import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/firebase-server";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Centralized admin auth check
    const { error } = await verifyAuth(true);
    if (error) return error;

    const db = await getServerDb();
    const snapshot = await db.ref("/").get();

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const data = snapshot.val();

    // Remove sensitive data from backup
    if (data.approved_users) {
      Object.keys(data.approved_users).forEach((uid) => {
        delete data.approved_users[uid].passwordHash;
        delete data.approved_users[uid].password;
      });
    }

    const response = new NextResponse(JSON.stringify(data, null, 2));
    response.headers.set("Content-Type", "application/json");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=nimboda_backup_${Date.now()}.json`,
    );

    return response;
  } catch (error: any) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
