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
  const environment = Netlify.env.get("TAMARA_ENVIRONMENT") || "sandbox";
  if (!publicKey) return json(503, { ok: false }, origin);

  // The widget public key is intentionally browser-readable; API and notification tokens remain server-only.
  return json(200, { ok: true, public_key: publicKey, environment }, origin);
};

export const config = {
  path: "/api/tamara/config",
  method: ["GET"]
};
