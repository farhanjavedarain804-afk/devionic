/**
 * pdf-download.ts
 * Main PDF generation engine for Devionic.
 * Handles Invoices, Quotations, and re-exports other generators.
 */

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { format, isValid } from "date-fns";
import QRCode from "qrcode";
import { parseItems, formatDateSafe } from "./pdf-utils";
import { MONTSERRAT_BOLD, ROBOTO_REGULAR, ROBOTO_BOLD } from "./pdf-fonts";

// Re-export other supporting generators
export * from "./pdf-download-other";

const BRAND = {
  dark:   [10,  33,  57]   as [number, number, number], // Navy HSL(207, 74%, 15%)
  accent: [0,   204, 173]  as [number, number, number], // Cyan HSL(174, 100%, 40%)
  slate4: [148, 163, 184] as [number, number, number],
  slate5: [100, 116, 139] as [number, number, number],
  slate6: [71,  85,  105] as [number, number, number],
  white:  [255, 255, 255] as [number, number, number],
  tableRow: [240, 253, 252] as [number, number, number], // Light Cyan tint
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
        } catch (e) {
          console.error("Canvas conversion failed:", e);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = logoUrl;
    });
  } catch (e) { 
    console.error("Logo import failed:", e);
    return null; 
  }
}

export interface DocumentPdfData {
  type: "invoice" | "quotation";
  number: string;
  status: string;
  createdAt: string;
  dueDate?: string;
  validUntil?: string;
  currency: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  items: any; // Can be string or array
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  notes?: string;
  verificationId?: string;
  bankAccounts?: any[];
}

export const downloadDocumentPDF = async (data: DocumentPdfData, mode: "download" | "print" | "preview" = "download"): Promise<string | void> => {
  try {
    const sanitize = {
      number: (n: any) => Number(n) || 0,
      string: (s: any) => String(s || "").trim(),
      items: (items: any) => parseItems(items).map(it => ({
        description: String(it.description || "ITEM").toUpperCase(),
        quantity: Number(it.quantity) || 0,
        rate: Number(it.rate) || 0,
        amount: Number(it.amount) || 0,
      }))
    };

    const sData = {
      ...data,
      subtotal: sanitize.number(data.subtotal),
      taxAmount: sanitize.number(data.taxAmount),
      taxRate: sanitize.number(data.taxRate),
      discount: sanitize.number(data.discount),
      total: sanitize.number(data.total),
      paidAmount: sanitize.number(data.paidAmount),
      clientName: sanitize.string(data.clientName),
      currency: sanitize.string(data.currency || "PKR"),
      items: sanitize.items(data.items),
      number: sanitize.string(data.number),
    };

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 15; // 15mm margin
    
    const isInvoice = data.type === "invoice";
    const BLUE = BRAND.accent;

    // ────── HEADER ──────
    try {
      const logo = await loadFullLogo();
      if (logo) {
        // Vertically centered logo (10mm height) with text (approx 8mm baseline)
        doc.addImage(logo, "PNG", M, M, 45, 10);
      }
    } catch { /* skip */ }

    doc.setFont("Montserrat", "bold");
    doc.setFontSize(32);
    doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.text(isInvoice ? "INVOICE" : "QUOTATION", W - M, M + 8, { align: "right" });
    
    // Header Separator Line
    let y = M + 24;
    doc.setDrawColor(229, 231, 235); // Gray 200
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    
    // Accent decoration on left
    doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.setLineWidth(1);
    doc.line(M, y, M + 40, y); 
    
    y += 18; // BREATHING ROOM: Place info section "under line"
    
    // 1. BILL TO (Left Side)
    doc.setFontSize(10);
    doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.setFont("Montserrat", "bold");
    doc.text("BILL TO :", M, y);
    
    // 2. Metadata Labels (Right Side - Equal State)
    const rightLabelX = W - M - 60;
    const rightValueX = W - M;
    const startY = y;
    
    doc.setFontSize(8);
    doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
    doc.text("INVOICE :", rightLabelX, startY);
    doc.text("DATE :", rightLabelX, startY + 7);
    doc.text("NTN :", rightLabelX, startY + 14);
    doc.text("DUE DATE :", rightLabelX, startY + 21);

    // 1. BILL TO Details (Left - below title)
    y += 8;
    doc.setFontSize(16);
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.setFont("Montserrat", "bold");
    doc.text(sData.clientName || "Client Name", M, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    doc.setTextColor(BRAND.slate6[0], BRAND.slate6[1], BRAND.slate6[2]);
    doc.text(`Phone: ${sData.clientPhone || 'N/A'}`, M, y); y += 5;
    doc.text(`Email: ${sData.clientEmail || 'N/A'}`, M, y); y += 5;
    const splitAddr = doc.splitTextToSize(sData.clientAddress || 'Pakistan', 70);
    doc.text(splitAddr, M, y);
    const leftEndY = y + (splitAddr.length * 5);

    // 2. Metadata Values (Right - aligned with labels)
    doc.setFontSize(11);
    doc.setFont("Montserrat", "bold");
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    const numOnly = sData.number.split('-').pop() || sData.number;
    doc.text(`#${numOnly}`, rightValueX, startY, { align: "right" });
    
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.text(formatDateSafe(sData.createdAt, "dd MMMM yyyy"), rightValueX, startY + 7, { align: "right" });
    
    doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.text("H534200-5", rightValueX, startY + 14, { align: "right" });
    
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.text(sData.dueDate ? formatDateSafe(sData.dueDate, "dd MMMM yyyy") : 'Upon Receipt', rightValueX, startY + 21, { align: "right" });

    y = Math.max(leftEndY, startY + 28) + 10;

    // ────── ITEMS TABLE ──────
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["NO", "DESCRIPTION", "QTY", "PRICE", "TOTAL"]],
      body: sData.items.map((it, i) => [
        i + 1,
        it.description,
        it.quantity,
        `${sData.currency} ${it.rate.toLocaleString()}`,
        `${sData.currency} ${it.amount.toLocaleString()}`,
      ]),
      theme: "striped",
      headStyles: { 
        fillColor: BLUE, 
        textColor: [255, 255, 255], 
        fontSize: 9, 
        font: "Montserrat",
        fontStyle: "bold", 
        halign: "center",
        cellPadding: 3
      },
      bodyStyles: { 
        fontSize: 9, 
        font: "Roboto",
        fontStyle: "normal",
        textColor: [31, 41, 55], // Gray 800
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "left" },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "center", cellWidth: 35 },
        4: { halign: "right", cellWidth: 40, fontStyle: "bold" },
      },
      alternateRowStyles: { fillColor: BRAND.tableRow },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ────── TOTALS ──────
    const rightColX = W - M;
    doc.setFontSize(10);
    doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
    doc.setFont("Montserrat", "bold");
    
    doc.text("SUB TOTAL :", rightColX - 45, y, { align: "right" });
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.setFont("Roboto", "bold");
    doc.text(`${sData.currency} ${sData.subtotal.toLocaleString()}`, rightColX, y, { align: "right" });
    y += 6;
    
    doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
    doc.setFont("Montserrat", "bold");
    doc.text(`TAX ${sData.taxRate || 0}% :`, rightColX - 45, y, { align: "right" });
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.setFont("Roboto", "bold");
    doc.text(`${sData.currency} ${sData.taxAmount.toLocaleString()}`, rightColX, y, { align: "right" });
    y += 8;

    // Grand Total Strip
    doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.roundedRect(W - M - 75, y - 5, 75, 10, 0.5, 0.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("Montserrat", "bold");
    doc.text("GRAND TOTAL :", W - M - 70, y + 1.5);
    doc.setFontSize(13);
    doc.setFont("Roboto", "bold");
    doc.text(`${sData.currency} ${sData.total.toLocaleString()}`, rightColX - 4, y + 1.5, { align: "right" });

    // Payment Method Strip
    let stripY = y;
    doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.roundedRect(M, stripY - 5, 48, 8, 0.5, 0.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("Montserrat", "bold");
    doc.text("PAYMENT METHOD :", M + 3, stripY + 0.5);

    y += 10;
    doc.setFontSize(10);
    doc.setFont("Roboto", "normal");
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    if (sData.bankAccounts && sData.bankAccounts.length > 0) {
      // Prioritize primary/default account
      const sortedAccs = [...sData.bankAccounts].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      const acc = sortedAccs[0];
      
      doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      sortedAccs.forEach((acc, i) => {
        if (i > 0) y += 5;
        doc.setFont("Roboto", "bold");
        doc.text(`Bank Name : ${acc.bank_name}`, M, y); y += 5.5;
        doc.setFont("Roboto", "normal");
        doc.setTextColor(BRAND.slate6[0], BRAND.slate6[1], BRAND.slate6[2]);
        doc.text(`Account Title : ${acc.account_title}`, M, y); y += 5;
        doc.text(`Account Number : ${acc.account_number}`, M, y);
        if (acc.iban) {
          y += 5;
          doc.setFontSize(8.5);
          doc.text(`IBAN : ${acc.iban}`, M, y);
          doc.setFontSize(10);
        }
        doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      });
    } else {
      doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
      doc.setFont("Roboto", "italic");
      doc.text("Direct Cash / Online Transfer", M, y);
    }

    y += 15;

    y += 25;
    doc.setFontSize(10);
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.setFont("Montserrat", "bold");
    doc.text("Term and Conditions :", M, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
    const terms = "Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice.";
    doc.text(doc.splitTextToSize(terms, 100), M, y);

    // ────── FOOTER ──────
    const footerY = H - 15;

    // QR Code Verification (Upper of Footer Line)
    try {
      const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://devionic.com'}/verify?id=${sData.id}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 120,
        color: { dark: "#0a2139", light: "#ffffff" }
      });
      
      const qrSize = 18;
      const qrX = W - M - qrSize - 2;
      const qrY = footerY - 32; // Positioning above the line
      
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      doc.setFont("Montserrat", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
      doc.text("SCAN TO VERIFY", qrX + (qrSize/2), qrY + qrSize + 3.5, { align: "center" });
    } catch { /* skip */ }

    doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.setLineWidth(0.8);
    doc.line(M, footerY - 8, W - M, footerY - 8);

    doc.setFontSize(7);
    const tel = "+92-317-7121841";
    const mail = "info@devionic.com";
    const web = "www.devionic.com";
    const addr = "Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450";
    
    // Calculate widths for equal distribution
    const tw1 = doc.getTextWidth(tel);
    const tw2 = doc.getTextWidth(mail);
    const tw3 = doc.getTextWidth(web);
    const tw4 = doc.getTextWidth(addr);
    
    const iconW = 4; // Width reserved for icon + its margin
    const items = [
      { text: tel, w: tw1 },
      { text: mail, w: tw2 },
      { text: web, w: tw3 },
      { text: addr, w: tw4 }
    ];
    
    // Total used width (text + space for 4 icons)
    const totalContentW = tw1 + tw2 + tw3 + tw4 + (iconW * 4);
    const availableW = W - (2 * M);
    const gap = (availableW - totalContentW) / 3;

    // Final Footer Text
    doc.setFont("Roboto", "bold");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0); // BLACK TEXT
    
    doc.setFillColor(0, 0, 0); // BLACK ICONS as requested
    let currentX = M;

    // Draw distributed items
    items.forEach((item, i) => {
      // Draw Icon
      doc.circle(currentX + 1.5, footerY - 1, 0.8, "F");
      // Draw Text
      doc.text(item.text, currentX + 4.5, footerY);
      // Advance X
      currentX += item.w + iconW + gap;
    });

    if (mode === "print") {
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else if (mode === "preview") {
      const blob = doc.output("blob");
      return URL.createObjectURL(blob);
    } else {
      doc.save(`${isInvoice ? 'Invoice' : 'Quotation'}_${sData.number}.pdf`);
    }
  } catch (err) {
    console.error("PDF Error:", err);
    throw err;
  }
};

// ── Billing Report ──────────────────────────────────────────────────────────

export interface BillingReportPdfData {
  type: "invoices" | "quotation";
  docs: any[];
  totalValue: number;
  totalPaid?: number;
}

export const downloadBillingReportPDF = async (data: BillingReportPdfData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 14;

  // Header
  doc.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.rect(0, 0, W, 40, "F");

  try {
    const logo = await loadFullLogo();
    if (logo) doc.addImage(logo, "PNG", M, 8, 48, 12);
  } catch { /* skip */ }

  const title = data.type === "invoices" ? "INVOICES REPORT" : "QUOTATIONS REPORT";
  doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.text(title, W - M, 18, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(BRAND.slate4[0], BRAND.slate4[1], BRAND.slate4[2]);
  doc.text(`Generated On: ${format(new Date(), "PPP p")}`, W - M, 26, { align: "right" });

  // Summary Tiles
  const tileW = (W - M * 2 - 8) / (data.type === "invoices" ? 3 : 2);
  let y = 50;
  const F9 = 249;

  const drawTile = (label: string, value: string, x: number) => {
    doc.setFillColor(F9,F9,F9);
    doc.roundedRect(x, y, tileW, 18, 2, 2, "F");
    doc.setFontSize(7); doc.setTextColor(BRAND.slate5[0], BRAND.slate5[1], BRAND.slate5[2]);
    doc.text(label.toUpperCase(), x + 4, y + 6);
    doc.setFontSize(10); doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.text(value, x + 4, y + 13);
  };

  drawTile("Total Count", String(data.docs.length), M);
  drawTile("Total Value", `PKR ${data.totalValue.toLocaleString()}`, M + tileW + 4);
  if (data.type === "invoices") {
    drawTile("Total Received", `PKR ${(data.totalPaid || 0).toLocaleString()}`, M + (tileW + 4) * 2);
  }

  y += 28;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [["NUMBER", "CLIENT", "DATE", "STATUS", "TOTAL"]],
    body: (data.docs || []).map(d => [
      String(d.invoice_number || d.quotation_number || "").toUpperCase(),
      String(d.client_name || "").toUpperCase(),
      format(new Date(d.created_at), "dd/MM/yyyy"),
      String(d.status || "").toUpperCase(),
      `PKR ${Number(d.total || 0).toLocaleString()}`,
    ]),
    theme: "striped",
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 },
      4: { halign: "right", fontStyle: "bold" },
    }
  });

  doc.save(`${data.type}_Report_${format(new Date(), "yyyy_MM_dd")}.pdf`);
};