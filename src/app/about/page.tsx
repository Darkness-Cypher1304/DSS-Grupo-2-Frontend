// ============================================================================
// /about — "Cómo funciona NeuroAlert"
// ============================================================================
// Página pública estática (server component): explica el problema, el flujo de
// 3 pasos, las 3 herramientas y el enfoque de privacidad/seguridad. Cierra el
// enlace roto "Cómo funciona" del header/footer (antes 404). Sin datos ni
// estado → sin superficie de ataque; sin impacto en el coverage gate (.tsx).
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  MessageCircleHeart,
  BookOpen,
  UserPlus,
  ListChecks,
  HeartHandshake,
  ShieldCheck,
  Server,
  EyeOff,
  Lock,
} from 'lucide-react';

import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { Spotlight } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Cómo funciona',
  description:
    'Cómo NeuroAlert te ayuda a detectar señales tempranas del TEA: el cuestionario M-CHAT-R con cálculo de riesgo en el servidor, consultas con especialistas verificados y contenido educativo revisado.',
};

export default function AboutPage() {
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

        <div className="container-wide relative z-10 pt-10 pb-16 md:pt-14 md:pb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-teal-100/60 hover:text-teal-200 transition-colors"
          >
            <ArrowLeft size={16} /> Volver al inicio
          </Link>

          <div className="mt-12">
            <span className="eyebrow text-coral-300">Cómo funciona</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tightest mt-4 mb-5 max-w-3xl leading-[0.98] text-bone-50">
            De una duda silenciosa a
            <br />
            <span className="italic font-light text-teal-200">un siguiente paso claro.</span>
          </h1>
          <p className="text-lg text-teal-100/70 max-w-2xl leading-relaxed">
            NeuroAlert no diagnostica. Te da una orientación temprana, basada en evidencia,
            durante la ventana crítica entre los <span className="font-semibold text-bone-50">18 meses y los 3 años</span>,
            y te conecta con especialistas verificados para decidir qué hacer después.
          </p>
        </div>
      </section>

      {/* EL PROBLEMA (recap breve) */}
      <section className="bg-white border-b border-bone-200 py-16">
        <div className="container-wide grid md:grid-cols-3 gap-8">
          <Stat number="97.4%" label="de personas con TEA en Perú no están diagnosticadas (Defensoría del Pueblo)." />
          <Stat number="5–6 años" label="es la edad promedio de diagnóstico: muy por encima de la ventana crítica." />
          <Stat number="18 m – 3 a" label="es la ventana donde la intervención temprana tiene mayor impacto." />
        </div>
      </section>

      {/* 3 PASOS */}
      <section className="py-20">
        <div className="container-wide">
          <div className="max-w-2xl mb-14">
            <span className="eyebrow">En 3 pasos</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
              Cinco minutos hoy pueden cambiar años.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              n="01"
              icon={<UserPlus size={26} />}
              title="Crea tu cuenta"
              description="Gratis y en segundos. Solo necesitas un correo. Tus datos se transmiten cifrados y nunca se comparten."
            />
            <StepCard
              n="02"
              icon={<ListChecks size={26} />}
              title="Responde el M-CHAT-R"
              description="Las 20 preguntas oficiales del cuestionario validado internacionalmente. Toma alrededor de 5 minutos."
            />
            <StepCard
              n="03"
              icon={<HeartHandshake size={26} />}
              title="Recibe tu orientación"
              description="Tu nivel de riesgo y recomendaciones personalizadas, calculados en el servidor. Si corresponde, consulta con un especialista verificado."
            />
          </div>
        </div>
      </section>

      {/* LAS 3 HERRAMIENTAS */}
      <section className="py-20 bg-white border-y border-bone-200">
        <div className="container-wide">
          <div className="max-w-2xl mb-14">
            <span className="eyebrow-coral">Lo que encontrarás dentro</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
              Tres herramientas, una sola plataforma.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ToolCard
              icon={<ClipboardCheck size={28} />}
              badge="M-CHAT-R"
              title="Tamizaje validado"
              description="Robins, Fein & Barton (2009). El riesgo se calcula íntegramente en el servidor (Zero Trust hacia el cliente): nadie puede manipular el resultado desde el navegador."
            />
            <ToolCard
              icon={<MessageCircleHeart size={28} />}
              badge="Consultas"
              title="Especialistas verificados"
              description="Pediatras y psicólogos infantiles con colegiatura (CMP/CPsP) validada manualmente por nuestro equipo. Consulta de forma asincrónica, sin salir de casa."
            />
            <ToolCard
              icon={<BookOpen size={28} />}
              badge="Educación"
              title="Contenido revisado"
              description="Artículos escritos por especialistas peruanos y aprobados por un proceso editorial antes de publicarse. Información sin mitos ni alarmismo."
            />
          </div>
        </div>
      </section>

      {/* PRIVACIDAD Y SEGURIDAD */}
      <section className="py-20">
        <div className="container-wide">
          <div className="max-w-2xl mb-14">
            <span className="eyebrow">Tu confianza, por diseño</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
              Construido como software seguro.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrustCard
              icon={<Server size={22} />}
              title="Cálculo en el servidor"
              description="El puntaje del M-CHAT-R nunca se decide en tu navegador."
            />
            <TrustCard
              icon={<Lock size={22} />}
              title="Datos protegidos"
              description="Transmisión cifrada (HTTPS) y aislamiento de la información por usuario."
            />
            <TrustCard
              icon={<EyeOff size={22} />}
              title="Anonimato opcional"
              description="Puedes omitir el nombre del niño y publicar consultas de forma anónima."
            />
            <TrustCard
              icon={<ShieldCheck size={22} />}
              title="Acceso por roles"
              description="Padres, especialistas y administradores ven solo lo que les corresponde."
            />
          </div>
        </div>
      </section>

      {/* DISCLAIMER + CTA */}
      <section className="panel-darker py-24">
        <span aria-hidden className="aurora aurora--teal w-[380px] h-[380px] -top-28 left-[8%]" />
        <span aria-hidden className="aurora aurora--coral w-[300px] h-[300px] -bottom-28 right-[10%]" />
        <div className="absolute inset-0 grain-overlay opacity-40" />
        <div className="container-narrow text-center relative">
          <p className="eyebrow text-coral-300 mb-4">Importante</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6">
            NeuroAlert es una guía,
            <br />
            <span className="italic font-light text-coral-300">no un diagnóstico.</span>
          </h2>
          <p className="text-lg text-bone-200 max-w-xl mx-auto mb-10">
            Un resultado de riesgo elevado no significa que tu hijo tenga TEA: significa que vale
            la pena una evaluación profesional. Da el primer paso con información real.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-coral text-base px-8 py-3.5">
              Empezar evaluación gratuita
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/articles"
              className="btn text-base px-8 py-3.5 text-bone-50 border border-bone-50/30 hover:bg-bone-50/10"
            >
              Aprender sobre el TEA
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

// ============================================================================
// Subcomponentes locales
// ============================================================================
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="border-l-2 border-teal-700 pl-6">
      <div className="font-display text-4xl text-teal-800 leading-none">{number}</div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{label}</p>
    </div>
  );
}

function StepCard({
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
    <div className="card-clinical relative">
      <span className="absolute top-6 right-6 font-mono text-xs text-teal-700/40">{n}</span>
      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 mb-5">
        {icon}
      </div>
      <h3 className="font-display text-2xl mb-2 text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-mute">{description}</p>
    </div>
  );
}

function ToolCard({
  icon,
  badge,
  title,
  description,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-700 group-hover:text-bone-50 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-mono uppercase tracking-wider text-coral-700">{badge}</span>
      </div>
      <h3 className="font-display text-2xl mb-2 text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-mute">{description}</p>
    </div>
  );
}

function TrustCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-bone-200 bg-white p-5">
      <div className="w-10 h-10 rounded-lg bg-coral-50 flex items-center justify-center text-coral-700 mb-3">
        {icon}
      </div>
      <h3 className="font-display text-lg mb-1 text-ink">{title}</h3>
      <p className="text-xs leading-relaxed text-ink-mute">{description}</p>
    </div>
  );
}
