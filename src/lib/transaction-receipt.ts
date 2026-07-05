export interface TransactionData {
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
  fee?: number;
}

// Load the Devionic full logo as base64
let logoCache: string | null = null;
const loadLogo = async (): Promise<string> => {
  if (logoCache) return logoCache;
  try {
    const mod = await import("@/assets/devionic-logo-full.png");
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        c.getContext("2d")?.drawImage(img, 0, 0);
        logoCache = c.toDataURL("image/png");
        resolve(logoCache);
      };
      img.onerror = () => resolve("");
      img.src = mod.default;
    });
  } catch { return ""; }
};

const getPaymentMethodLabel = (method?: string): string => {
  switch (method) {
    case "cash": return "Cash";
    case "bank_transfer": return "Bank Transfer";
    case "cheque": return "Cheque";
    case "online": return "Online Payment";
    case "mobile_wallet": return "Mobile Wallet";
    case "pay_order": return "Pay Order";
    default: return method || "Cash";
  }
};

const getRefLabel = (method?: string): string => {
  switch (method) {
    case "cheque": return "Cheque Number";
    case "online": return "Transaction ID";
    case "mobile_wallet": return "Transaction ID";
    case "pay_order": return "Pay Order Number";
    case "bank_transfer": return "Reference Number";
    default: return "Reference Number";
  }
};

export const printTransactionReceipt = async (data: TransactionData) => {
  const pw = window.open("", "_blank");
  if (!pw) return;

  const currency = data.currency || "PKR";
  const logoBase64 = await loadLogo();
  const verifyUrl = `${window.location.origin}/verify?id=${data.displayId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`;

  const isIncome = data.type === "income";
  const statusText = isIncome ? "Transaction Successful" : "Payment Processed";
  const statusColor = isIncome ? "#2e7d32" : "#d32f2f";
  const statusBg = isIncome ? "#e8f5e9" : "#fce4ec";

  const now = new Date();
  const dateTime = now.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${data.displayId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #333; }
    @page { size: 80mm auto; margin: 0; }
    @media print { body { padding: 0; } }
    .receipt { max-width: 80mm; margin: 0 auto; padding: 8px; }
    
    /* Header with logo */
    .receipt-header { text-align: center; padding: 12px 0 8px; border-bottom: 2px solid #00bac7; margin-bottom: 10px; }
    .receipt-header img { max-width: 180px; height: auto; margin-bottom: 6px; }
    .receipt-header .subtitle { font-size: 7px; color: #888; letter-spacing: 1.5px; text-transform: uppercase; }
    
    /* Status */
    .receipt-status { text-align: center; margin: 12px 0 8px; }
    .receipt-status .check-icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; font-size: 20px; font-weight: bold; margin-bottom: 6px; }
    .receipt-status h2 { font-size: 13px; font-weight: 700; margin: 4px 0 2px; letter-spacing: 0.3px; }
    .receipt-status .datetime { font-size: 9px; color: #999; }
    
    /* Amount */
    .receipt-amount { text-align: center; margin: 14px 0; padding: 12px 0; background: #f8fffe; border-radius: 8px; border: 1px solid #e0f2f1; }
    .receipt-amount .currency { font-size: 11px; color: #666; font-weight: 500; }
    .receipt-amount .value { font-size: 30px; font-weight: 800; color: #111; letter-spacing: -1px; line-height: 1.2; }
    
    /* ID */
    .receipt-id { text-align: center; font-size: 9px; color: #00bac7; font-weight: 700; margin: 8px 0; font-family: 'Courier New', monospace; letter-spacing: 0.5px; }
    
    /* Divider */
    .receipt-divider { border: none; border-top: 1px dashed #ddd; margin: 10px 0; }
    
    /* Section */
    .receipt-section { margin: 10px 0; }
    .receipt-section-title { font-size: 8px; font-weight: 700; text-transform: uppercase; color: #aaa; letter-spacing: 1.5px; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #f0f0f0; }
    
    /* Rows */
    .receipt-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 10px; }
    .receipt-row .label { color: #888; }
    .receipt-row .val { color: #222; font-weight: 600; text-align: right; max-width: 55%; word-break: break-word; }
    
    /* QR Code Section */
    .receipt-qr { text-align: center; margin: 12px 0 8px; padding: 10px 0; }
    .receipt-qr img { width: 70px; height: 70px; }
    .receipt-qr .verify-text { font-size: 7px; color: #aaa; margin-top: 4px; }
    .receipt-qr .verify-id { font-size: 8px; color: #00bac7; font-weight: 600; font-family: 'Courier New', monospace; }
    
    /* Footer */
    .receipt-footer { text-align: center; border-top: 2px solid #00bac7; padding-top: 8px; margin-top: 10px; }
    .receipt-footer .company { font-size: 8px; font-weight: 700; color: #0d1b2a; letter-spacing: 0.5px; }
    .receipt-footer .info { font-size: 7px; color: #999; margin-top: 3px; line-height: 1.6; }
    .receipt-footer .powered { font-size: 7px; color: #bbb; margin-top: 6px; padding-top: 4px; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header with Logo -->
    <div class="receipt-header">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Devionic" />` : `<div style="font-size:24px;font-weight:900;color:#0d1b2a;letter-spacing:2px;">DEVIONIC</div>`}
      
    </div>
    
    <!-- Status -->
    <div class="receipt-status">
      <div class="check-icon" style="background:${statusBg};color:${statusColor};">✓</div>
      <h2 style="color:${statusColor};">${statusText}</h2>
      <div class="datetime">On ${data.date} at ${data.time}</div>
    </div>
    
    <!-- Amount -->
    <div class="receipt-amount">
      <div class="currency">${currency}</div>
      <div class="value">${Number(data.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    
    <!-- Transaction ID -->
    <div class="receipt-id">${data.displayId}</div>
    
    <hr class="receipt-divider" />
    
    <!-- Transaction Details -->
    <div class="receipt-section">
      <div class="receipt-section-title">Transaction Details</div>
      ${data.fee !== undefined ? `<div class="receipt-row"><span class="label">Fee</span><span class="val">${currency} ${Number(data.fee).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>` : ''}
      ${data.toName ? `<div class="receipt-row"><span class="label">To</span><span class="val">${data.toName}</span></div>` : ''}
      ${data.fromName ? `<div class="receipt-row"><span class="label">From</span><span class="val">${data.fromName}</span></div>` : ''}
      <div class="receipt-row"><span class="label">Category</span><span class="val">${data.category}</span></div>
      <div class="receipt-row"><span class="label">Description</span><span class="val">${data.description}</span></div>
      ${data.paymentMethod ? `<div class="receipt-row"><span class="label">Payment Method</span><span class="val">${getPaymentMethodLabel(data.paymentMethod)}</span></div>` : ''}
      ${data.referenceNumber ? `<div class="receipt-row"><span class="label">${getRefLabel(data.paymentMethod)}</span><span class="val" style="font-family:'Courier New',monospace;">${data.referenceNumber}</span></div>` : ''}
    </div>
    
    ${data.notes ? `
      <hr class="receipt-divider" />
      <div class="receipt-section">
        <div class="receipt-section-title">Notes</div>
        <div style="font-size:10px;color:#555;line-height:1.4;">${data.notes}</div>
      </div>
    ` : ''}
    
    <!-- QR Code -->
    <div class="receipt-qr">
      <img src="${qrUrl}" alt="QR Code" />
      <div class="verify-text">Scan to verify this transaction</div>
      <div class="verify-id">${data.displayId}</div>
    </div>
    
    <!-- Footer -->
    <div class="receipt-footer">
      <div class="company">DEVIONIC (PRIVATE) LIMITED</div>
      <div class="info">
        +92-317-7121841 &nbsp;|&nbsp; info@devionic.com<br/>
        www.devionic.com &nbsp;|&nbsp; Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450
      </div>
      <div class="powered">Verification ID: ${data.displayId} &nbsp;|&nbsp; ${dateTime}</div>
      <div style="font-size:7px;color:#ccc;margin-top:4px;">Securely processed via Devionic Payment System</div>
    </div>
  </div>
</body>
</html>`;

  pw.document.write(receiptHtml);
  pw.document.close();
  setTimeout(() => pw.print(), 600);
};

export const downloadTransactionReceipt = async (data: TransactionData) => {
  const { downloadReceiptPDF } = await import("@/lib/pdf-download");
  await downloadReceiptPDF({
    displayId: data.displayId,
    date: data.date,
    time: data.time,
    type: data.type,
    category: data.category,
    description: data.description,
    amount: data.amount,
    currency: data.currency,
    paymentMethod: data.paymentMethod,
    fromName: data.fromName,
    toName: data.toName,
    referenceNumber: data.referenceNumber,
    notes: data.notes,
  });
};

