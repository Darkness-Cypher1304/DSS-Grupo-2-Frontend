// ============================================================================
// /postular — PANTALLA 9: landing "Postula como especialista"
// ============================================================================
// Explica el proceso y lo que se evaluará. El especialista NUNCA ve la palabra
// "Registrarse": POSTULA. Server component (estática) → no afecta cobertura ni ZAP.
// ============================================================================

import Link from 'next/link';
import { Brain, ClipboardList, FileCheck2, GraduationCap, BadgeCheck, ArrowRight } from 'lucide-react';
import { AuthAside } from '@/components/auth-aside';

export const metadata = {
  title: 'Postula como especialista · NeuroAlert',
};

const STEPS = [
  { icon: ClipboardList, title: 'Información personal y profesional', desc: 'Tus datos, especialidad y colegiatura.' },
  { icon: FileCheck2, title: 'Documentos y credenciales', desc: 'Currículum (PDF) y documento de identidad.' },
  { icon: GraduationCap, title: 'Experiencia y especialidad', desc: 'Tu trayectoria y disponibilidad.' },
  { icon: BadgeCheck, title: 'Verificación de colegiatura', desc: 'Nuestro equipo valida tu CMP antes de aprobar.' },
];

export default function PostularLandingPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-bone-50">
      <div className="flex flex-col justify-center p-8 md:p-16">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
              <Brain size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
          </Link>

          <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
            Forma parte del equipo NeuroAlert
          </span>
          <h1 className="font-display text-4xl tracking-tightest mt-2 mb-3">Postula como especialista</h1>
          <p className="text-ink-mute mb-8">
            Completa el formulario y nuestro equipo revisará tu solicitud. Al postular no se crea
            ninguna cuenta: la crearás tú mismo solo si tu postulación es aprobada.
          </p>

          <ul className="space-y-3 mb-8">
            {STEPS.map((s) => (
              <li key={s.title} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <s.icon size={17} />
                </span>
                <div>
                  <p className="font-medium text-ink-soft text-sm">{s.title}</p>
                  <p className="text-xs text-ink-mute">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/postular/formulario" className="btn-primary w-full py-3 text-base">
            Comenzar postulación <ArrowRight size={18} />
          </Link>

          <p className="mt-8 text-sm text-ink-mute text-center">
            ¿Eres padre o cuidador?{' '}
            <Link href="/register" className="text-teal-700 font-medium hover:underline">
              Crear cuenta
            </Link>
          </p>
          <p className="mt-2 text-sm text-ink-mute text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-teal-700 font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      <AuthAside
        eyebrow="Especialistas verificados"
        quote="Acompaña a las familias con tu experiencia."
        caption="Responde consultas, publica recursos acreditados y ayuda a la detección temprana del TEA."
        footer="Tu colegiatura se verifica antes de aprobar tu cuenta."
      />
    </main>
  );
}
