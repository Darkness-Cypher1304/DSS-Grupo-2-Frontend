// ============================================================================
// /postular/enviado — PANTALLA 10: confirmación "¡Solicitud enviada!"
// ============================================================================
// Se llega tras enviar el formulario (pantalla 9.5). Indica que se recibió y que
// revise su correo (pantalla 11 con el resumen). Server component (estática).
// ============================================================================

import Link from 'next/link';
import { Brain, CheckCircle2, Mail } from 'lucide-react';

export const metadata = {
  title: 'Solicitud enviada · NeuroAlert',
};

export default function ApplicationSentPage() {
  return (
    <main className="min-h-screen bg-bone-50 flex flex-col items-center justify-center p-8">
      <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
          <Brain size={18} strokeWidth={2.5} />
        </div>
        <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
      </Link>

      <div className="card max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-5 text-teal-700">
          <CheckCircle2 size={36} />
        </div>
        <h1 className="font-display text-3xl tracking-tightest mb-2">¡Solicitud enviada!</h1>
        <p className="text-ink-mute mb-6">
          Hemos recibido tu postulación correctamente. Nuestro equipo la revisará y se pondrá en
          contacto contigo para coordinar una reunión de evaluación.
        </p>

        <div className="flex items-start gap-3 rounded-xl bg-bone-100 px-4 py-3 text-left mb-6">
          <Mail size={18} className="text-teal-700 shrink-0 mt-0.5" />
          <p className="text-sm text-ink-soft">
            Revisa tu correo electrónico: te enviamos un mensaje con el <strong>resumen de todos los
            datos</strong> que registraste, para que verifiques que todo esté correcto.
          </p>
        </div>

        <Link href="/" className="btn-secondary w-full py-3">
          Volver al inicio
        </Link>
        <p className="text-xs text-ink-fade mt-4">
          ¿No ves el correo? Revisa tu carpeta de spam. Si detectas un error, escríbenos a{' '}
          <a href="mailto:U20241E211@UPC.EDU.PE" className="text-teal-700 hover:underline">
            U20241E211@UPC.EDU.PE
          </a>
          .
        </p>
      </div>
    </main>
  );
}
