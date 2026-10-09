// Minimal, dependency-light XLSX writer (Office Open XML) with a bold frozen header row,
// auto-filter and Indian-style number formats. Strings are written inline.
import { zipSync, strToU8 } from "fflate";

export interface Sheet { name: string; columns: string[]; rows: unknown[][] }

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string))
   // strip characters that are illegal in XML 1.0
   .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "");

function colName(i: number): string {
  let s = "";
  for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
}

const ISO_TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
function ist(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const t = new Date(d.getTime() + 5.5 * 3600 * 1000);
  return t.toISOString().replace("T", " ").slice(0, 19);
}

function cell(ref: string, v: unknown, header: boolean): string {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "boolean") return `<c r="${ref}" t="b"${header ? ' s="1"' : ""}><v>${v ? 1 : 0}</v></c>`;
  if (typeof v === "number" && isFinite(v)) {
    const style = header ? 1 : Number.isInteger(v) ? 3 : 2;
    return `<c r="${ref}" s="${style}"><v>${v}</v></c>`;
  }
  let s = typeof v === "string" ? v : JSON.stringify(v);
  if (!header && ISO_TS.test(s)) s = ist(s);
  if (s.length > 32000) s = s.slice(0, 32000) + "…";
  return `<c r="${ref}" t="inlineStr"${header ? ' s="1"' : ""}><is><t xml:space="preserve">${esc(s)}</t></is></c>`;
}

function sheetXml(sheet: Sheet): string {
  const widths = sheet.columns.map((c) => Math.min(60, Math.max(10, c.length + 2)));
  for (const row of sheet.rows.slice(0, 200)) {
    row.forEach((v, i) => {
      const len = v === null || v === undefined ? 0 : String(v).length;
      if (i < widths.length) widths[i] = Math.min(60, Math.max(widths[i], len + 2));
    });
  }
  const cols = widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("");
  const parts: string[] = [];
  parts.push(`<row r="1">${sheet.columns.map((c, i) => cell(colName(i) + "1", c, true)).join("")}</row>`);
  sheet.rows.forEach((row, r) => {
    const n = r + 2;
    parts.push(`<row r="${n}">${row.map((v, i) => cell(colName(i) + n, v, false)).join("")}</row>`);
  });
  const lastCol = colName(Math.max(0, sheet.columns.length - 1));
  const lastRow = Math.max(1, sheet.rows.length + 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/><cols>${cols}</cols><sheetData>${parts.join("")}</sheetData>
${sheet.rows.length ? `<autoFilter ref="A1:${lastCol}${lastRow}"/>` : ""}
</worksheet>`;
}

function safeName(name: string, used: Set<string>): string {
  let n = name.replace(/[\[\]:*?\/\\]/g, " ").slice(0, 31).trim() || "Sheet";
  let k = 2;
  while (used.has(n.toLowerCase())) n = n.slice(0, 28) + " " + k++;
  used.add(n.toLowerCase());
  return n;
}

export function buildXlsx(sheets: Sheet[], title = "JSE Report"): Uint8Array {
  const used = new Set<string>();
  const names = sheets.map((s) => safeName(s.name, used));
  const files: Record<string, Uint8Array> = {};
  files["[Content_Types].xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("\n")}
</Types>`);
  files["_rels/.rels"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`);
  files["docProps/core.xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${esc(title)}</dc:title><dc:creator>JAIN STOCK EXCHANGE</dc:creator>
<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created>
</cp:coreProperties>`);
  files["xl/workbook.xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${names.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>
</workbook>`);
  files["xl/_rels/workbook.xml.rels"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("\n")}
<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);
  files["xl/styles.xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="#,##,##0.00"/><numFmt numFmtId="165" formatCode="#,##,##0"/></numFmts>
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF172B4D"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`);
  sheets.forEach((s, i) => { files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(s)); });
  return zipSync(files, { level: 6 });
}

export function toCsv(columns: string[], rows: unknown[][]): string {
  const q = (v: unknown) => {
    if (v === null || v === undefined) return "";
    let s = typeof v === "string" ? v : typeof v === "object" ? JSON.stringify(v) : String(v);
    if (typeof v === "string" && ISO_TS.test(s)) s = ist(s);
    if (/^[=+\-@]/.test(s) && typeof v === "string") s = "'" + s; // spreadsheet formula injection guard
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return "﻿" + [columns.map(q).join(","), ...rows.map((r) => r.map(q).join(","))].join("\r\n") + "\r\n";
}
