export default {
  async fetch(request: Request, env: any): Promise<Response> {
    return new Response(
      JSON.stringify(
        {
          envKeys: Object.keys(env || {}),
          hasAssets: !!env.ASSETS,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },
};
