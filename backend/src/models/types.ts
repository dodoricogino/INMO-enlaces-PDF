export interface BrandingProfile {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  agentName?: string;
  agentRole?: string;
  agentPhone?: string;
  agentWhatsapp?: string;
  agentEmail?: string;
  agentWebsite?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  sortOrder: number;
}

export interface Property {
  id: string;
  userId: string;
  brandingProfileId?: string;
  sourceUrl: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  builtArea?: number;
  landArea?: number;
  extras?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  images?: PropertyImage[];
  brandingOverride?: Partial<BrandingProfile>;
}

export interface PublicLink {
  id: string;
  propertyId: string;
  slug: string;
  token?: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface ExtractedPropertyPayload {
  title: string;
  description: string;
  price?: number;
  currency?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  builtArea?: number;
  landArea?: number;
  extras?: string[];
  images: string[];
}
