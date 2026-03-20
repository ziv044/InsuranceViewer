import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/app/mock/data");

export async function GET() {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".DAT"));
    const result = files.map((name) => ({
      name,
      content: fs.readFileSync(path.join(DATA_DIR, name), "utf-8"),
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
