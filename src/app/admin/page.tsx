import type { Metadata } from 'next';
import AdminClient from './AdminClient';

export const metadata: Metadata = {
  title: 'Panel de administración',
  robots: { index: false, follow: false },
};

// Protección mínima: comprobar contraseña en el servidor
// En Fase 2+ se sustituye por auth de Supabase
export default function AdminPage() {
  return <AdminClient />;
}
