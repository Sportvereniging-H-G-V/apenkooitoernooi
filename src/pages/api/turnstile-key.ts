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
  interface LocalsWithRuntime {
    runtime?: { env?: CloudflareEnv };
  }
  const env = (locals as LocalsWithRuntime | undefined)?.runtime?.env;
  
  // Voor Cloudflare Pages: env variabelen zijn beschikbaar via runtime.env
  // PUBLIC_* variabelen zijn ook beschikbaar in runtime.env voor Cloudflare Pages
  // Voor lokale development: check ook process.env
  const siteKey = env?.PUBLIC_TURNSTILE_SITE_KEY || 
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

