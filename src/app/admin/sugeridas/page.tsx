import type { Metadata } from 'next';
import SugeridasClient from './SugeridasClient';

export const metadata: Metadata = {
  title: 'Sugerencias — Panel Platea',
  robots: { index: false, follow: false },
};

export default function SugeridasPage() {
  return <SugeridasClient />;
}
