import PDFDocument from "pdfkit";

function naira(kobo: bigint | number): string {
  const n = typeof kobo === "bigint" ? Number(kobo) : kobo;
  return "₦" + (n / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export interface AgreementData {
  reference: string;
  tenantLegalName: string;
  landlordLegalName: string;
  tenantEmail: string;
  landlordEmail: string;
  tenantPhone: string | null;
  landlordPhone: string | null;
  propertyAddress: string;
  tenancyStartDate: Date;
  tenancyEndDate: Date;
  rentAmount: bigint;
  paymentFrequency: string;
  cautionDeposit: bigint;
  latePaymentPenalty: number;
  noticePeriodDays: number;
  state: string;
  generatedAt: Date;
}

export function generateAgreementPdf(data: AgreementData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const GREEN = "#0F7B5A";
    const DARK = "#111827";
    const GREY = "#6B7280";
    const pageW = doc.page.width - 120;

    // Header bar
    doc.rect(0, 0, doc.page.width, 70).fill(GREEN);
    doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text("SafeRent", 60, 22);
    doc.fontSize(9).font("Helvetica").text("Secure Nigerian Rental Marketplace", 60, 48);
    doc.fillColor(DARK);

    // Title
    doc.moveDown(3);
    doc.fontSize(16).font("Helvetica-Bold").fillColor(DARK).text("RESIDENTIAL TENANCY AGREEMENT", { align: "center" });
    doc.moveDown(0.4);
    doc.fontSize(9).font("Helvetica").fillColor(GREY).text(`Reference: ${data.reference}   |   Generated: ${fmtDate(data.generatedAt)}`, { align: "center" });
    doc.moveDown(1.2);

    // Helper: section heading
    function sectionHead(title: string) {
      doc.moveDown(0.8);
      doc.rect(60, doc.y, pageW, 20).fill("#F0FDF4");
      doc.fillColor(GREEN).fontSize(10).font("Helvetica-Bold").text(title, 68, doc.y - 16);
      doc.fillColor(DARK).moveDown(0.8);
    }

    // Helper: row
    function row(label: string, value: string) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(GREY).text(label, 60, doc.y, { continued: true, width: 160 });
      doc.font("Helvetica").fillColor(DARK).text(value, { width: pageW - 160 });
    }

    // Parties
    sectionHead("1. PARTIES");
    row("Landlord:", data.landlordLegalName);
    if (data.landlordEmail) row("Landlord Email:", data.landlordEmail);
    if (data.landlordPhone) row("Landlord Phone:", data.landlordPhone);
    doc.moveDown(0.5);
    row("Tenant:", data.tenantLegalName);
    if (data.tenantEmail) row("Tenant Email:", data.tenantEmail);
    if (data.tenantPhone) row("Tenant Phone:", data.tenantPhone);

    // Property
    sectionHead("2. PROPERTY");
    row("Address:", data.propertyAddress);
    row("State:", data.state);

    // Tenancy term
    sectionHead("3. TENANCY TERM");
    row("Start Date:", fmtDate(data.tenancyStartDate));
    row("End Date:", fmtDate(data.tenancyEndDate));
    row("Payment Frequency:", data.paymentFrequency);

    // Financials
    sectionHead("4. RENT & DEPOSITS");
    row("Annual Rent:", naira(data.rentAmount));
    row("Caution Deposit:", naira(data.cautionDeposit));
    row("Late Payment Penalty:", `${data.latePaymentPenalty}% per annum`);
    row("Payment managed by:", "SafeRent Escrow Trust");

    // Obligations
    sectionHead("5. TENANT OBLIGATIONS");
    const tenantObligations = [
      "Pay rent on or before the due date as agreed.",
      "Maintain the property in a clean and habitable condition.",
      "Not sublet or assign the property without written consent.",
      "Provide SafeRent with " + data.noticePeriodDays + " days written notice before vacating.",
      "Comply with all applicable laws and not engage in illegal activities.",
    ];
    tenantObligations.forEach((o, i) => {
      doc.fontSize(9).font("Helvetica").fillColor(DARK).text(`${i + 1}.  ${o}`, 68, doc.y, { width: pageW - 8 });
    });

    sectionHead("6. LANDLORD OBLIGATIONS");
    const landlordObligations = [
      "Ensure the property is in good repair and habitable condition at commencement.",
      "Provide " + data.noticePeriodDays + " days notice before entry for inspections (except emergencies).",
      "Not harass or interfere with the tenant's quiet enjoyment.",
      "Return the caution deposit within 14 days of tenancy end, less lawful deductions.",
    ];
    landlordObligations.forEach((o, i) => {
      doc.fontSize(9).font("Helvetica").fillColor(DARK).text(`${i + 1}.  ${o}`, 68, doc.y, { width: pageW - 8 });
    });

    // Dispute Resolution
    sectionHead("7. DISPUTE RESOLUTION");
    doc.fontSize(9).font("Helvetica").fillColor(DARK).text(
      "Any dispute arising under this agreement shall first be referred to SafeRent mediation. If unresolved within 30 days, the matter may be escalated to the relevant State Tenancy Tribunal.",
      68, doc.y, { width: pageW - 8 }
    );

    // Escrow clause
    sectionHead("8. ESCROW & SAFE PAYMENT");
    doc.fontSize(9).font("Helvetica").fillColor(DARK).text(
      "All rental payments are held in the SafeRent Escrow Trust Account and released to the Landlord only after the Tenant confirms successful move-in. SafeRent charges a platform fee as disclosed at payment initiation.",
      68, doc.y, { width: pageW - 8 }
    );

    // Signatures
    sectionHead("9. SIGNATURES");
    doc.moveDown(0.5);
    doc.fontSize(9).font("Helvetica").fillColor(GREY).text(
      "By signing this agreement (electronically via SafeRent), both parties agree to all terms above.",
      60, doc.y, { width: pageW }
    );
    doc.moveDown(1.5);

    const sigY = doc.y;
    // Tenant sig box
    doc.rect(60, sigY, 200, 50).stroke("#D1D5DB");
    doc.fontSize(8).font("Helvetica").fillColor(GREY).text("Tenant Signature", 68, sigY + 36);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(DARK).text(data.tenantLegalName, 68, sigY + 6);

    // Landlord sig box
    doc.rect(doc.page.width - 260, sigY, 200, 50).stroke("#D1D5DB");
    doc.fontSize(8).font("Helvetica").fillColor(GREY).text("Landlord Signature", doc.page.width - 252, sigY + 36);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(DARK).text(data.landlordLegalName, doc.page.width - 252, sigY + 6);

    // Footer
    doc.moveDown(3);
    doc.fontSize(7).fillColor(GREY).text(
      "This document was generated by SafeRent (saferent.ng) and is legally binding when signed by both parties. SafeRent acts solely as a platform facilitator.",
      60, doc.y, { align: "center", width: pageW }
    );

    doc.end();
  });
}
