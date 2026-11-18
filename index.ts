const ENDPOINT = "https://api.anysearch.com/v1/search";

export const AnySearchPlugin = async () => ({
  search: {
    anysearch: {
      name: "AnySearch",
      keysURL: "https://www.anysearch.com/",
      keyOptional: false,
      url: false,
      async execute({ query, count, key }: { query: string; count: number; key: string }, ctx: { abort: AbortSignal }) {
        const r = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, max_results: count || 6 }),
          signal: ctx.abort,
        });
        const text = await r.text();
        if (!r.ok) {
          throw Object.assign(new Error(text.slice(0, 500)), { status: r.status });
        }
        let body: any;
        try {
          body = JSON.parse(text);
        } catch {
          throw new Error(`AnySearch returned invalid JSON: ${text.slice(0, 300)}`);
        }
        if (body?.code !== 0 || !Array.isArray(body?.data?.results)) {
          throw new Error(`AnySearch returned invalid response: ${text.slice(0, 300)}`);
        }
        return body.data.results.map((x: any) => ({
          title: String(x.title ?? ""),
          url: String(x.url ?? ""),
          text: String(x.content || x.snippet || ""),
        }));
      },
    },
  },
});
