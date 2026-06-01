export interface Env {
  ASSETS: Fetcher;
}

const backendURL = "https://YOUR_BACKEND_URL";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // API proxy
    if (pathname.startsWith("/api/")) {
      const target = new URL(pathname + url.search, backendURL);

      return fetch(target.toString(), {
        method: request.method,
        headers: request.headers,
        body:
          request.method === "GET" || request.method === "HEAD"
            ? undefined
            : request.body,
      });
    }

    // Static assets
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    // SPA fallback (React Router support)
    return env.ASSETS.fetch(
      new Request(new URL("/index.html", request.url), {
        method: "GET",
      })
    );
  },
};
