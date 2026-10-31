import type { Config } from '@netlify/functions';

// Función programada: llama al auto-descubridor cada lunes a las 5:00 UTC
export default async function handler() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const cronSecret = process.env.CRON_SECRET;

  if (!siteUrl || !cronSecret) {
    console.error('[cron-descubrir] Faltan variables NEXT_PUBLIC_SITE_URL o CRON_SECRET');
    return;
  }

  try {
    const res = await fetch(`${siteUrl}/api/cron/descubrir`, {
      method: 'GET',
      headers: { 'x-cron-secret': cronSecret },
    });

    if (!res.ok) {
      console.error('[cron-descubrir] Error HTTP:', res.status, await res.text());
      return;
    }

    const data = await res.json();
    console.log('[cron-descubrir] Completado:', data);
  } catch (err) {
    console.error('[cron-descubrir] Error de red:', err);
  }
}

export const config: Config = {
  schedule: '0 5 * * 1', // Cada lunes a las 5:00 UTC
};
