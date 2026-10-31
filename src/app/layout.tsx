import type { Metadata } from 'next';
import './globals.css';
import '@/styles/cards.css';
import '@/styles/genres.css';
import '@/styles/modal.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MiListaProvider } from '@/lib/mi-lista-context';
import { VotosProvider } from '@/lib/votes-context';
import { FavoritosProvider } from '@/lib/favoritos-context';
import { getPatrocinadores } from '@/lib/data';

export const metadata: Metadata = {
  title: {
    default: 'Platea · Cine clásico gratis y legal',
    template: '%s · Platea',
  },
  description:
    'La plataforma de cine clásico gratuito y legal. Películas de dominio público y canales oficiales, organizadas con calidad premium.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://platea.example'),
  openGraph: {
    siteName: 'Platea',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const patrocinadores = getPatrocinadores();

  return (
    <html lang="es">
      <body>
        <MiListaProvider>
          <VotosProvider>
            <FavoritosProvider>
              <Header />
              <main id="main-content">{children}</main>
              <Footer patrocinadores={patrocinadores} />
            </FavoritosProvider>
          </VotosProvider>
        </MiListaProvider>
      </body>
    </html>
  );
}
