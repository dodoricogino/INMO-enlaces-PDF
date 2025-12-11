import { ExtractedPropertyPayload } from "../../models/types.js";
import { scrapeExamplePortal } from "./portals/examplePortal.js";

const domainHandlers: Record<string, (url: string) => Promise<ExtractedPropertyPayload>> = {
  "examplehomes.test": scrapeExamplePortal,
};

export async function extractFromUrl(url: string): Promise<ExtractedPropertyPayload> {
  const { hostname } = new URL(url);
  const handler = domainHandlers[hostname];
  if (!handler) {
    throw new Error("Portal no soportado");
  }
  return handler(url);
}
