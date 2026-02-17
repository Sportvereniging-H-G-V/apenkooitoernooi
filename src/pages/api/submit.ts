import type { APIContext } from 'astro';
import { teamForm, contactForm } from '../../lib/validators';
import { rateLimit } from '../../lib/rateLimit';
import { appendJsonl, type CloudflareEnv } from '../../lib/log';
import { verifyCaptcha } from '../../lib/captcha';
import { sendMail } from '../../lib/email';

export async function POST({ request, redirect, locals }: APIContext) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('cf-connecting-ip') || 
             'local';
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Te veel verzoeken. Wacht even en probeer het later opnieuw.' }), { 
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const form = await request.formData();
  const honeypot = form.get('company') as string | null;
  if (honeypot) return new Response('OK', { status: 200 });

  type FormPayload = Record<string, string>;
  const entries = Array.from(form.entries()).map(([key, value]) => [
    key,
    typeof value === 'string' ? value : value.toString(),
  ]);
  const payload = Object.fromEntries(entries) as FormPayload;
  const token =
    payload['cf-turnstile-response'] ||
    (form.get('cf-turnstile-response') as string | null);
  
  // Cloudflare environment variabelen - correct voor Cloudflare Pages Functions
  // Astro Cloudflare adapter maakt env beschikbaar via locals.runtime.env
  interface LocalsWithRuntime {
    runtime?: { env?: CloudflareEnv };
  }
  const runtimeEnv = (locals as LocalsWithRuntime | undefined)?.runtime?.env;
  const env = runtimeEnv;
  
  // Voor Cloudflare Pages Functions: env is direct beschikbaar via runtime.env
  // Fallback naar process.env voor local development
  const turnstileSecret =
    (typeof env?.TURNSTILE_SECRET === 'string' ? env.TURNSTILE_SECRET : undefined) ??
    process.env.TURNSTILE_SECRET;
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Captcha token ontbreekt. Zorg ervoor dat de captcha is geladen en probeer het opnieuw.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!turnstileSecret) {
    return new Response(JSON.stringify({ error: 'Captcha configuratie fout. Neem contact op met de beheerder.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const ok = await verifyCaptcha(token, turnstileSecret);
  if (!ok) {
    return new Response(JSON.stringify({ error: 'Captcha verificatie gefaald. Probeer het opnieuw.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let parsed;
  if (payload.formId === 'team') {
    // Transform formulier data naar validator formaat
    // Map aanmelding_type naar leeftijdsgroep
    let leeftijdsgroep: '4-5' | '6' | '7-8' = '6'; // default
    if (payload.aanmelding_type) {
      const aanmeldingType = payload.aanmelding_type.toLowerCase();
      if (aanmeldingType.includes('groep 4, 5 en 6') || aanmeldingType.includes('groep 4,5 en 6')) {
        leeftijdsgroep = '4-5';
      } else if (aanmeldingType.includes('groep 6, 7 en 8') || aanmeldingType.includes('groep 6,7 en 8')) {
        // Groep 6, 7 en 8 - gebruik '7-8' als default, of '6' als alleen groep 6
        leeftijdsgroep = '7-8';
      }
    }
    
    // Parse teamspelers uit 8 aparte input velden
    const deelnemers: string[] = [];
    
    // Speler 1-6 zijn verplicht
    for (let i = 1; i <= 6; i++) {
      const speler = payload[`speler${i}`]?.trim();
      if (speler && speler.length >= 2) {
        deelnemers.push(speler);
      }
    }
    
    // Speler 7-10 zijn optioneel
    for (let i = 7; i <= 10; i++) {
      const speler = payload[`speler${i}`]?.trim();
      if (speler && speler.length >= 2) {
        deelnemers.push(speler);
      }
    }
    
    // Opmerkingen zijn nu een apart veld
    const opmerkingenText = payload.opmerkingen?.trim() || '';
    
    parsed = teamForm.safeParse({ 
      formId: 'team',
      teamnaam: payload.teamnaam || '',
      contactNaam: payload.contactpersoon || '',
      contactpersoon: payload.contactpersoon || '',
      email: payload.email || '',
      tel: payload.telefoon || '',
      telefoon: payload.telefoon || '',
      leeftijdsgroep: leeftijdsgroep,
      aanmelding_type: payload.aanmelding_type || '',
      deelnemers: deelnemers,
      opmerkingen: opmerkingenText || payload.opmerkingen || undefined,
      agree: true // Automatisch true omdat voorwaarden tekst al in formulier staat
    });
  } else if (payload.formId === 'contact') {
    parsed = contactForm.safeParse({
      ...payload,
      agree: payload.agree === 'true' || payload.agree === true || payload.agree === 'on' ? true : false
    });
  } else {
    return new Response(JSON.stringify({ error: 'Ongeldig formulier type.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Validatie gefaald', details: parsed.error.flatten() }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Gebruik Cloudflare environment voor logging
  await appendJsonl('./submissions.jsonl', { ip, ...parsed.data }, env);
  
  // Bepaal email onderwerp op basis van formulier type
  let emailSubject = '';
  if (parsed.data.formId === 'contact') {
    emailSubject = 'Apenkooitoernooi - Nieuw contactformulier ingevuld';
  } else if (parsed.data.formId === 'team') {
    emailSubject = 'Apenkooitoernooi - Nieuwe team inschrijving';
  } else {
    emailSubject = `Apenkooitoernooi - Inzending ${parsed.data.formId}`;
  }
  
  // Probeer email te verzenden (email is altijd aanwezig omdat het verplicht is in alle formulieren)
  const emailSent = await sendMail(
    emailSubject,
    parsed.data,
    parsed.data.email,
    env
  );

  // Voor contactformulier: geef JSON response in plaats van redirect
  if (parsed.data.formId === 'contact') {
    if (!emailSent) {
      return new Response(JSON.stringify({ error: 'Er is een fout opgetreden bij het verzenden van je bericht. Probeer het later opnieuw.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: true, message: 'Je bericht is succesvol verzonden! We nemen zo snel mogelijk contact met je op.' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Voor andere formulieren: redirect naar bedankt pagina
  if (!emailSent) {
    return redirect('/bedankt?email_error=true', 303);
  }

  return redirect('/bedankt', 303);
}
