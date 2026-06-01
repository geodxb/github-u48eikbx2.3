export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Get client IP address
      const clientIP =
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For") ||
        request.headers.get("X-Real-IP") ||
        "unknown";

      // Authorized IPs
      const authorizedIPs = [
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
        "localhost",
      ];

      const isAuthorized =
        authorizedIPs.includes(clientIP) ||
        clientIP.startsWith("192.168.") ||
        clientIP.startsWith("10.") ||
        clientIP.startsWith("172.");

      // API proxy
      if (isAuthorized && pathname.startsWith("/api/")) {
        const backendURL = "https://YOUR_BACKEND_URL";

        const targetURL = `${backendURL}${pathname}${url.search}`;

        const proxyRequest = new Request(targetURL, {
          method: request.method,
          headers: request.headers,
          body:
            request.method === "GET" || request.method === "HEAD"
              ? undefined
              : request.body,
        });

        return await fetch(proxyRequest);
      }

      // Try serving requested asset first
      const assetResponse = await env.ASSETS.fetch(request);

      if (assetResponse.ok) {
        return assetResponse;
      }

      // SPA fallback
      const indexRequest = new Request(
        new URL("/index.html", request.url).toString(),
        {
          method: "GET",
        }
      );

      const indexResponse = await env.ASSETS.fetch(indexRequest);

      if (!indexResponse.ok) {
        throw new Error(
          `Failed to load index.html. Status: ${indexResponse.status}`
        );
      }

      let html = await indexResponse.text();

      if (!isAuthorized) {
        const injectionScript = `
<script>
window.ipAccessDenied = {
  status: true,
  ip: "${clientIP}",
  timestamp: "${new Date().toISOString()}"
};
</script>
`;

        html = html.replace(
          "</head>",
          `${injectionScript}</head>`
        );
      }

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("WORKER ERROR:", error);

      return new Response(
        error instanceof Error
          ? `${error.message}\n\n${error.stack ?? ""}`
          : String(error),
        {
          status: 500,
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
    }
  },
};

interface Env {
  ASSETS: Fetcher;
}