'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQ('');
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
      closeSearch();
    }
  }

  const navLinks = [
    { href: '/',          label: 'Inicio',    active: pathname === '/' },
    { href: '/generos',   label: 'Géneros',   active: pathname.startsWith('/genero') },
    { href: '/mi-lista',  label: 'Mi lista',  active: pathname === '/mi-lista' },
    { href: '/favoritos', label: 'Favoritos', active: pathname === '/favoritos' },
    { href: '/patrocina', label: 'Patrocina', active: pathname === '/patrocina' },
  ];

  return (
    <header className="site-header">
      <div className="gut flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/" className="logo" aria-label="Platea — Inicio">
          Platea<span className="logo-dot" aria-hidden="true">·</span>
        </Link>

        {/* Navegación principal (escritorio) */}
        <nav className="main-nav" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${link.active ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Controles derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Búsqueda */}
          <div className="header-search">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="search-form" role="search">
                <input
                  ref={inputRef}
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar película, director, año…"
                  className="search-input"
                  aria-label="Buscar en Platea"
                  maxLength={120}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') closeSearch();
                  }}
                />
                <button type="submit" className="search-btn-submit" aria-label="Buscar">
                  <SearchIcon />
                </button>
                <button
                  type="button"
                  onClick={closeSearch}
                  className="search-btn-close"
                  aria-label="Cerrar búsqueda"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className="search-trigger"
                aria-label="Abrir búsqueda"
              >
                <SearchIcon />
              </button>
            )}
          </div>

          {/* Botón hamburguesa (solo móvil) */}
          <button
            className="hamburger-btn"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="hamburger-line" aria-hidden="true" />
            <span className="hamburger-line" aria-hidden="true" />
            <span className="hamburger-line" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="Navegación móvil"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${link.active ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
