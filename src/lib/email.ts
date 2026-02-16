interface Env {
  FREESCOUT_API_URL?: string;
  FREESCOUT_API_KEY?: string;
  FREESCOUT_MAILBOX_ID?: string;
}

/**
 * Genereert een plain text email template op basis van formulier data
 * Alles op aparte regels, geen HTML formatting
 */
function formatEmailText(data: any): string {
  const formId = data.formId || 'unknown';
  
  let text = `🐵 Nieuwe ${formId === 'team' ? 'Team' : formId === 'instuif' ? 'Instuif' : 'Contact'} Inschrijving\n`;

  // Team formulier
  if (formId === 'team') {
    text += `\n📋 Team Informatie\n`;
    text += `Teamnaam: ${data.teamnaam || 'Niet ingevuld'}\n`;
    text += `\nLeeftijdsgroep: Groep ${data.leeftijdsgroep || 'Niet ingevuld'}\n`;
    
    text += `\n👤 Contactgegevens\n`;
    text += `Contactpersoon: ${data.contactNaam || 'Niet ingevuld'}\n`;
    text += `\nE-mailadres: ${data.email || 'Niet ingevuld'}\n`;
    text += `\nTelefoonnummer: ${data.tel || 'Niet ingevuld'}\n`;
    
    text += `\n👥 Teamspelers (${data.deelnemers?.length || 0})\n`;
    const spelers = (data.deelnemers || []).map((naam: string) => naam.trim()).filter((naam: string) => naam).join(' • ');
    text += `${spelers}\n`;

    if (data.opmerkingen) {
      text += `\n💬 Opmerkingen\n`;
      text += `${data.opmerkingen}\n`;
    }
  }
  
  // Instuif formulier
  else if (formId === 'instuif') {
    text += `\n👤 Deelnemer Informatie\n`;
    text += `Naam: ${data.voornaam || ''} ${data.achternaam || ''}\n`;
    text += `Leeftijdsgroep: Groep ${data.leeftijdsgroep || 'Niet ingevuld'}\n`;
    text += `E-mailadres: ${data.email || 'Niet ingevuld'}\n`;

    if (data.medisch) {
      text += `\n🏥 Medische informatie\n`;
      text += `${data.medisch}\n`;
    }
  }
  
  // Contact formulier
  else if (formId === 'contact') {
    text += `\n👤 Contactgegevens\n`;
    text += `Naam: ${data.naam || 'Niet ingevuld'}\n`;
    text += `E-mailadres: ${data.email || 'Niet ingevuld'}\n`;
    
    text += `\n💬 Bericht\n`;
    text += `${data.bericht || 'Geen bericht'}\n`;
  }

  text += `\nDeze email is automatisch gegenereerd door het Apenkooitoernooi inschrijfsysteem.\n`;

  return text;
}

/**
 * Genereert een HTML email template op basis van formulier data
 * Met professionele styling voor betere weergave in email clients
 */
function formatEmailHtml(data: any): string {
  const formId = data.formId || 'unknown';
  const formType = formId === 'team' ? 'Team' : 'Contact';
  
  // Header - alleen body content, geen HTML document structuur (FreeScout voegt dit zelf toe)
  // Gebruik eenvoudige HTML zonder complexe inline styles voor betere FreeScout compatibiliteit
  let html = `
<div>
  <div style="background: #667eea; color: #ffffff; padding: 30px 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🐵 Nieuwe ${formType} Inschrijving</h1>
    <p style="margin: 10px 0 0 0; font-size: 14px;">Apenkooi Toernooi</p>
  </div>
`;

  // Team formulier
  if (formId === 'team') {
    html += `
  <div style="background: #ffffff; padding: 25px 20px; border-bottom: 1px solid #e5e7eb;">
    <h2 style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">📋 Team Informatie</h2>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      <strong>TEAMNAAM</strong><br>
      ${escapeHtml(data.teamnaam || 'Niet ingevuld')}
    </div>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      <strong>CATEGORIE</strong><br>
      ${escapeHtml(data.aanmelding_type && data.aanmelding_type.trim() ? data.aanmelding_type : 'Niet ingevuld')}
    </div>
  </div>

  <div style="background: #ffffff; padding: 25px 20px; border-bottom: 1px solid #e5e7eb;">
    <h2 style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">👤 Contactgegevens</h2>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      <strong>CONTACTPERSOON</strong><br>
      ${escapeHtml(data.contactpersoon || data.contactNaam || 'Niet ingevuld')}
    </div>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      <strong>E-MAILADRES</strong><br>
      <a href="mailto:${escapeHtml(data.email || '')}">${escapeHtml(data.email || 'Niet ingevuld')}</a>
    </div>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      <strong>TELEFOONNUMMER</strong><br>
      <a href="tel:${escapeHtml(data.telefoon || data.tel || '')}">${escapeHtml(data.telefoon || data.tel || 'Niet ingevuld')}</a>
    </div>
  </div>

  <div style="background: #ffffff; padding: 25px 20px; border-bottom: 1px solid #e5e7eb;">
    <h2 style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">👥 Teamspelers <span style="display: inline-block; background: #667eea; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px;">${data.deelnemers?.length || 0} spelers</span></h2>
    <ul style="margin: 10px 0; padding-left: 20px;">
${(data.deelnemers || []).map((naam: string) => `      <li style="margin: 8px 0; color: #374151;">${escapeHtml(naam.trim())}</li>`).join('\n')}
    </ul>
  </div>
`;

    if (data.opmerkingen) {
      html += `
  <div style="background: #ffffff; padding: 25px 20px; border-bottom: 1px solid #e5e7eb;">
    <h2 style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">💬 Opmerkingen</h2>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      ${escapeHtml(data.opmerkingen).replace(/\n/g, '<br>')}
    </div>
  </div>
`;
    }
  }
  
  // Contact formulier
  else if (formId === 'contact') {
    html += `
  <div style="background: #ffffff; padding: 25px 20px; border-bottom: 1px solid #e5e7eb;">
    <h2 style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">👤 Contactgegevens</h2>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      <strong>NAAM</strong><br>
      ${escapeHtml(data.naam || 'Niet ingevuld')}
    </div>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      <strong>E-MAILADRES</strong><br>
      <a href="mailto:${escapeHtml(data.email || '')}">${escapeHtml(data.email || 'Niet ingevuld')}</a>
    </div>
  </div>

  <div style="background: #ffffff; padding: 25px 20px; border-bottom: 1px solid #e5e7eb;">
    <h2 style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">💬 Bericht</h2>
    <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-left: 3px solid #667eea;">
      ${escapeHtml(data.bericht || 'Geen bericht').replace(/\n/g, '<br>')}
    </div>
  </div>
`;
  }

  // Footer
  html += `
  <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0; font-size: 12px; color: #6b7280;">
      Deze email is automatisch gegenereerd door het Apenkooi Toernooi inschrijfsysteem.<br>
      Inschrijving ontvangen op ${new Date().toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}
    </p>
  </div>
</div>
`;

  return html;
}

/**
 * Escaped HTML om XSS te voorkomen
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Verstuurt een conversatie naar FreeScout via de API
 */
async function sendToFreeScout(
  subject: string,
  html: string,
  customerEmail: string,
  env?: Env,
  text?: string
): Promise<boolean> {
  const mailEnv = env || process.env;
  const apiUrl = mailEnv.FREESCOUT_API_URL;
  const apiKey = mailEnv.FREESCOUT_API_KEY;
  const mailboxId = mailEnv.FREESCOUT_MAILBOX_ID;

  if (!apiUrl || !apiKey || !mailboxId || !customerEmail) {
    // Alleen loggen welke configuratie ontbreekt, niet de waarden zelf
    const missing = [];
    if (!apiUrl) missing.push('FREESCOUT_API_URL');
    if (!apiKey) missing.push('FREESCOUT_API_KEY');
    if (!mailboxId) missing.push('FREESCOUT_MAILBOX_ID');
    if (!customerEmail) missing.push('customerEmail');
    console.error('❌ FreeScout configuratie incompleet:', missing.join(', '));
    return false;
  }

  try {
    // Gebruik plain text parameter (moet altijd worden meegegeven)
    const plainText = text || '';
    
    // Valideer configuratie (dubbele check, maar dit zou niet moeten gebeuren)
    if (!apiUrl || !apiKey || !mailboxId) {
      console.error('❌ FreeScout configuratie incompleet');
      return false;
    }
    
    const url = `${apiUrl.replace(/\/$/, '')}/api/conversations`;
    
    // FreeScout API: 'text' is verplicht, 'body' is optioneel voor HTML content
    // Gebruik HTML in text parameter voor betere weergave (FreeScout ondersteunt HTML in text)
    const requestBody = {
      type: 'email',
      mailboxId: Number(mailboxId),
      subject: subject,
      customer: {
        email: customerEmail,
      },
      threads: [
        {
          type: 'customer',
          text: html, // HTML versie als primaire content (FreeScout ondersteunt HTML in text)
          body: html, // HTML versie ook in body voor compatibiliteit
          imported: false,
        },
      ],
    };
    
    // Valideer dat HTML niet leeg is
    if (!html || html.trim().length === 0) {
      console.error('❌ FreeScout: HTML content is leeg');
      return false;
    }
    
    // Probeer verschillende authenticatie methoden als fallback
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-FreeScout-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Als 403 met header, probeer GET parameter
    if (response.status === 403) {
      const urlWithKey = `${url}?api_key=${encodeURIComponent(apiKey)}`;
      response = await fetch(urlWithKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    }

    // Als nog steeds 403, probeer HTTP Basic Auth
    if (response.status === 403) {
      const basicAuth = btoa(`${apiKey}:`);
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    }

    if (!response.ok) {
      // Log alleen status code, geen response body (kan gevoelige data bevatten)
      console.error('❌ FreeScout API error:', response.status);
      return false;
    }

    return true;
  } catch (err) {
    // Log alleen error type, niet de volledige error (kan gevoelige data bevatten)
    console.error('❌ FreeScout API request failed');
    return false;
  }
}

/**
 * Verstuurt een email via FreeScout API
 * @param subject - Email onderwerp
 * @param data - Formulier data object (wordt automatisch geformatteerd naar HTML)
 * @param customerEmail - Het e-mailadres van de klant (verplicht)
 * @param env - Environment variabelen
 * @returns true als email verzonden is, false als het niet gelukt is
 */
export async function sendMail(
  subject: string,
  data: any,
  customerEmail: string,
  env?: Env
): Promise<boolean> {
  // Genereer zowel plain text als HTML versies
  const text = formatEmailText(data);
  const html = formatEmailHtml(data);
  // Verstuur via FreeScout API (gebruik text als primaire versie, html als fallback)
  const sent = await sendToFreeScout(subject, html, customerEmail, env, text);
  if (sent) {
    return true;
  }

  return false;
}
