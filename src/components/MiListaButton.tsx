'use client';

import { useMiLista } from '@/lib/mi-lista-context';

interface MiListaButtonProps {
  slug: string;
  titulo: string;
  variant?: 'icon' | 'full';
}

export default function MiListaButton({ slug, titulo, variant = 'icon' }: MiListaButtonProps) {
  const { toggle, estaEnLista } = useMiLista();
  const enLista = estaEnLista(slug);

  if (variant === 'full') {
    return (
      <button
        onClick={() => toggle(slug)}
        className="btn btn--ghost flex items-center gap-2"
        aria-label={enLista ? `Quitar ${titulo} de Mi lista` : `Añadir ${titulo} a Mi lista`}
        aria-pressed={enLista}
      >
        <span className="text-lg leading-none">{enLista ? '✓' : '+'}</span>
        <span>Mi lista</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => toggle(slug)}
      className={`mi-lista-btn${enLista ? ' en-lista' : ''}`}
      aria-label={enLista ? `Quitar ${titulo} de Mi lista` : `Añadir ${titulo} a Mi lista`}
      aria-pressed={enLista}
    >
      {enLista ? '✓' : '+'}
    </button>
  );
}
