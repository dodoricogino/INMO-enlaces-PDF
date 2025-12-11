import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/api.js";
import { memoryDb } from "./db/memory.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api", apiRouter);

app.get("/p/:slug", (req, res) => {
  const link = memoryDb.publicLinks.get(req.params.slug);
  if (!link) return res.status(404).send(renderExpiredPage("Enlace no encontrado"));
  if (!link.isActive || link.expiresAt.getTime() < Date.now()) {
    return res.status(410).send(renderExpiredPage());
  }
  const property = memoryDb.properties.get(link.propertyId);
  if (!property) return res.status(404).send(renderExpiredPage("Propiedad no encontrada"));
  const images = memoryDb.propertyImages.get(property.id) || [];
  const branding = property.brandingOverride || {};

  res.send(renderPublicPage(property, images.map((i) => i.url), branding));
});

function renderPublicPage(
  property: any,
  images: string[],
  branding: { [key: string]: any }
): string {
  const primary = branding.primaryColor || "#0F766E";
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${property.title}</title>
      <style>
        body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
        header { background: ${primary}; color: white; padding: 24px; }
        .brand { display: flex; align-items: center; gap: 16px; }
        .container { max-width: 960px; margin: 0 auto; padding: 24px; }
        .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 118, 110, 0.15); }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 16px 0; }
        .feature { background: #f1f5f9; padding: 12px; border-radius: 12px; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .gallery img { width: 100%; border-radius: 12px; object-fit: cover; height: 180px; }
        footer { margin-top: 32px; font-size: 14px; color: #475569; }
      </style>
    </head>
    <body>
      <header>
        <div class="container">
          <div class="brand">
            ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="logo" style="max-height:60px" />` : ""}
            <div>
              <div style="font-size:22px;font-weight:700;">${branding.headerTitle || "Ficha de propiedad"}</div>
              <div>${branding.headerSubtitle || ""}</div>
            </div>
          </div>
        </div>
      </header>
      <main class="container">
        <div class="card">
          <h1 style="margin-top:0">${property.title}</h1>
          <div style="color:${primary};font-size:22px;font-weight:700;">${property.price ?? "-"} ${property.currency ?? ""}</div>
          <p>${property.address || "Dirección no disponible"}</p>
          <div class="features">
            <div class="feature">Dormitorios: ${property.bedrooms ?? "-"}</div>
            <div class="feature">Baños: ${property.bathrooms ?? "-"}</div>
            <div class="feature">Cocheras: ${property.parking ?? "-"}</div>
            <div class="feature">Sup. cubierta: ${property.builtArea ?? "-"} m²</div>
            <div class="feature">Sup. terreno: ${property.landArea ?? "-"} m²</div>
          </div>
          <h3>Descripción</h3>
          <p>${property.description}</p>
          <h3>Galería</h3>
          <div class="gallery">
            ${images.map((img) => `<img src="${img}" alt="foto" />`).join("")}
          </div>
        </div>
        <footer>
          ${branding.agentName || ""} · ${branding.agentRole || ""} · Tel: ${branding.agentPhone || ""} · WhatsApp: ${branding.agentWhatsapp || ""} · Email: ${branding.agentEmail || ""} · Web: ${branding.agentWebsite || ""}
        </footer>
      </main>
    </body>
  </html>`;
}

function renderExpiredPage(message = "Este enlace ha expirado. Contacta con tu agente para solicitar un nuevo link.") {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Enlace expirado</title></head><body style="font-family:Inter, sans-serif; display:flex;align-items:center;justify-content:center;height:100vh;background:#f8fafc;color:#0f172a;"><div style="background:white;padding:32px;border-radius:16px;box-shadow:0 10px 30px rgba(15,23,42,0.12);text-align:center;max-width:420px;"><h1>Enlace expirado</h1><p>${message}</p></div></body></html>`;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
