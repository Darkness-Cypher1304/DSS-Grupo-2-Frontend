// ============================================================================
// PublicChrome — Header + Footer compartidos de las páginas públicas
// ============================================================================
// Server components puros (sin estado, sin 'use client'): NeuroAlert no expone
// datos aquí, así que no hay superficie de ataque. Centraliza la navegación
// pública (Recursos / Cómo funciona / Especialistas) para que las páginas
// estáticas (/about, /specialists) sean consistentes con la landing sin
// duplicar markup. La landing mantiene su header propio a propósito (hero).
// ============================================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bone-50/70 border-b border-bone-200/80">
      <div className="container-wide flex items-center justify-between h-16">
        <Link href="/" className="group">
          <BrandLogo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          <Link href="/articles" className="hover:text-teal-700 transition-colors">
            Recursos
          </Link>
          <Link href="/about" className="hover:text-teal-700 transition-colors">
            Cómo funciona
          </Link>
          <Link href="/specialists" className="hover:text-teal-700 transition-colors">
            Especialistas
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost text-sm">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Crear cuenta
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-bone-200 bg-bone-100/50 py-12">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row gap-6 justify-between text-sm text-ink-mute">
          <div>
            <div className="mb-3">
              <BrandLogo size="sm" />
            </div>
            <p className="text-xs max-w-md leading-relaxed">
              Plataforma educativa sin fines diagnósticos. Para diagnóstico oficial,
              consulta siempre con un profesional de la salud certificado.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <Link href="/about" className="hover:text-teal-700">
              Cómo funciona
            </Link>
            <Link href="/specialists" className="hover:text-teal-700">
              Especialistas
            </Link>
            <Link href="/articles" className="hover:text-teal-700">
              Artículos educativos
            </Link>
            <Link href="/login" className="hover:text-teal-700">
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-bone-200 text-xs text-ink-fade flex flex-col md:flex-row justify-between gap-2">
          <span>© 2026 NeuroAlert · Proyecto académico UPC</span>
          <span>Hecho con ❤️ en Lima, Perú</span>
        </div>
      </div>
    </footer>
  );
}
