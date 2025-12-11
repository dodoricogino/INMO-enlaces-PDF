import React, { useState } from "react";
import axios from "axios";

interface ExtractedData {
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

const api = axios.create({ baseURL: "/api" });

const App: React.FC = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<ExtractedData | null>(null);
  const [branding, setBranding] = useState({
    logoUrl: "https://dummyimage.com/140x60/0f766e/ffffff&text=Logo",
    primaryColor: "#0F766E",
    headerTitle: "Mi Inmobiliaria",
    headerSubtitle: "Tu próximo hogar, hoy",
    agentName: "Agente Demo",
    agentRole: "Broker Owner",
    agentPhone: "+34 600 000 000",
    agentWhatsapp: "https://wa.me/34600000000",
    agentEmail: "demo@example.com",
    agentWebsite: "https://mi-inmobiliaria.example",
  });
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [result, setResult] = useState<{ publicUrl: string; pdfUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ExtractedData>("/extract", { url });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!data) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/properties", {
        property: {
          sourceUrl: url,
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency,
          address: data.address,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          parking: data.parking,
          builtArea: data.builtArea,
          landArea: data.landArea,
          extras: { extras: data.extras || [] },
        },
        images: data.images,
        brandingOverride: branding,
        linkConfig: { expiresInDays },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header>
        <h1>Fábrica de fichas inmobiliarias</h1>
        <p>Pega la URL de un anuncio, edita los datos y genera PDF + enlace público.</p>
      </header>
      <section className="card">
        <label>URL del anuncio</label>
        <div className="row">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://examplehomes.test/listing/123" />
          <button onClick={extract} disabled={loading || !url}>
            {loading ? "Extrayendo..." : "Extraer datos"}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </section>

      {data && (
        <>
          <section className="card grid">
            <div>
              <label>Título</label>
              <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
              <label>Descripción</label>
              <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={5} />
              <label>Precio</label>
              <div className="row">
                <input
                  type="number"
                  placeholder="Precio"
                  value={data.price || ""}
                  onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
                />
                <input
                  placeholder="Moneda"
                  value={data.currency || ""}
                  onChange={(e) => setData({ ...data, currency: e.target.value })}
                />
              </div>
              <label>Dirección</label>
              <input value={data.address || ""} onChange={(e) => setData({ ...data, address: e.target.value })} />
              <div className="row">
                <input
                  type="number"
                  placeholder="Dormitorios"
                  value={data.bedrooms || ""}
                  onChange={(e) => setData({ ...data, bedrooms: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Baños"
                  value={data.bathrooms || ""}
                  onChange={(e) => setData({ ...data, bathrooms: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Cocheras"
                  value={data.parking || ""}
                  onChange={(e) => setData({ ...data, parking: Number(e.target.value) })}
                />
              </div>
              <div className="row">
                <input
                  type="number"
                  placeholder="Sup. cubierta (m²)"
                  value={data.builtArea || ""}
                  onChange={(e) => setData({ ...data, builtArea: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Sup. terreno (m²)"
                  value={data.landArea || ""}
                  onChange={(e) => setData({ ...data, landArea: Number(e.target.value) })}
                />
              </div>
              <label>Extras</label>
              <input
                value={(data.extras || []).join(", ")}
                onChange={(e) => setData({ ...data, extras: e.target.value.split(",").map((v) => v.trim()) })}
              />
            </div>
            <div>
              <label>Fotos</label>
              <div className="gallery">
                {data.images.map((img, idx) => (
                  <img key={idx} src={img} alt="foto" />
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <h3>Branding</h3>
            <div className="grid">
              <div>
                <label>Logo (URL)</label>
                <input value={branding.logoUrl} onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })} />
                <label>Color principal</label>
                <input value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
                <label>Título encabezado</label>
                <input value={branding.headerTitle} onChange={(e) => setBranding({ ...branding, headerTitle: e.target.value })} />
                <label>Subtítulo</label>
                <input value={branding.headerSubtitle} onChange={(e) => setBranding({ ...branding, headerSubtitle: e.target.value })} />
              </div>
              <div>
                <label>Nombre del agente</label>
                <input value={branding.agentName} onChange={(e) => setBranding({ ...branding, agentName: e.target.value })} />
                <label>Rol</label>
                <input value={branding.agentRole} onChange={(e) => setBranding({ ...branding, agentRole: e.target.value })} />
                <label>Teléfono</label>
                <input value={branding.agentPhone} onChange={(e) => setBranding({ ...branding, agentPhone: e.target.value })} />
                <label>WhatsApp</label>
                <input value={branding.agentWhatsapp} onChange={(e) => setBranding({ ...branding, agentWhatsapp: e.target.value })} />
                <label>Email</label>
                <input value={branding.agentEmail} onChange={(e) => setBranding({ ...branding, agentEmail: e.target.value })} />
                <label>Web</label>
                <input value={branding.agentWebsite} onChange={(e) => setBranding({ ...branding, agentWebsite: e.target.value })} />
              </div>
            </div>
            <div className="row">
              <label>Caducidad del enlace (días)</label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                style={{ maxWidth: 140 }}
              />
            </div>
          </section>

          <section className="card">
            <button onClick={save} disabled={loading}>
              {loading ? "Guardando..." : "Guardar y generar PDF + enlace"}
            </button>
            {result && (
              <div className="result">
                <p>Enlace público: <a href={result.publicUrl} target="_blank" rel="noreferrer">{result.publicUrl}</a></p>
                <p>PDF: <a href={result.pdfUrl} target="_blank" rel="noreferrer">{result.pdfUrl}</a></p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default App;
