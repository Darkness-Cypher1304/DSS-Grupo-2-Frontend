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
import { ArrowRight, Brain } from 'lucide-react';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bone-50/80 border-b border-bone-200">
      <div className="container-wide flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
            <Brain size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
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
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center text-bone-50">
                <Brain size={14} strokeWidth={2.5} />
              </div>
              <span className="font-display text-base font-medium text-ink">NeuroAlert</span>
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
