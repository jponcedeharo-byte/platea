'use client';

import { useState } from 'react';

interface Plan {
  id: 'butaca' | 'palco' | 'estreno';
  nombre: string;
  precio: string;
  descripcion: string;
  ventajas: string[];
  icono: string;
  destacado?: boolean;
}

const PLANES: Plan[] = [
  {
    id: 'butaca',
    nombre: 'Butaca',
    precio: '49 €/mes',
    descripcion: 'Tu marca en la pared de patrocinadores y en una página de género.',
    icono: '⬛',
    ventajas: [
      'Logo y enlace en la sección Patrocinadores',
      'Mención en la página de un género',
      'Factura mensual',
    ],
  },
  {
    id: 'palco',
    nombre: 'Palco',
    precio: '149 €/mes',
    descripcion: 'Presencia destacada en una colección de películas.',
    icono: '◈',
    ventajas: [
      'Todo lo de Butaca',
      '«Presentada por» en una colección completa',
      'Logo más grande en Patrocinadores',
      'Mención en redes sociales al inicio del mes',
    ],
    destacado: true,
  },
  {
    id: 'estreno',
    nombre: 'Gran Estreno',
    precio: '399 €/mes',
    descripcion: 'Tu marca en el Billboard principal. La máxima visibilidad.',
    icono: '✦',
    ventajas: [
      'Todo lo de Palco',
      '«Presentada por» en el Billboard destacado',
      'Mención en todas las fichas de película',
      'Reporte mensual de impresiones',
      'Soporte prioritario',
    ],
  },
];

export default function PatrocinaClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago. Inténtalo de nuevo.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('No se pudo conectar con el servidor de pagos.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="patron-page gut">
      <div className="patron-hero">
        <span className="row-eyebrow">Colaboración</span>
        <h1 className="patron-titulo">Patrocina Platea</h1>
        <span className="patron-titulo-linea" aria-hidden="true" />
        <p className="patron-subtitulo">
          Platea es gratuita para los espectadores. Se financia exclusivamente por
          patrocinadores que creen en el cine clásico como cultura abierta.
          Sin publicidad intrusiva. Sin interrupciones.
        </p>
      </div>

      {error && (
        <div className="patron-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <div className="patron-planes">
        {PLANES.map((plan) => (
          <article
            key={plan.id}
            className={`patron-plan patron-plan--${plan.id}${plan.destacado ? ' patron-plan--destacado' : ''}`}
          >
            {plan.destacado && (
              <span className="patron-badge">Más popular</span>
            )}
            <span className="patron-plan-icono" aria-hidden="true">{plan.icono}</span>
            <h2 className="patron-plan-nombre">{plan.nombre}</h2>
            <p className="patron-plan-precio">{plan.precio}</p>
            <p className="patron-plan-desc">{plan.descripcion}</p>
            <ul className="patron-ventajas">
              {plan.ventajas.map((v) => (
                <li key={v}>
                  <span aria-hidden="true">✓</span> {v}
                </li>
              ))}
            </ul>
            <button
              className={`btn btn--lg${plan.destacado ? ' btn--lamp' : ' btn--ghost'}`}
              onClick={() => handleCheckout(plan.id)}
              disabled={loading !== null}
              aria-busy={loading === plan.id}
            >
              {loading === plan.id ? 'Redirigiendo…' : 'Empezar'}
            </button>
          </article>
        ))}
      </div>

      <section className="patron-info">
        <h2>Preguntas frecuentes</h2>
        <dl className="patron-faq">
          <dt>¿Cómo funciona el pago?</dt>
          <dd>
            Usamos Stripe, el sistema de pagos utilizado por millones de empresas.
            El pago es mensual y puedes cancelar en cualquier momento desde tu portal de cliente.
          </dd>
          <dt>¿Puedo elegir qué género o colección patrocinar?</dt>
          <dd>
            Sí. Una vez completado el pago, nos ponemos en contacto contigo para asignar
            tu patrocinio al género o colección que prefieras según tu plan.
          </dd>
          <dt>¿Los patrocinadores aparecen dentro del reproductor de vídeo?</dt>
          <dd>
            No. Los patrocinadores nunca se muestran encima ni dentro del reproductor.
            Su presencia es siempre en la página, fuera del contenido de vídeo.
          </dd>
          <dt>¿Qué pasa si quiero cancelar?</dt>
          <dd>
            Puedes cancelar en cualquier momento desde tu portal de cliente de Stripe.
            La presencia se mantiene hasta el fin del período ya pagado.
          </dd>
        </dl>
      </section>
    </div>
  );
}
