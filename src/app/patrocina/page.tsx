import type { Metadata } from 'next';
import PatrocinaClient from './PatrocinaClient';

export const metadata: Metadata = {
  title: 'Patrocina Platea',
  description:
    'Apoya el cine clásico legal y pon tu marca junto a las mejores películas. Planes desde Butaca hasta Gran Estreno.',
};

export default function PatrocinaPage() {
  return <PatrocinaClient />;
}
