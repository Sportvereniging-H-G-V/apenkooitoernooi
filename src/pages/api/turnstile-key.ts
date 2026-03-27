import type { APIContext } from 'astro';
import type { CloudflareEnv } from '../../lib/log';

/**
 * API endpoint om Turnstile site key runtime op te halen
 * Dit is nodig omdat PUBLIC_* variabelen build-time worden geïnjecteerd,
 * maar voor preview environments die in GitLab CI worden gebouwd,
 * zijn Cloudflare environment variables niet beschikbaar tijdens build
 */
export async function GET({ locals }: APIContext) {
  // Probeer site key te krijgen via runtime environment
  let runtimeSiteKey: string | undefined;
  try {
    interface LocalsWithRuntime {
      runtime?: { env?: CloudflareEnv };
    }
    const env = (locals as LocalsWithRuntime | undefined)?.runtime?.env;
    runtimeSiteKey = env?.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;
  } catch {
    // Astro v6: locals.runtime.env is verwijderd
  }

  const siteKey = runtimeSiteKey ||
                  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ||
                  (typeof process !== 'undefined' ? process.env.PUBLIC_TURNSTILE_SITE_KEY : undefined) ||
                  '';
  
  return new Response(JSON.stringify({ siteKey }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

