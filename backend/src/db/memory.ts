import { BrandingProfile, Property, PropertyImage, PublicLink } from "../models/types.js";
import { v4 as uuidv4 } from "uuid";

export const memoryDb = {
  properties: new Map<string, Property>(),
  propertyImages: new Map<string, PropertyImage[]>(),
  brandingProfiles: new Map<string, BrandingProfile>(),
  publicLinks: new Map<string, PublicLink>(),
};

// Seed a default branding profile to keep the example focused.
const defaultBrandingId = uuidv4();
memoryDb.brandingProfiles.set(defaultBrandingId, {
  id: defaultBrandingId,
  userId: "demo-user",
  name: "Perfil principal",
  headerTitle: "Mi Inmobiliaria",
  headerSubtitle: "Tu próximo hogar, hoy",
  primaryColor: "#0F766E",
  logoUrl: "https://dummyimage.com/140x60/0f766e/ffffff&text=Logo",
  agentName: "Agente Demo",
  agentRole: "Broker Owner",
  agentPhone: "+34 600 000 000",
  agentWhatsapp: "https://wa.me/34600000000",
  agentEmail: "demo@example.com",
  agentWebsite: "https://mi-inmobiliaria.example",
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const getDefaultBrandingId = () => defaultBrandingId;
