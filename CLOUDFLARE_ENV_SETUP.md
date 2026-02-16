# Cloudflare Pages Environment Variabelen Setup

## 📍 Waar instellen?

⚠️ **BELANGRIJK**: Als je project meldt dat environment variabelen via `wrangler.toml` worden beheerd, dan moet je:

1. **Publieke variabelen** (zoals `PUBLIC_TURNSTILE_SITE_KEY`) → Voeg toe aan `wrangler.toml` onder `[vars]`
2. **Secrets** (zoals `TURNSTILE_SECRET`) → Gebruik het **Cloudflare Dashboard** → Settings → Environment Variables → **Secrets** tab

Als je project zegt "Only Secrets can be managed via the Dashboard", gebruik dan de onderstaande instructies.

## 🚀 Stap-voor-stap instructies

### Optie A: Via wrangler.toml (als je project dit vereist)

#### 1. Publieke variabelen in wrangler.toml
Open `wrangler.toml` en voeg toe onder `[vars]`:

```toml
[vars]
PUBLIC_TURNSTILE_SITE_KEY = "your_turnstile_site_key_here"
FREESCOUT_API_URL = "https://your-freescout-instance.com"
FREESCOUT_MAILBOX_ID = "1"
```

#### 2. Secrets via Dashboard
1. Ga naar [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → Je project → **Settings**
3. Scroll naar **Environment Variables** → Klik op **Secrets** tab
4. Klik **Add secret** en voeg toe:
   - `TURNSTILE_SECRET` → [Je Turnstile Secret Key]
   - `FREESCOUT_API_KEY` → [Je FreeScout API Key]

### Optie B: Via Dashboard (als je project dit toestaat)

Als je project **niet** zegt dat variabelen via wrangler.toml worden beheerd:

1. Ga naar [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → Je project → **Settings**
3. Scroll naar **Environment Variables**
4. Klik **Add variable** en voeg toe (één voor één):
   - `PUBLIC_TURNSTILE_SITE_KEY` (Production)
   - `TURNSTILE_SECRET` (Production) - of gebruik Secrets tab
   - `FREESCOUT_API_URL` (Production)
   - `FREESCOUT_API_KEY` (Production) - of gebruik Secrets tab
   - `FREESCOUT_MAILBOX_ID` (Production)

## 📝 Welke variabelen zijn nodig?

### Vereist (minimaal):
- ✅ `PUBLIC_TURNSTILE_SITE_KEY` - Voor Turnstile captcha
- ✅ `TURNSTILE_SECRET` - Voor Turnstile verificatie

### Aanbevolen:
- ✅ `FREESCOUT_API_URL` - Voor e-mail via FreeScout
- ✅ `FREESCOUT_API_KEY` - Voor FreeScout authenticatie
- ✅ `FREESCOUT_MAILBOX_ID` - FreeScout mailbox ID

### Optioneel (fallback):
- `MAIL_HOST` - SMTP host (alleen als FreeScout niet werkt)
- `MAIL_PORT` - SMTP port
- `MAIL_USER` - SMTP username
- `MAIL_PASS` - SMTP password
- `MAIL_FROM` - Afzender e-mailadres

## ⚠️ Belangrijk

1. **PUBLIC_ prefix**: Variabelen die beginnen met `PUBLIC_` zijn zichtbaar in de frontend (browser). Gebruik deze alleen voor publieke keys.
2. **Secret keys**: Variabelen zonder `PUBLIC_` zijn alleen beschikbaar in server-side code (API routes).
3. **Herdeploy**: Na het toevoegen van variabelen moet je mogelijk een nieuwe deployment triggeren om de wijzigingen actief te maken.

## 🔍 Controleren of variabelen werken

1. Ga naar **Functions** tab in je Cloudflare Pages project
2. Klik op **Real-time Logs**
3. Probeer een formulier te versturen
4. Controleer de logs voor errors of waarschuwingen over ontbrekende variabelen

## 🆘 Troubleshooting

### Bericht: "Environment variables are being managed through wrangler.toml"
- ✅ Dit is correct! Voeg publieke variabelen toe aan `wrangler.toml` onder `[vars]`
- ✅ Gebruik **Secrets** tab in Dashboard voor gevoelige variabelen (`TURNSTILE_SECRET`, `FREESCOUT_API_KEY`)

### Variabelen werken niet na toevoegen
1. Trigger een nieuwe deployment (push naar Git of klik "Retry deployment")
2. Controleer of je de juiste environment hebt geselecteerd (Production vs Preview)
3. Check de logs in Real-time Logs

### Preview environments - BELANGRIJK!
⚠️ **Preview environments hebben aparte environment variables nodig!**

In Cloudflare Pages worden Preview deployments (van merge requests) beschouwd als een aparte environment. Je moet de environment variables **ook** instellen voor Preview:

1. Ga naar **Workers & Pages** → Je project → **Settings** → **Environment Variables**
2. Klik op **"Add variable"** of **"Add secret"**
3. **Selecteer "Preview"** in plaats van "Production"
4. Voeg dezelfde variabelen toe als voor Production:
   - `PUBLIC_TURNSTILE_SITE_KEY` (Preview)
   - `TURNSTILE_SECRET` (Preview) - via Secrets tab
   - Andere variabelen indien nodig

**Of via wrangler.toml voor preview:**
Als je `wrangler.toml` gebruikt, voeg dan een `[env.preview]` sectie toe:

```toml
[vars]
PUBLIC_TURNSTILE_SITE_KEY = "your_production_key"

[env.preview]
[vars]
PUBLIC_TURNSTILE_SITE_KEY = "your_preview_key"
```

**Voor Secrets in Preview:**
Secrets moeten apart worden ingesteld via Dashboard → Settings → Environment Variables → Secrets tab → Selecteer "Preview" → Add secret

### Turnstile werkt niet

#### "Captcha token ontbreekt" foutmelding

Dit betekent meestal dat **het domein niet is geconfigureerd in Turnstile**. Turnstile genereert alleen tokens voor domeinen die zijn toegevoegd aan je Turnstile site configuratie.

**Oplossing:**

1. Ga naar [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Security** → **Turnstile**
2. Klik op je Turnstile site (of maak een nieuwe aan)
3. Scroll naar **"Domains"** sectie
4. Voeg **alle preview domeinen toe**:
   - Bijvoorbeeld: `*.pages.dev` (voor alle Cloudflare Pages previews)
   - Of specifiek: `your-project-name.pages.dev`
   - Of het specifieke preview URL patroon dat GitLab gebruikt
5. Klik **"Save"**

**Voor GitLab preview deployments:**
GitLab preview URLs hebben meestal een patroon zoals:
- `your-project-name-<hash>.pages.dev`
- Of een custom preview URL

Je kunt ook een wildcard gebruiken: `*.pages.dev` om alle Cloudflare Pages previews toe te staan.

**Andere checks:**
1. Controleer of `PUBLIC_TURNSTILE_SITE_KEY` correct is ingesteld (ook voor Preview)
2. Controleer of `TURNSTILE_SECRET` correct is ingesteld (ook voor Preview)
3. Check de browser console voor Turnstile errors
4. Check de Cloudflare Real-time Logs voor server-side errors

