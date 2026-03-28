/**
 * API endpoint om Turnstile site key runtime op te halen
 * Leest de key uit Cloudflare Workers runtime env (wrangler.toml [vars])
 */
export async function GET() {
  let runtimeSiteKey = '';
  try {
    const { env } = await import('cloudflare:workers');
    runtimeSiteKey = (env as Record<string, unknown>)?.PUBLIC_TURNSTILE_SITE_KEY as string || '';
  } catch {
    // Niet in Cloudflare Workers omgeving
  }
  const siteKey = runtimeSiteKey ||
                  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ||
                  '';
  
  return new Response(JSON.stringify({ siteKey }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

