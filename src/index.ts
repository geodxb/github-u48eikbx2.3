export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const clientIP =
      request.headers.get("CF-Connecting-IP") || "unknown";

    const authorizedIPs = new Set([
      "189.203.12.82",
      "193.186.4.212",
      "2806:2f0:74a0:c161:4dd6:d710:be4:61c8",
      "2806:2f0:74a0:c161:9d72:302a:ba4a:364e",
      "192.168.100.168",
      "2806:20:74a0:c161:c8dd:f9be:7de2:981e",
      "2806:20:74a0:c161:e07e:4cff:fe9e:77d2",
      "fe80::e07e:4cff:fe9e:77d2",
      "127.0.0.1",
      "::1",
    ]);

    const isAuthorized = authorizedIPs.has(clientIP);

    // 🔥 REAL BLOCK (THIS IS WHAT YOU WERE MISSING)
    if (!isAuthorized) {
      return new Response("ACCESS DENIED", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    // API proxy (optional)
    if (pathname.startsWith("/api/")) {
      const backendURL = "https://YOUR_BACKEND_URL";
      const targetURL = new URL(pathname + url.search, backendURL);

      return fetch(targetURL.toString(), {
        method: request.method,
        headers: request.headers,
        body:
          request.method === "GET" || request.method === "HEAD"
            ? undefined
            : request.body,
      });
    }

    // SPA assets
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    return env.ASSETS.fetch(
      new Request(new URL("/index.html", request.url), {
        method: "GET",
      })
    );
  },
};

interface Env {
  ASSETS: Fetcher;
}
