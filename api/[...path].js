export default async function handler(req, res) {
  const backendUrl = (process.env.BACKEND_URL || process.env.PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

  if (!backendUrl) {
    return res.status(500).json({
      error: "BACKEND_URL environment variable is not configured in Vercel.",
      hint: "Add BACKEND_URL in Vercel Dashboard -> Project Settings -> Environment Variables."
    });
  }

  const { path } = req.query;
  const subPath = Array.isArray(path) ? path.join("/") : (path || "");
  const targetUrl = `${backendUrl}/${subPath}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;

    const options = {
      method: req.method,
      headers,
      redirect: "follow"
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      options.body = typeof req.body === "object" ? JSON.stringify(req.body) : req.body;
      if (typeof req.body === "object" && !headers["content-type"]) {
        options.headers["content-type"] = "application/json";
      }
    }

    const backendRes = await fetch(targetUrl, options);
    const setCookie = backendRes.headers.raw?.()["set-cookie"] || backendRes.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

    const contentType = backendRes.headers.get("content-type") || "application/json";
    res.setHeader("content-type", contentType);

    const data = await backendRes.arrayBuffer();
    return res.status(backendRes.status).send(Buffer.from(data));
  } catch (err) {
    return res.status(502).json({
      error: "Failed to connect to backend server.",
      details: err.message,
      targetUrl
    });
  }
}
