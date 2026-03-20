import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { HAR_HABITUACH_CONFIG } from "@/lib/har-habituach-config";
import type { HarHabituachRecord } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "src/app/mock/data");

export async function GET() {
  try {
    const xlsxFiles = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".xlsx"));
    if (xlsxFiles.length === 0) {
      return NextResponse.json({ records: [], columns: [] });
    }

    const { headerRow, sectionIndicatorColumn, sectionNameColumn, sectionFieldName } = HAR_HABITUACH_CONFIG;

    const filePath = path.join(DATA_DIR, xlsxFiles[0]);
    const data = fs.readFileSync(filePath);
    const workbook = XLSX.read(data, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    let maxRow = 0;
    let maxCol = 0;
    for (const key of Object.keys(worksheet)) {
      if (key.startsWith("!")) continue;
      const { r, c } = XLSX.utils.decode_cell(key);
      if (r > maxRow) maxRow = r;
      if (c > maxCol) maxCol = c;
    }

    const headers: string[] = [];
    for (let c = 0; c <= maxCol; c++) {
      const addr = XLSX.utils.encode_cell({ r: headerRow, c });
      const cell = worksheet[addr];
      headers.push(cell ? String(cell.v).trim() : `col_${c}`);
    }

    const records: HarHabituachRecord[] = [];
    let currentSection = "";

    for (let r = headerRow + 1; r <= maxRow; r++) {
      const indicatorAddr = XLSX.utils.encode_cell({ r, c: sectionIndicatorColumn });
      const indicatorCell = worksheet[indicatorAddr];
      const indicatorVal = indicatorCell ? String(indicatorCell.v).trim() : "";

      if (!indicatorVal) {
        const nameAddr = XLSX.utils.encode_cell({ r, c: sectionNameColumn });
        const nameCell = worksheet[nameAddr];
        if (nameCell) currentSection = String(nameCell.v).trim();
        continue;
      }

      const record: HarHabituachRecord = { [sectionFieldName]: currentSection };
      for (let c = 0; c <= maxCol; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[addr];
        record[headers[c]] = cell ? (cell.v as string | number) : null;
      }
      records.push(record);
    }

    return NextResponse.json({ records, columns: [sectionFieldName, ...headers] });
  } catch {
    return NextResponse.json({ records: [], columns: [] }, { status: 200 });
  }
}
