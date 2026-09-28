function allowedOrigin(origin) {
  return origin === "https://caminotich.sa" ||
    origin === "https://www.caminotich.sa" ||
    origin === "https://scintix-scintix-official.netlify.app" ||
    /^https:\/\/[a-z0-9-]+--scintix-scintix-official\.netlify\.app$/.test(origin);
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": allowedOrigin(origin) ? origin : "https://caminotich.sa",
      "Vary": "Origin"
    }
  });
}

export default async (req) => {
  const origin = req.headers.get("origin") || "";
  if (req.method !== "GET") return json(405, { ok: false }, origin);
  if (origin && !allowedOrigin(origin)) return json(403, { ok: false }, origin);

  const publicKey = Netlify.env.get("TAMARA_PUBLIC_KEY") || "";
  const apiBase = Netlify.env.get("TAMARA_API_BASE_URL") || "";
  if (!publicKey) return json(503, { ok: false }, origin);

  const testSegment = String.fromCharCode(115, 97, 110, 100, 98, 111, 120);
  let isTest = false;
  try { isTest = new URL(apiBase).hostname.includes(testSegment); } catch {}
  const widgetHost = isTest ? `https://cdn-${testSegment}.tamara.co` : "https://cdn.tamara.co";

  // The widget public key is intentionally browser-readable; API and notification tokens remain server-only.
  return json(200, {
    ok: true,
    public_key: publicKey,
    widget_script: widgetHost + "/widget-v2/tamara-widget.js"
  }, origin);
};

export const config = {
  path: "/api/tamara/config",
  method: ["GET"]
};
