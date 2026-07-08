// ============================================================================
// /specialists — "Especialistas verificados"
// ============================================================================
// Página pública estática (server component): explica cómo NeuroAlert verifica
// a los especialistas, qué pueden hacer por las familias, y cómo un profesional
// puede unirse. Cierra el enlace roto "Especialistas" del header (antes 404).
//
// NOTA DE DISEÑO: aún NO es un directorio en vivo. El backend solo expone
// endpoints de especialistas para ADMIN (no hay listado público), y publicar
// datos de profesionales (incluso aprobados) exige un endpoint nuevo con
// filtrado de PII —p. ej. el número de colegiatura NO debe ser público—. Eso es
// un cambio de backend con su propia revisión de seguridad. Mientras tanto,
// esta página informa con honestidad y deja el directorio como siguiente paso.
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Stethoscope,
  Brain as BrainIcon,
  FileCheck2,
  ShieldCheck,
  ClipboardList,
  PenLine,
  Clock,
} from 'lucide-react';

import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { Spotlight } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Especialistas verificados',
  description:
    'Cómo NeuroAlert verifica a pediatras y psicólogos infantiles: colegiatura CMP/CPsP validada manualmente antes de que puedan responder consultas o publicar contenido.',
};

export default function SpecialistsPage() {
  return (
    <main className="min-h-screen bg-bone-50">
      <PublicHeader />

      {/* HERO — oscuro con foco de luz que sigue el cursor + aurora */}
      <section className="canvas-dark relative overflow-hidden border-b border-white/10">
        <Spotlight />
        <span aria-hidden className="aurora aurora--teal w-[380px] h-[380px] -top-24 right-[6%]" />
        <span aria-hidden className="aurora aurora--coral w-[280px] h-[280px] bottom-[-30%] left-[-4%]" />
        <div
          className="absolute inset-0 clinical-grid opacity-50"
          style={{
            WebkitMaskImage: 'radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 76%)',
            maskImage: 'radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 76%)',
          }}
        />

        <div className="container-wide relative z-10 pt-12 pb-16 md:pt-16 md:pb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-teal-100/60 hover:text-teal-200 transition-colors"
          >
            <ArrowLeft size={16} /> Volver al inicio
          </Link>

          <div className="mt-12">
            <span className="eyebrow text-coral-300">Especialistas verificados</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tightest mt-4 mb-5 max-w-3xl leading-[0.98] text-bone-50">
            Profesionales reales,
            <br />
            <span className="italic font-light text-teal-200">colegiatura verificada.</span>
          </h1>
          <p className="text-lg text-teal-100/70 max-w-2xl leading-relaxed">
            En salud infantil, la confianza no se improvisa. Cada especialista de NeuroAlert es un
            pediatra o psicólogo infantil cuya colegiatura (<span className="font-medium text-bone-50">CMP</span> o{' '}
            <span className="font-medium text-bone-50">CPsP</span>) fue validada manualmente por nuestro
            equipo antes de poder atender a una sola familia.
          </p>
        </div>
      </section>

      {/* CÓMO VERIFICAMOS */}
      <section className="py-20">
        <div className="container-wide">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-teal-700">
              Cómo verificamos
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
              Tres filtros antes de la primera consulta.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <VerifyCard
              n="01"
              icon={<FileCheck2 size={26} />}
              title="Solicitud con sustento"
              description="El profesional envía su número de colegiatura, especialidad, años de experiencia y respaldo documental."
            />
            <VerifyCard
              n="02"
              icon={<BadgeCheck size={26} />}
              title="Revisión humana"
              description="Un administrador valida manualmente la colegiatura. Aprueba o rechaza con motivo: nada es automático."
            />
            <VerifyCard
              n="03"
              icon={<ShieldCheck size={26} />}
              title="Acceso controlado"
              description="Solo tras la aprobación el especialista puede responder consultas y publicar contenido. Cada acción queda auditada."
            />
          </div>
        </div>
      </section>

      {/* QUÉ HACEN POR LAS FAMILIAS */}
      <section className="py-20 bg-white border-y border-bone-200">
        <div className="container-wide grid md:grid-cols-2 gap-10 items-start">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
              Qué pueden hacer por ti
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 mb-6 leading-tight">
              Orientación profesional,
              <br />
              <span className="italic font-light text-teal-700">sin lista de espera.</span>
            </h2>
            <p className="text-ink-mute leading-relaxed max-w-lg">
              En Perú, el 74% de los especialistas en TEA se concentran en Lima. NeuroAlert acerca
              esa orientación a cualquier familia con conexión a internet.
            </p>
          </div>

          <div className="space-y-4">
            <FeatureRow
              icon={<ClipboardList size={22} />}
              title="Responden tus consultas"
              description="Planteas tu caso (con la edad del niño y, si quieres, de forma anónima) y un especialista verificado te responde de forma asincrónica."
            />
            <FeatureRow
              icon={<PenLine size={22} />}
              title="Escriben contenido revisado"
              description="Artículos educativos que pasan por revisión editorial antes de publicarse, para que leas información confiable."
            />
            <FeatureRow
              icon={<Stethoscope size={22} />}
              title="Te ayudan a decidir el siguiente paso"
              description="No reemplazan una evaluación clínica presencial: te orientan sobre cuándo y a dónde acudir."
            />
          </div>
        </div>
      </section>

      {/* ¿ERES ESPECIALISTA? */}
      <section className="py-20">
        <div className="container-wide">
          <div className="card-clinical md:p-10">
            <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-teal-700 mb-3">
                  <BrainIcon size={20} strokeWidth={2.5} />
                  <span className="text-xs font-mono uppercase tracking-widest">¿Eres especialista?</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl leading-tight mb-3">
                  Suma tu colegiatura a la red.
                </h2>
                <p className="text-ink-mute leading-relaxed">
                  Crea una cuenta y solicita la verificación desde tu perfil. Validamos tu
                  colegiatura (CMP/CPsP) y, una vez aprobada, podrás responder consultas y publicar
                  contenido para miles de familias.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link href="/register" className="btn-primary text-base px-7 py-3.5">
                  Crear cuenta
                  <ArrowRight size={18} />
                </Link>
                <span className="inline-flex items-center justify-center gap-2 text-xs text-ink-fade">
                  <Clock size={13} /> Directorio público de especialistas — próximamente
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="panel-darker py-24 relative overflow-hidden">
        <span aria-hidden className="aurora aurora--teal w-[380px] h-[380px] -top-24 left-[8%]" />
        <span aria-hidden className="aurora aurora--coral w-[300px] h-[300px] -bottom-24 right-[10%]" />
        <div className="container-narrow text-center relative">
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6">
            ¿Tienes una duda sobre
            <br />
            <span className="italic font-light text-coral-300">el desarrollo de tu hijo?</span>
          </h2>
          <p className="text-lg text-bone-200 max-w-xl mx-auto mb-10">
            Empieza por el cuestionario M-CHAT-R. Si el resultado lo amerita, conecta con un
            especialista verificado sin moverte de casa.
          </p>
          <Link href="/register" className="btn-coral text-base px-8 py-3.5">
            Empezar ahora
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

// ============================================================================
// Subcomponentes locales
// ============================================================================
function VerifyCard({
  n,
  icon,
  title,
  description,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card relative">
      <span className="absolute top-6 right-6 font-mono text-xs text-teal-700/40">{n}</span>
      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 mb-5">
        {icon}
      </div>
      <h3 className="font-display text-2xl mb-2 text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-mute">{description}</p>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-bone-200 bg-bone-50 p-5">
      <div className="w-10 h-10 shrink-0 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-lg mb-1 text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-mute">{description}</p>
      </div>
    </div>
  );
}
