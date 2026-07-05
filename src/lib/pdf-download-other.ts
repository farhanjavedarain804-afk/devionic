/**
 * pdf-download-other.ts
 * Supporting PDF generators for salary slips, transaction receipts,
 * and verification slips. Re-exported from pdf-download.ts.
 */

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { format, isValid } from "date-fns";
import QRCode from "qrcode";

const BRAND = {
  dark:   [13,  27,  42]  as [number,number,number],
  accent: [0,  186, 199]  as [number,number,number],
  slate4: [148,163,184]   as [number,number,number],
  slate5: [100,116,139]   as [number,number,number],
  slate7: [51, 65,  85]   as [number,number,number],
  slate8: [30, 41,  59]   as [number,number,number],
  light:  [248,250,252]   as [number,number,number],
  white:  [255,255,255]   as [number,number,number],
};

let _fullLogoCache: string | null = null;
async function loadFullLogo(): Promise<string | null> {
  if (_fullLogoCache) return _fullLogoCache;
  try {
    const mod = await import("@/assets/devionic-logo-full.png");
    const logoUrl = mod.default || mod;
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = img.width; 
          c.height = img.height;
          const ctx = c.getContext("2d");
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          _fullLogoCache = c.toDataURL("image/png");
          resolve(_fullLogoCache);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = logoUrl;
    });
  } catch { return null; }
}

async function generateQR(url: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(url, { width: 120, margin: 1 });
  } catch { return null; }
}

// ── Salary Slip ──────────────────────────────────────────────────────────────

export interface SalarySlipPdfData {
  verificationId: string;
  month: string;
  year: number;
  empName: string;
  position: string;
  department: string;
  joinDate: string;
  cnic: string;
  bankAccount: string;
  staffType: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  notes?: string;
  status: string;
}

export const downloadSalarySlipPDF = async (data: SalarySlipPdfData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 14;
  const verifyUrl = `${window.location.origin}/verify?id=${data.verificationId}`;
  const docNum = `SAL-${data.month?.substring(0, 3).toUpperCase() || ""}${data.year}-${(data.verificationId || "").substring(0, 6)}`;

  // Header
  doc.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.rect(0, 0, W, 36, "F");

  try {
    const logo = await loadFullLogo();
    if (logo) doc.addImage(logo, "PNG", M, 5, 44, 12);
  } catch { /* skip */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); 
  doc.setTextColor(BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]);
  doc.text("SALARY SLIP", W - M, 9, { align: "right" });
  
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); 
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text("PAYSLIP", W - M, 17, { align: "right" });
  
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); 
  doc.setTextColor(BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]);
  doc.text(`${String(data.month || "").toUpperCase()} ${data.year}`, W - M, 23, { align: "right" });
  doc.text(String(docNum), W - M, 29, { align: "right" });

  // Cyan divider
  doc.setFillColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]); doc.rect(0, 36, W * 0.6, 2, "F");
  doc.setFillColor(53, 130, 170);    doc.rect(W * 0.6, 36, W * 0.2, 2, "F");
  doc.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);   doc.rect(W * 0.8, 36, W * 0.2, 2, "F");

  // Company name
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); 
  doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.text("DEVIONIC (PRIVATE) LIMITED", W / 2, 44, { align: "center" });
  
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); 
  doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
  doc.text("Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450", W / 2, 49, { align: "center" });

  // Employee info table
  let y = 55;
  const sData = {
    ...data,
    empName: String(data.empName || ""),
    position: String(data.position || ""),
    department: String(data.department || ""),
    CNIC: String(data.cnic || ""),
    bankAccount: String(data.bankAccount || ""),
    staffType: String(data.staffType || ""),
    basicSalary: Number(data.basicSalary) || 0,
    allowances: Number(data.allowances) || 0,
    deductions: Number(data.deductions) || 0,
    netSalary: Number(data.netSalary) || 0,
  };

  autoTable(doc, {
    startY: y, margin: { left: M, right: M },
    body: [
      ["Employee Name", sData.empName, "Emp ID", String(data.verificationId || "")],
      ["Designation",  sData.position, "Date Joined",  (() => {
        try {
          const d = new Date(data.joinDate);
          return isValid(d) ? format(d, "dd/MM/yyyy") : String(data.joinDate || "");
        } catch { return String(data.joinDate || ""); }
      })()],
      ["Department",   sData.department, "Staff Type",   sData.staffType],
      ["CNIC",         String(data.cnic || ""), "Bank Account", sData.bankAccount],
    ],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { fillColor: [BRAND.light[0], BRAND.light[1], BRAND.light[2]], textColor: [100,100,100], fontStyle: "bold", cellWidth: 36 },
      1: { cellWidth: 60 },
      2: { fillColor: [BRAND.light[0], BRAND.light[1], BRAND.light[2]], textColor: [100,100,100], fontStyle: "bold", cellWidth: 36 },
      3: { cellWidth: 60 },
    },
  });

  y = (doc as any).lastAutoTable?.finalY || y + 20;
  y += 4;

  // Section heading
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); 
  doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.text("SALARY DETAILS", M, y + 4);
  doc.setDrawColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]); doc.setLineWidth(0.5);
  doc.line(M, y + 6, W - M, y + 6);
  y += 10;

  const totalEarnings = sData.basicSalary + sData.allowances;

  autoTable(doc, {
    startY: y, margin: { left: M, right: W / 2 - 2 },
    head: [["Earnings", "Amount (PKR)"]],
    body: [
      ["Basic Salary",        `PKR ${sData.basicSalary.toLocaleString()}`],
      ["Allowances",          `PKR ${sData.allowances.toLocaleString()}`],
      ["Total Earnings (A)",  `PKR ${totalEarnings.toLocaleString()}`],
    ],
    theme: "striped",
    headStyles: { fillColor: [BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]], textColor: [BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    didParseCell: d => { if (d.row.index === 2) { d.cell.styles.fontStyle = "bold"; d.cell.styles.fillColor = [240,253,252]; } },
  });
  autoTable(doc, {
    startY: y, margin: { left: W / 2 + 2, right: M },
    head: [["Deductions", "Amount (PKR)"]],
    body: [
      ["Total Deductions",    `PKR ${sData.deductions.toLocaleString()}`],
      ["Total Deductions (B)",`PKR ${sData.deductions.toLocaleString()}`],
    ],
    theme: "striped",
    headStyles: { fillColor: [100,27,27], textColor: [BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    didParseCell: d => { if (d.row.index === 1) { d.cell.styles.fontStyle = "bold"; d.cell.styles.fillColor = [255,245,245]; } },
  });

  y = (doc as any).lastAutoTable?.finalY || y + 20;
  y += 4;

  // Net salary box
  doc.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.roundedRect(M, y, W - M * 2, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); 
  doc.setTextColor(BRAND.white[0], BRAND.white[1], BRAND.white[2]);
  doc.text("Net Salary Payable (A - B)", M + 5, y + 9);
  doc.setFontSize(13); doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text(`PKR ${sData.netSalary.toLocaleString()}`, W - M - 5, y + 9, { align: "right" });
  y += 18;

  if (data.notes) {
    doc.setFillColor(249,249,249);
    doc.roundedRect(M, y, W - M * 2, 14, 2, 2, "F");
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(100,100,100);
    doc.text("Notes:", M + 4, y + 5);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(String(data.notes), W - M * 2 - 8);
    doc.text(splitNotes, M + 4, y + 10);
    y += 18;
  }

  doc.setFontSize(7); doc.setFont("helvetica", "italic"); doc.setTextColor(150,150,150);
  doc.text("** Note: All amounts in PKR  |  *System generated, no signature required.", M, y + 4);

  // Footer
  const footY = doc.internal.pageSize.getHeight() - 12;
  doc.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.rect(0, footY, W, 12, "F");
  try {
    const qr = await generateQR(verifyUrl);
    if (qr) doc.addImage(qr, "PNG", W - 18, footY - 16, 16, 16);
  } catch { /* skip */ }
  doc.setFontSize(7); doc.setFont("helvetica", "normal"); 
  doc.setTextColor(BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]);
  doc.text(`Verification ID: ${data.verificationId}`, M, footY + 4.5);
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text("devionic.com/verify", W - M, footY + 4.5, { align: "right" });

  doc.save(`Salary_Slip_${data.month}_${data.year}_${data.verificationId}.pdf`);
};

// ── Transaction Receipt ───────────────────────────────────────────────────────

export interface ReceiptPdfData {
  displayId: string;
  date: string;
  time: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  fromName?: string;
  toName?: string;
  referenceNumber?: string;
  notes?: string;
}

const methodLabel = (m?: string) =>
  ({ cash: "Cash", bank_transfer: "Bank Transfer", cheque: "Cheque", online: "Online Payment", mobile_wallet: "Mobile Wallet", pay_order: "Pay Order" }[m || ""] || m || "Cash");

export const downloadReceiptPDF = async (data: ReceiptPdfData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 10;
  const verifyUrl = `${window.location.origin}/verify?id=${data.displayId}`;
  const isIncome = data.type === "income";
  const statusC = isIncome ? [46,125,50]  as [number,number,number] : [211,47,47]  as [number,number,number];
  const statusB = isIncome ? [232,245,233] as [number,number,number] : [252,228,236] as [number,number,number];
  const currency = data.currency || "PKR";

  doc.setDrawColor(200,200,200); doc.setLineWidth(0.3);
  doc.rect(2, 2, W - 4, H - 4);

  try {
    const logo = await loadFullLogo();
    if (logo) doc.addImage(logo, "PNG", W / 2 - 24, 8, 48, 12);
  } catch {
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.text("DEVIONIC", W / 2, 14, { align: "center" });
  }

  doc.setDrawColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]); doc.setLineWidth(0.8);
  doc.line(M, 23, W - M, 23);

  doc.setFillColor(statusB[0], statusB[1], statusB[2]);
  doc.roundedRect(W / 2 - 32, 27, 64, 10, 3, 3, "F");
  doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(statusC[0], statusC[1], statusC[2]);
  doc.text(isIncome ? "✓ TRANSACTION SUCCESSFUL" : "✓ PAYMENT PROCESSED", W / 2, 33.5, { align: "center" });
  
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(150,150,150);
  doc.text(`${String(data.date || "")}  at  ${String(data.time || "")}`, W / 2, 41, { align: "center" });

  doc.setFillColor(248,255,254); doc.setDrawColor(224,242,241);
  doc.roundedRect(M, 45, W - M * 2, 18, 3, 3, "FD");
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100,100,100);
  doc.text(String(currency), W / 2, 51, { align: "center" });
  
  doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(17,24,39);
  doc.text(Number(data.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }), W / 2, 59, { align: "center" });

  doc.setFontSize(7); doc.setFont("helvetica", "bold"); 
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text(String(data.displayId || ""), W / 2, 67, { align: "center" });

  doc.setDrawColor(220,220,220); doc.setLineDash([1, 1], 0);
  doc.line(M, 71, W - M, 71);
  doc.setLineDash([], 0);

  const rows: [string, string][] = [];
  if (data.toName)         rows.push(["To",             String(data.toName)]);
  if (data.fromName)       rows.push(["From",           String(data.fromName)]);
  rows.push(                         ["Category",       String(data.category || "")]);
  rows.push(                         ["Description",    String(data.description || "")]);
  if (data.paymentMethod)  rows.push(["Payment Method", methodLabel(data.paymentMethod)]);
  if (data.referenceNumber)rows.push(["Reference #",    String(data.referenceNumber)]);

  autoTable(doc, {
    startY: 74, margin: { left: M, right: M },
    body: rows, theme: "plain",
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { textColor: [150,150,150], cellWidth: 36 }, 1: { textColor: [BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]], fontStyle: "bold" } },
  });

  const lastY = (doc as any).lastAutoTable?.finalY;
  let current_y = (typeof lastY === 'number') ? lastY + 4 : 74 + 30;

  try {
    const qr = await generateQR(verifyUrl);
    if (qr) {
      doc.addImage(qr, "PNG", W / 2 - 12, current_y, 24, 24);
      current_y += 26;
    }
  } catch { 
     current_y += 2; 
  }
  
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(170,170,170);
  doc.text("Scan to verify", W / 2, current_y, { align: "center" });
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text(String(data.displayId || ""), W / 2, current_y + 4, { align: "center" });
  current_y += 8;

  doc.setDrawColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]); doc.setLineWidth(0.8);
  doc.line(M, current_y, W - M, current_y);
  
  doc.setFontSize(7); doc.setFont("helvetica", "bold"); 
  doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.text("DEVIONIC (PRIVATE) LIMITED", W / 2, current_y + 5, { align: "center" });
  
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(150,150,150);
  doc.text("+92-317-7121841  |  info@devionic.com", W / 2, current_y + 9, { align: "center" });
  doc.text("www.devionic.com  |  Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450", W / 2, current_y + 13, { align: "center" });

  doc.save(`Receipt_${data.displayId}.pdf`);
};

// ── Verification Slip ─────────────────────────────────────────────────────────

export interface VerificationSlipPdfData {
  module: string;
  displayId: string;
  title: string;
  status: string;
  previousStatus?: string;
  updatedAt: string;
  details: { label: string; value: string }[];
  notes?: string;
}

export const downloadVerificationSlipPDF = async (data: VerificationSlipPdfData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();
  const M = 10;
  const verifyUrl = `${window.location.origin}/verify?id=${data.displayId}`;

  doc.setDrawColor(200,200,200); doc.setLineWidth(0.3);
  doc.rect(2, 2, W - 4, doc.internal.pageSize.getHeight() - 4);

  try {
    const logo = await loadFullLogo();
    if (logo) doc.addImage(logo, "PNG", W / 2 - 24, 6, 48, 12);
  } catch { /* skip */ }

  doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(150,150,150);
  doc.text("Digital Database & Registration System", W / 2, 21, { align: "center" });
  
  doc.setDrawColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]); doc.setLineWidth(0.8);
  doc.line(M, 24, W - M, 24);
  
  doc.setFontSize(12); doc.setFont("helvetica", "bold"); 
  doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.text("VERIFICATION SLIP", W / 2, 31, { align: "center" });

  doc.setFillColor(232,245,233);
  doc.roundedRect(W / 2 - 25, 34, 50, 8, 2, 2, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(46,125,50);
  doc.text(`✓  ${String(data.status || "").replace(/_/g, " ").toUpperCase()}`, W / 2, 39.5, { align: "center" });

  autoTable(doc, {
    startY: 46, margin: { left: M, right: M },
    head: [["Field", "Value"]],
    body: [
      ["Module",   String(data.module || "")],
      ["Record ID",String(data.displayId || "")],
      ["Title",    String(data.title || "")],
      ["Status",   String(data.status || "").replace(/_/g, " ")],
      ...(data.previousStatus ? [["Previous Status", String(data.previousStatus).replace(/_/g, " ")]] : [] as any),
      ["Updated At", String(data.updatedAt || "")],
      ...(data.details || []).map(d => [String(d.label), String(d.value)]),
    ],
    theme: "striped",
    headStyles: { fillColor: [BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]], textColor: [BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]], fontSize: 7.5 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: { 0: { fillColor: [BRAND.light[0], BRAND.light[1], BRAND.light[2]], textColor: [100,100,100], fontStyle: "bold", cellWidth: 36 } },
  });

  const lastY = (doc as any).lastAutoTable?.finalY;
  let current_y = (typeof lastY === 'number') ? lastY + 4 : 46 + 30;

  if (data.notes) {
    doc.setFillColor(249,249,249);
    doc.roundedRect(M, current_y, W - M * 2, 14, 2, 2, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(100,100,100);
    doc.text("Notes:", M + 3, current_y + 5);
    doc.setFont("helvetica", "normal");
    doc.text(String(data.notes), M + 3, current_y + 10);
    current_y += 18;
  }

  try {
    const qr = await generateQR(verifyUrl);
    if (qr) {
      doc.addImage(qr, "PNG", W / 2 - 14, current_y, 28, 28);
      current_y += 30;
    }
  } catch { 
    current_y += 2; 
  }
  
  doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(170,170,170);
  doc.text("Scan to verify  |  " + String(data.displayId || ""), W / 2, current_y, { align: "center" });
  current_y += 6;

  doc.setDrawColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]); doc.setLineWidth(0.8);
  doc.line(M, current_y, W - M, current_y);
  
  doc.setFontSize(6.5); doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]); doc.setFont("helvetica", "bold");
  doc.text("DEVIONIC (PRIVATE) LIMITED", W / 2, current_y + 5, { align: "center" });
  
  doc.setFontSize(6); doc.setFont("helvetica", "normal"); doc.setTextColor(150,150,150);
  doc.text("+92-317-7121841  |  info@devionic.com  |  www.devionic.com", W / 2, current_y + 9, { align: "center" });

  doc.save(`Verification_${data.displayId}.pdf`);
};

// ── Financial Report ──────────────────────────────────────────────────────────

export interface FinancialReportPdfData {
  entries: any[];
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export const downloadFinancialReportPDF = async (data: FinancialReportPdfData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 14;

  // Header Bar
  doc.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.rect(0, 0, W, 40, "F");

  try {
    const logo = await loadFullLogo();
    if (logo) doc.addImage(logo, "PNG", M, 8, 48, 12);
  } catch { /* skip */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text("FINANCIAL REPORT", W - M, 18, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]);
  doc.text(`Report Generated On: ${format(new Date(), "PPP p")}`, W - M, 26, { align: "right" });
  doc.text("OFFICIAL DOCUMENT", W - M, 31, { align: "right" });

  // Summary Tiles
  let y = 50;
  const tileW = (W - M * 2 - 8) / 3;

  const F9 = 249;

  const drawTile = (label: string, value: string, color: [number,number,number], x: number) => {
    doc.setFillColor(F9, F9, F9); // Very light grey
    doc.roundedRect(x, y, tileW, 20, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7);
    doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
    doc.text(label.toUpperCase(), x + 4, y + 6);
    doc.setFontSize(11); doc.setTextColor(color[0], color[1], color[2]);
    doc.text(value, x + 4, y + 14);
  };
  drawTile("Total Income", `PKR ${data.totalIncome.toLocaleString()}`, [46, 125, 50], M);
  drawTile("Total Expenses", `PKR ${data.totalExpense.toLocaleString()}`, [211, 47, 47], M + tileW + 4);
  drawTile("Net Balance", `PKR ${data.netBalance.toLocaleString()}`, BRAND.dark, M + (tileW + 4) * 2);

  y += 28;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["ID", "DATE", "TYPE", "CATEGORY", "DESCRIPTION", "AMOUNT"]],
    body: (data.entries || []).map(e => [
      String(e.display_id || "").toUpperCase(),
      format(new Date(e.entry_date), "dd/MM/yyyy"),
      String(e.type || "").toUpperCase(),
      String(e.category || "").toUpperCase(),
      String(e.description || ""),
      `PKR ${Number(e.amount || 0).toLocaleString()}`,
    ]),
    theme: "striped",
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 25 },
      2: { cellWidth: 20 },
      5: { halign: "right", fontStyle: "bold" },
    },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 2) {
        if (d.cell.raw === "INCOME") d.cell.styles.textColor = [46, 125, 50];
        if (d.cell.raw === "EXPENSE") d.cell.styles.textColor = [211, 47, 47];
      }
    }
  });

  doc.save(`Financial_Report_${format(new Date(), "yyyy_MM_dd")}.pdf`);
};

