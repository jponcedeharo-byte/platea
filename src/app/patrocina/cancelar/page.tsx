import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Pago cancelado — Platea' };

export default function PatrocinaCancelarPage() {
  return (
    <div className="result-page gut">
      <div className="result-card">
        <span className="result-icon" aria-hidden="true">←</span>
        <h1 className="result-titulo">Pago cancelado</h1>
        <p className="result-desc">
          No se ha realizado ningún cargo. Si tienes dudas sobre los planes de patrocinio,
          escríbenos y te ayudamos.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/patrocina" className="btn btn--primary">
            Ver planes
          </Link>
          <Link href="/" className="btn btn--ghost">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
