import Link from 'next/link';
import type { Patrocinador } from '@/lib/types';
import SponsorWall from './SponsorWall';

interface FooterProps {
  patrocinadores: Patrocinador[];
}

const FILM_STRIP_CELLS = Array.from({ length: 20 });

export default function Footer({ patrocinadores }: FooterProps) {
  return (
    <footer className="site-footer">
      {/* Muro de patrocinadores */}
      {patrocinadores.length > 0 && (
        <SponsorWall patrocinadores={patrocinadores} />
      )}

      {/* Cuerpo del footer */}
      <div className="gut">
        <div className="footer-inner">
          {/* Columna izquierda: marca */}
          <div className="footer-brand">
            <Link href="/" className="logo">
              Platea<span className="logo-dot">.</span>
            </Link>
            <p className="footer-tagline">
              Cine clásico de dominio público.<br />
              Gratuito, legal y sin interrupciones.
            </p>
          </div>

          {/* Columnas de enlaces */}
          <nav className="footer-links" aria-label="Mapa del sitio">
            <div className="footer-col">
              <span className="footer-col-titulo">Descubrir</span>
              <Link href="/genero" className="footer-link">Géneros</Link>
              <Link href="/buscar" className="footer-link">Buscar</Link>
              <Link href="/mi-lista" className="footer-link">Mi lista</Link>
            </div>
            <div className="footer-col">
              <span className="footer-col-titulo">Platea</span>
              <Link href="/patrocina" className="footer-link">Patrocina</Link>
              <Link href="/legal/derechos" className="footer-link">Derechos</Link>
              <Link href="/legal/privacidad" className="footer-link">Privacidad</Link>
            </div>
          </nav>
        </div>

        {/* Perforado de película */}
        <div className="footer-film-strip" aria-hidden="true">
          {FILM_STRIP_CELLS.map((_, i) => (
            <span key={i} />
          ))}
        </div>

        {/* Pie: copyright + nota legal + links legales */}
        <p className="footer-notice">
          Solo vídeos legales. Platea no fomenta la piratería. Enlazamos únicamente películas
          de dominio público o publicadas por sus titulares en sus canales oficiales. Si ves
          algo que no debería estar aquí, avísanos desde la ficha de la película y la retiramos.
        </p>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} Platea · Lacinia Estudio
          </p>
          <nav className="footer-legal-links" aria-label="Páginas legales">
            <Link href="/legal/derechos">Política de derechos</Link>
            <Link href="/legal/privacidad">Privacidad</Link>
            <Link href="/legal/aviso-legal">Aviso legal</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
