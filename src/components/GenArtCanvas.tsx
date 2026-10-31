'use client';

import { useEffect, useRef } from 'react';
import { pintarCartel } from '@/lib/gen-art';

interface GenArtCanvasProps {
  film: { motif: string; paleta: string[]; id: string };
  className?: string;
}

export default function GenArtCanvas({ film, className }: GenArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    pintarCartel(canvas, film);

    const observer = new ResizeObserver(() => {
      pintarCartel(canvas, film);
    });
    observer.observe(canvas.parentElement ?? canvas);

    return () => observer.disconnect();
  }, [film]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
