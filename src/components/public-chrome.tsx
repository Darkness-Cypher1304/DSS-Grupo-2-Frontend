// ============================================================================
// PublicChrome — Header + Footer compartidos de las páginas públicas
// ============================================================================
// Server components puros (sin estado, sin 'use client'): NeuroAlert no expone
// datos aquí, así que no hay superficie de ataque. Centraliza la navegación
// pública (Recursos / Cómo funciona / Especialistas) para que las páginas
// estáticas (/about, /specialists, /articles) sean consistentes con la landing.
// Tema "Aurora Prisma": chrome oscuro de vidrio, coherente con la landing.
// ============================================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#06100f]/70 border-b border-white/10">
      <div className="container-wide flex items-center justify-between h-16">
        <Link href="/" className="group">
          <BrandLogo size="md" onDark />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-teal-100/70">
          <Link href="/articles" className="hover:text-teal-200 transition-colors">
            Recursos
          </Link>
          <Link href="/about" className="hover:text-teal-200 transition-colors">
            Cómo funciona
          </Link>
          <Link href="/specialists" className="hover:text-teal-200 transition-colors">
            Especialistas
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-outline-dark text-sm whitespace-nowrap hidden sm:inline-flex">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn-aqua text-sm whitespace-nowrap">
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
    <footer className="canvas-dark border-t border-white/10 py-12">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row gap-6 justify-between text-sm text-teal-100/60">
          <div>
            <div className="mb-3">
              <BrandLogo size="sm" onDark />
            </div>
            <p className="text-xs max-w-md leading-relaxed text-teal-100/50">
              Plataforma educativa sin fines diagnósticos. Para diagnóstico oficial,
              consulta siempre con un profesional de la salud certificado.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <Link href="/about" className="hover:text-teal-200 transition-colors">
              Cómo funciona
            </Link>
            <Link href="/specialists" className="hover:text-teal-200 transition-colors">
              Especialistas
            </Link>
            <Link href="/articles" className="hover:text-teal-200 transition-colors">
              Artículos educativos
            </Link>
            <Link href="/login" className="hover:text-teal-200 transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-teal-200/40 flex flex-col md:flex-row justify-between gap-2">
          <span>© 2026 NeuroAlert · Proyecto académico UPC</span>
          <span>Hecho con ❤️ en Lima, Perú</span>
        </div>
      </div>
    </footer>
  );
}
