export interface ThermalSlipData {
  module: string;
  recordId: string;
  displayId: string;
  title: string;
  status: string;
  previousStatus?: string;
  updatedAt: string;
  updatedBy?: string;
  notes?: string;
  attachments?: string[];
  details: { label: string; value: string }[];
}

const loadLogo = async (): Promise<string> => {
  try {
    const mod = await import("@/assets/devionic-logo-full.png");
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        c.getContext("2d")?.drawImage(img, 0, 0);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = () => resolve("");
      img.src = mod.default;
    });
  } catch { return ""; }
};

export const generateThermalSlip = async (data: ThermalSlipData, size: "58mm" | "80mm" = "80mm") => {
  const logoBase64 = await loadLogo();
  const verifyUrl = `${window.location.origin}/verify?id=${data.displayId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`;
  const now = new Date();
  const dateTime = now.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const width = size === "58mm" ? "58mm" : "80mm";

  const html = `<!DOCTYPE html><html><head><title>Verification - ${data.displayId}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#333; }
  @page { size:${width} auto; margin:0; }
  @media print { body { padding:0; } }
  .slip { max-width:${width}; margin:0 auto; padding:6px; }
  .header { text-align:center; padding:8px 0 6px; border-bottom:2px solid #00bac7; margin-bottom:8px; }
  .header img { max-width:${size === "58mm" ? "140px" : "180px"}; height:auto; margin-bottom:4px; }
  .header .sub { font-size:6px; color:#999; letter-spacing:1.5px; text-transform:uppercase; }
  .title { text-align:center; font-size:${size === "58mm" ? "10px" : "12px"}; font-weight:700; color:#0d1b2a; margin:8px 0 4px; text-transform:uppercase; letter-spacing:0.5px; }
  .badge { text-align:center; margin:6px 0; }
  .badge span { display:inline-block; padding:3px 12px; border-radius:20px; font-size:${size === "58mm" ? "9px" : "10px"}; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  .badge .verified { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
  .divider { border:none; border-top:1px dashed #ddd; margin:8px 0; }
  .row { display:flex; justify-content:space-between; padding:3px 0; font-size:${size === "58mm" ? "8px" : "9px"}; }
  .row .label { color:#888; }
  .row .val { color:#222; font-weight:600; text-align:right; max-width:55%; word-break:break-word; }
  .section-title { font-size:7px; font-weight:700; text-transform:uppercase; color:#aaa; letter-spacing:1.5px; margin:6px 0 4px; padding-bottom:2px; border-bottom:1px solid #f0f0f0; }
  .notes { font-size:${size === "58mm" ? "7px" : "8px"}; color:#555; background:#f9f9f9; padding:6px; border-radius:4px; margin:6px 0; line-height:1.4; }
  .qr { text-align:center; margin:8px 0; }
  .qr img { width:${size === "58mm" ? "50px" : "70px"}; height:${size === "58mm" ? "50px" : "70px"}; }
  .qr .text { font-size:6px; color:#aaa; margin-top:2px; }
  .qr .id { font-size:7px; color:#00bac7; font-weight:600; font-family:'Courier New',monospace; }
  .footer { text-align:center; border-top:2px solid #00bac7; padding-top:6px; margin-top:8px; }
  .footer .company { font-size:7px; font-weight:700; color:#0d1b2a; letter-spacing:0.5px; }
  .footer .info { font-size:6px; color:#999; margin-top:2px; line-height:1.6; }
  .footer .powered { font-size:6px; color:#bbb; margin-top:4px; padding-top:3px; border-top:1px solid #f0f0f0; }
</style></head><body>
<div class="slip">
  <div class="header">
    ${logoBase64 ? `<img src="${logoBase64}" alt="Devionic" />` : `<div style="font-size:20px;font-weight:900;color:#0d1b2a;letter-spacing:2px;">DEVIONIC</div>`}
    <div class="sub">Digital Database & Registration System</div>
  </div>
  
  <div class="title">Verification Slip</div>
  
  <div class="badge"><span class="verified">✓ ${data.status.replace(/_/g, " ")}</span></div>
  
  <hr class="divider" />
  
  <div class="section-title">Record Information</div>
  <div class="row"><span class="label">Module</span><span class="val">${data.module}</span></div>
  <div class="row"><span class="label">Record ID</span><span class="val" style="font-family:'Courier New',monospace;">${data.displayId}</span></div>
  <div class="row"><span class="label">Title</span><span class="val">${data.title}</span></div>
  <div class="row"><span class="label">Status</span><span class="val" style="text-transform:capitalize;">${data.status.replace(/_/g, " ")}</span></div>
  ${data.previousStatus ? `<div class="row"><span class="label">Previous</span><span class="val" style="text-transform:capitalize;">${data.previousStatus.replace(/_/g, " ")}</span></div>` : ""}
  <div class="row"><span class="label">Updated</span><span class="val">${data.updatedAt}</span></div>
  
  ${data.details.length > 0 ? `
    <hr class="divider" />
    <div class="section-title">Details</div>
    ${data.details.map(d => `<div class="row"><span class="label">${d.label}</span><span class="val">${d.value}</span></div>`).join("")}
  ` : ""}
  
  ${data.notes ? `
    <hr class="divider" />
    <div class="section-title">Notes</div>
    <div class="notes">${data.notes}</div>
  ` : ""}
  
  <div class="qr">
    <img src="${qrUrl}" alt="QR Code" />
    <div class="text">Scan to verify</div>
    <div class="id">${data.displayId}</div>
  </div>
  
  <div class="footer">
    <div class="company">DEVIONIC (PRIVATE) LIMITED</div>
    <div class="info">+92-317-7121841 | info@devionic.com<br/>www.devionic.com | Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450</div>
    <div class="powered">${dateTime} | Verified on devionic.com</div>
  </div>
</div>
</body></html>`;

  return html;
};

export const printThermalSlip = async (data: ThermalSlipData, size: "58mm" | "80mm" = "80mm") => {
  const html = await generateThermalSlip(data, size);
  const pw = window.open("", "_blank");
  if (!pw) return;
  pw.document.write(html);
  pw.document.close();
  setTimeout(() => pw.print(), 600);
};

export const downloadThermalSlip = async (data: ThermalSlipData, _size: "58mm" | "80mm" = "80mm") => {
  const { downloadVerificationSlipPDF } = await import("@/lib/pdf-download");
  const now = new Date();
  const updatedAt = data.updatedAt || now.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  await downloadVerificationSlipPDF({
    module: data.module,
    displayId: data.displayId,
    title: data.title,
    status: data.status,
    previousStatus: data.previousStatus,
    updatedAt,
    details: data.details,
    notes: data.notes,
  });
};

