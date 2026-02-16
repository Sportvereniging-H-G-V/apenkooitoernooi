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
    } catch (e) {
      // Log alleen error type, niet de volledige error (kan gevoelige data bevatten)
      console.error('❌ Failed to write to KV');
    }
  }

  // Probeer ook via Astro.locals.runtime.env (Cloudflare adapter)
  try {
    interface RuntimeGlobal {
      runtime?: { env?: CloudflareEnv };
    }

    const runtimeEnv = (globalThis as RuntimeGlobal).runtime?.env;
    if (runtimeEnv?.SUBMISSIONS) {
      const key = `submission-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await runtimeEnv.SUBMISSIONS.put(key, entry);
      return;
    }
  } catch {
    // Ignore
  }

  // Fallback: log alleen samenvatting zonder gevoelige data (voor development/local)
  // In productie wordt dit niet gelogd omdat KV beschikbaar is
  if (process.env.NODE_ENV !== 'production') {
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
