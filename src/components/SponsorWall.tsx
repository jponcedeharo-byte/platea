import Link from 'next/link';
import type { Patrocinador } from '@/lib/types';

interface SponsorWallProps {
  patrocinadores: Patrocinador[];
}

export default function SponsorWall({ patrocinadores }: SponsorWallProps) {
  if (patrocinadores.length === 0) return null;

  const estreno = patrocinadores.find((p) => p.nivel === 'estreno');
  const palcos = patrocinadores.filter((p) => p.nivel === 'palco');
  const butacas = patrocinadores.filter((p) => p.nivel === 'butaca');

  return (
    <section className="sponsor-wall" aria-labelledby="sponsor-wall-heading">
      <div className="gut">
        <header className="sponsor-wall-header">
          <span className="sponsor-wall-eyebrow">Colaboradores</span>
          <h2 id="sponsor-wall-heading" className="sponsor-wall-titulo">
            Quienes hacen Platea posible
          </h2>
        </header>

        <div className="sponsor-wall-list">
          {estreno && (
            <SponsorItem patrocinador={estreno} />
          )}
          {palcos.map((p) => (
            <SponsorItem key={p.id} patrocinador={p} />
          ))}
          {butacas.map((p) => (
            <SponsorItem key={p.id} patrocinador={p} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/patrocina" className="btn btn--ghost btn--sm">
            Patrocina la sala
          </Link>
        </div>
      </div>
    </section>
  );
}

function SponsorItem({ patrocinador }: { patrocinador: Patrocinador }) {
  const className = `sponsor-item sponsor-item--${patrocinador.nivel}`;

  if (patrocinador.enlace_web) {
    return (
      <a
        href={patrocinador.enlace_web}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {patrocinador.nombre_publico}
      </a>
    );
  }

  return (
    <span className={className}>{patrocinador.nombre_publico}</span>
  );
}
