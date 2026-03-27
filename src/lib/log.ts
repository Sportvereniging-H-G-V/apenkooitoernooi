export type KVNamespace = {
  put: (key: string, value: string, options?: unknown) => Promise<void>;
  get?: (key: string) => Promise<string | null>;
  delete?: (key: string) => Promise<void>;
};

export interface CloudflareEnv {
  SUBMISSIONS?: KVNamespace;
  TURNSTILE_SECRET?: string;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
  [key: string]: unknown;
}

export async function appendJsonl(path: string, data: unknown, env?: CloudflareEnv) {
  const entry = JSON.stringify({ 
    ts: new Date().toISOString(), 
    ...data 
  });

  // Probeer Cloudflare KV te gebruiken als beschikbaar (serverless omgeving)
  if (env?.SUBMISSIONS) {
    try {
      const key = `submission-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await env.SUBMISSIONS.put(key, entry);
      return;
    } catch {
      // Log alleen error type, niet de volledige error (kan gevoelige data bevatten)
      console.error('❌ Failed to write to KV');
    }
  }

  // Probeer ook via cloudflare:workers env (Astro v6)
  try {
    const { env: cfEnv } = await import('cloudflare:workers');
    const workersEnv = cfEnv as unknown as CloudflareEnv;
    if (workersEnv?.SUBMISSIONS) {
      const key = `submission-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await workersEnv.SUBMISSIONS.put(key, entry);
      return;
    }
  } catch {
    // Niet in Cloudflare Workers omgeving
  }

  // Fallback: log alleen samenvatting zonder gevoelige data (voor development/local)
  // In productie wordt dit niet gelogd omdat KV beschikbaar is
  if (!import.meta.env.PROD && (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production')) {
    try {
      const data = JSON.parse(entry);
      // Log alleen formId en timestamp, geen persoonlijke data
      console.log('[SUBMISSION]', { 
        formId: data.formId, 
        ts: data.ts,
        // Geen email, telefoon, namen, etc.
      });
    } catch {
      // Als parsing faalt, log niets
    }
  }
}
