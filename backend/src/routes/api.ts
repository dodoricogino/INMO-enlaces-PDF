import { Router } from "express";
import { extractFromUrl } from "../services/scraper/index.js";
import { memoryDb, getDefaultBrandingId } from "../db/memory.js";
import { generatePropertyPdf } from "../services/pdf/generator.js";
import { v4 as uuidv4 } from "uuid";
import { BrandingProfile, Property, PropertyImage } from "../models/types.js";

const router = Router();

router.post("/extract", async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url) return res.status(400).json({ error: "Falta url" });
  try {
    const data = await extractFromUrl(url);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Error al extraer" });
  }
});

router.post("/properties", async (req, res) => {
  const {
    property,
    images,
    brandingProfileId,
    brandingOverride,
    linkConfig,
  } = req.body as {
    property: Omit<Property, "id" | "createdAt" | "updatedAt" | "userId">;
    images: string[];
    brandingProfileId?: string;
    brandingOverride?: Partial<BrandingProfile>;
    linkConfig?: { expiresInDays?: number };
  };

  const propId = uuidv4();
  const brandingId = brandingProfileId || getDefaultBrandingId();
  const now = new Date();
  const newProperty: Property = {
    ...property,
    id: propId,
    userId: "demo-user",
    brandingProfileId: brandingId,
    brandingOverride,
    createdAt: now,
    updatedAt: now,
  };
  memoryDb.properties.set(propId, newProperty);

  const imageEntities: PropertyImage[] = images.map((url, index) => ({
    id: uuidv4(),
    propertyId: propId,
    url,
    sortOrder: index,
  }));
  memoryDb.propertyImages.set(propId, imageEntities);

  const slug = uuidv4().slice(0, 8);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (linkConfig?.expiresInDays ?? 30));
  const link = {
    id: uuidv4(),
    propertyId: propId,
    slug,
    expiresAt,
    isActive: true,
    createdAt: now,
  };
  memoryDb.publicLinks.set(slug, link);

  const pdfPath = generatePropertyPdf({ ...newProperty, images: imageEntities }, getBrandingForProperty(newProperty));

  res.json({ propertyId: propId, publicUrl: `/p/${slug}`, pdfUrl: `/api/properties/${propId}/pdf`, pdfPath });
});

router.get("/properties/:id/pdf", (req, res) => {
  const prop = memoryDb.properties.get(req.params.id);
  if (!prop) return res.status(404).send("Propiedad no encontrada");
  const branding = getBrandingForProperty(prop);
  const pdfPath = generatePropertyPdf({ ...prop, images: memoryDb.propertyImages.get(prop.id) || [] }, branding);
  res.sendFile(pdfPath);
});

function getBrandingForProperty(property: Property): BrandingProfile {
  const profile = property.brandingOverride
    ? { ...memoryDb.brandingProfiles.get(property.brandingProfileId || getDefaultBrandingId())!, ...property.brandingOverride }
    : memoryDb.brandingProfiles.get(property.brandingProfileId || getDefaultBrandingId());
  if (!profile) throw new Error("Branding profile not found");
  return profile;
}

export default router;
