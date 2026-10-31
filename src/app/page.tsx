import Billboard from '@/components/Billboard';
import FilmRow from '@/components/FilmRow';
import SponsorWall from '@/components/SponsorWall';
import {
  getDestacadas,
  getColecciones,
  getPeliculasPorColeccion,
  getPatrocinadores,
  getGranEstreno,
  getPatrocinadorPorColeccion,
} from '@/lib/data';

export default function HomePage() {
  const destacadas = getDestacadas();
  const colecciones = getColecciones();
  const patrocinadores = getPatrocinadores();
  const granEstreno = getGranEstreno();

  return (
    <>
      {/* Billboard de películas destacadas */}
      <Billboard films={destacadas} granEstreno={granEstreno} />

      {/* Filas por colección */}
      <div style={{ paddingBottom: 'clamp(24px, 4vw, 48px)' }}>
        {colecciones.map((col) => {
          const films = getPeliculasPorColeccion(col.slug);
          if (films.length === 0) return null;
          const sponsor = getPatrocinadorPorColeccion(col.slug);
          return (
            <FilmRow
              key={col.id}
              titulo={col.nombre}
              films={films}
              patrocinador={sponsor}
            />
          );
        })}
      </div>

      {/* Muro de patrocinadores */}
      <SponsorWall patrocinadores={patrocinadores} />
    </>
  );
}
