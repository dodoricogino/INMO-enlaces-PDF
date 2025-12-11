import PDFDocument from "pdfkit";
import { BrandingProfile, Property } from "../../models/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very simple PDF generator; in production store files in object storage.
export function generatePropertyPdf(property: Property, branding: BrandingProfile): string {
  const doc = new PDFDocument({ margin: 50 });
  const pdfDir = path.join(__dirname, "../../../tmp");
  fs.mkdirSync(pdfDir, { recursive: true });
  const filePath = path.join(pdfDir, `${property.id}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  if (branding.logoUrl) {
    doc.image(branding.logoUrl, { fit: [140, 60], align: "left" }).moveDown();
  }
  doc
    .fillColor(branding.primaryColor || "#0F172A")
    .fontSize(22)
    .text(branding.headerTitle || "Ficha de propiedad", { continued: false })
    .fillColor("#475569")
    .fontSize(12)
    .text(branding.headerSubtitle || "");

  doc.moveDown();
  doc.fillColor("#0F172A").fontSize(18).text(property.title);
  doc.fontSize(14).fillColor("#0F766E").text(`${property.price ?? "-"} ${property.currency ?? ""}`);
  doc.moveDown();
  doc.fontSize(12).fillColor("#1F2937").text(property.address || "Dirección no disponible");

  // Key facts
  doc.moveDown();
  doc.fontSize(12).fillColor("#0F172A").text("Características", { underline: true });
  const facts = [
    `Dormitorios: ${property.bedrooms ?? "-"}`,
    `Baños: ${property.bathrooms ?? "-"}`,
    `Cocheras: ${property.parking ?? "-"}`,
    `Sup. cubierta: ${property.builtArea ?? "-"} m²`,
    `Sup. terreno: ${property.landArea ?? "-"} m²`,
  ];
  facts.forEach((fact) => doc.text(`• ${fact}`));

  doc.moveDown();
  doc.fontSize(12).fillColor("#1F2937").text("Descripción", { underline: true });
  doc.fontSize(11).text(property.description || "Sin descripción");

  if (property.extras && Object.keys(property.extras).length > 0) {
    doc.moveDown();
    doc.fontSize(12).fillColor("#1F2937").text("Extras / amenities", { underline: true });
    Object.entries(property.extras).forEach(([key, value]) => {
      doc.fontSize(11).text(`${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`);
    });
  }

  // Image placeholders (PDFKit can't fetch remote images by default without piping; structure left ready)
  doc.moveDown();
  doc.fontSize(12).fillColor("#1F2937").text("Galería (vista previa)", { underline: true });
  const images = property.images || [];
  images.slice(0, 3).forEach((img, idx) => {
    doc.fontSize(10).fillColor("#6B7280").text(`Imagen ${idx + 1}: ${img.url}`);
  });
  if (images.length > 3) {
    doc.text(`+ ${images.length - 3} imágenes adicionales`);
  }

  // Footer with agent info
  doc.moveDown();
  doc.moveDown();
  doc.fillColor("#0F172A").fontSize(10).text(`${branding.agentName || ""} - ${branding.agentRole || ""}`);
  doc.fillColor("#475569").text(`Teléfono: ${branding.agentPhone || ""}`);
  if (branding.agentWhatsapp) doc.text(`WhatsApp: ${branding.agentWhatsapp}`);
  if (branding.agentEmail) doc.text(`Email: ${branding.agentEmail}`);
  if (branding.agentWebsite) doc.text(`Web: ${branding.agentWebsite}`);

  doc.end();
  return filePath;
}
