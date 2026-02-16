/**
 * Verifieert een Cloudflare Turnstile token
 */
export async function verifyCaptcha(
  token: string | undefined,
  secret?: string
) {
  if (!token || !secret) {
    return false;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secret,
          response: token,
        }),
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}
