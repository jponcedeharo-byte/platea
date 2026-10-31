import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Pago completado — Platea' };

export default function PatrocinaExitoPage() {
  return (
    <div className="result-page gut">
      <div className="result-card result-card--ok">
        <span className="result-icon" aria-hidden="true">✓</span>
        <h1 className="result-titulo">¡Gracias por patrocinar Platea!</h1>
        <p className="result-desc">
          Hemos recibido tu suscripción. En breve nos pondremos en contacto contigo
          para coordinar la ubicación de tu patrocinio y los detalles de tu marca.
        </p>
        <Link href="/" className="btn btn--primary btn--lg">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
