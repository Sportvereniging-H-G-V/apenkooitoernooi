# Apenkooitoernooi

Website voor [apenkooitoernooi.nl](https://apenkooitoernooi.nl) — een snelle, toegankelijke statische site zonder CMS. Content wordt beheerd via JSON-bestanden in de repository.

## Gebouwd met

- [Astro 5](https://astro.build/) met server-side rendering
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Zod](https://zod.dev/) voor formuliervalidatie
- [Cloudflare Pages](https://pages.cloudflare.com/) voor hosting en serverless functions
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) voor captchaverificatie
- [FreeScout](https://freescout.net/) voor e-mailafhandeling via API
- [Vitest](https://vitest.dev/) voor tests

## Aan de slag

### Vereisten

- Node.js 20 of hoger
- npm

### Installatie

```bash
npm install
```

### Omgevingsvariabelen

Kopieer het voorbeeldbestand en vul de waarden in:

```bash
cp env.example .env
```

| Variabele | Beschrijving |
|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (publiek) |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key |
| `FREESCOUT_API_URL` | URL van de FreeScout-instantie |
| `FREESCOUT_API_KEY` | FreeScout API-sleutel |
| `FREESCOUT_MAILBOX_ID` | FreeScout mailbox-ID voor inkomende formulieren |

### Development

```bash
npm run dev
```

De development server draait standaard op `http://localhost:4321`.

## Scripts

| Commando | Beschrijving |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Bouw voor productie |
| `npm run preview` | Preview de productiebuild lokaal |
| `npm run lint` | Voer ESLint uit |
| `npm test` | Voer tests uit |

## Projectstructuur

```
├── src/
│   ├── components/     # Herbruikbare Astro-componenten
│   ├── layouts/        # Pagina-layouts
│   ├── lib/            # Hulpfuncties (validatie, logging, e-mail)
│   ├── pages/          # Pagina's en API-routes
│   └── styles/         # Globale CSS
├── content/            # JSON-bestanden met paginacontent
├── public/             # Statische bestanden (afbeeldingen, fonts)
├── wrangler.toml       # Cloudflare Pages-configuratie
└── astro.config.mjs    # Astro-configuratie
```

### Content beheren

Paginacontent staat in JSON-bestanden onder `/content/`:

| Bestand | Inhoud |
|---|---|
| `site.json` | Algemene siteconfiguratie |
| `home.json` | Homepage |
| `spelregels.json` | Spelregels |
| `faq.json` | Veelgestelde vragen |
| `contact.json` | Contactgegevens |
| `voorwaarden.json` | Algemene voorwaarden |

## Deployment

De site wordt gehost op Cloudflare Pages. De CI/CD-pipeline voert automatisch tests, linting en typecontrole uit, bouwt de site en deployt naar Cloudflare Pages. Voor pull requests wordt een preview-omgeving aangemaakt.

### Handmatig deployen

```bash
npm run build
npx wrangler pages deploy dist --project-name <projectnaam>
```

## Beveiliging

- Rate limiting (10 verzoeken per minuut per IP)
- Honeypot-veld tegen spambots
- Cloudflare Turnstile-verificatie op alle formulieren
- Zod-validatie op server-side API-routes
