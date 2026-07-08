// ============================================================================
// Landing page · NeuroAlert
// ============================================================================
// Primera impresión. Comunica el problema (97.4%), la solución (M-CHAT-R +
// especialistas verificados), y CTAs claros.
// Diseño editorial: tipografía display Fraunces, paleta teal/coral, grain.
// ============================================================================

import Link from 'next/link';
import { ArrowRight, ClipboardCheck, MessageCircleHeart, ShieldCheck, Sparkles } from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bone-50 selection:bg-teal-700 selection:text-bone-50">
      <Header />
      <Hero />
      <PathChooser />
      <ProblemSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}

// ============================================================================
// ¿QUÉ DESEAS HACER? — bifurcación de los dos caminos (pantalla 1 del prompt)
// ============================================================================
function PathChooser() {
  return (
    <section className="border-y border-bone-200 bg-white py-16">
      <div className="container-wide">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="eyebrow-coral">¿Qué deseas hacer?</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-tightest text-ink">
            Elige tu camino
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Padre / apoderado */}
          <div className="card-clinical flex flex-col">
            <span className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4">
              <MessageCircleHeart size={22} />
            </span>
            <h3 className="font-display text-2xl mb-1">Soy padre o apoderado</h3>
            <p className="text-ink-mute text-sm mb-6 flex-1">
              Quiero evaluar a mi hijo o hija con la herramienta M-CHAT-R y conectar con
              especialistas verificados.
            </p>
            <Link href="/register" className="btn-primary self-start px-6 py-3">
              Crear cuenta <ArrowRight size={17} />
            </Link>
          </div>

          {/* Profesional de la salud */}
          <div className="card flex flex-col">
            <span className="w-12 h-12 rounded-2xl bg-coral-50 border border-coral-100 flex items-center justify-center text-coral-600 mb-4">
              <ShieldCheck size={22} />
            </span>
            <h3 className="font-display text-2xl mb-1">Soy profesional de la salud</h3>
            <p className="text-ink-mute text-sm mb-6 flex-1">
              Quiero postular como especialista de NeuroAlert. Revisaremos tu colegiatura y
              credenciales antes de aprobarte.
            </p>
            <Link href="/postular" className="btn-secondary self-start px-6 py-3">
              Postular como especialista <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function Header() {
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
          <Link href="/login" className="btn-ghost">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn-primary">
            Crear cuenta
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// HERO
// ============================================================================
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fondo clínico luminoso + rejilla en retícula + resplandores de aurora */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-teal-50/40 to-bone-100 -z-10" />
      <div
        className="absolute inset-0 clinical-grid -z-10"
        style={{
          WebkitMaskImage: 'radial-gradient(125% 100% at 50% 0%, #000 35%, transparent 78%)',
          maskImage: 'radial-gradient(125% 100% at 50% 0%, #000 35%, transparent 78%)',
        }}
      />
      <span aria-hidden className="absolute -top-20 right-[-4%] w-[380px] h-[380px] rounded-full bg-teal-300/25 blur-[64px] -z-10" />
      <span aria-hidden className="absolute top-1/3 left-[-8%] w-[300px] h-[300px] rounded-full bg-coral-200/20 blur-[64px] -z-10" />
      <div className="absolute inset-0 grain-overlay -z-10" />

      <div className="container-wide pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Columna izquierda: texto */}
          <div className="md:col-span-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-50 border border-coral-100 text-coral-700 text-xs font-medium mb-6">
              <Sparkles size={14} />
              Plataforma gratuita · validada con M-CHAT-R
            </div>

            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tightest text-ink mb-6">
              Detectar a tiempo
              <br />
              <span className="italic font-light">cambia</span>
              <br />
              <span className="gradient-text">una vida entera.</span>
            </h1>

            <p className="text-lg md:text-xl text-ink-mute max-w-xl leading-relaxed mb-8">
              En el Perú, el <span className="font-semibold text-ink">97.4%</span> de las
              personas con autismo no están diagnosticadas. NeuroAlert te ayuda a
              identificar señales tempranas con la herramienta validada
              internacionalmente y a conectar con especialistas verificados.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="btn-primary text-base px-7 py-3.5">
                Empezar evaluación gratuita
                <ArrowRight size={18} />
              </Link>
              <Link href="/articles" className="btn-secondary text-base px-7 py-3.5">
                Aprender sobre el TEA
              </Link>
            </div>

            <p className="mt-6 text-sm text-ink-fade">
              No es un diagnóstico — es una guía para padres respaldada por evidencia.
            </p>
          </div>

          {/* Columna derecha: visual editorial */}
          <div className="md:col-span-5 animate-fade-in">
            <BrainVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// VISUAL DEL HERO — SVG editorial
// ============================================================================
function BrainVisual() {
  return (
    <div className="relative aspect-square">
      {/* Círculo de fondo */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-100 to-coral-100 animate-breathe" />

      {/* Stat principal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-7xl md:text-8xl font-medium text-teal-800 leading-none tabular">
            97<span className="text-coral-500">.</span>4
            <span className="text-3xl md:text-4xl align-top">%</span>
          </div>
          <div className="mt-4 text-xs uppercase tracking-widest text-ink-mute font-mono">
            personas con TEA en Perú
          </div>
          <div className="mt-1 text-sm font-medium text-coral-700">
            sin diagnosticar
          </div>
        </div>
      </div>

      {/* Decoración: pequeños puntos clínicos */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="60" cy="80" r="3" fill="currentColor" className="text-teal-400/40" />
        <circle cx="340" cy="120" r="2" fill="currentColor" className="text-coral-400/50" />
        <circle cx="320" cy="320" r="4" fill="currentColor" className="text-teal-500/30" />
        <circle cx="80" cy="340" r="2" fill="currentColor" className="text-teal-300/40" />
        <circle cx="200" cy="50" r="2" fill="currentColor" className="text-coral-300/40" />
      </svg>
    </div>
  );
}

// ============================================================================
// SECCIÓN: PROBLEMA
// ============================================================================
function ProblemSection() {
  return (
    <section className="panel-darker py-24">
      {/* Aurora a la deriva — la firma de "Luz Clínica" */}
      <span aria-hidden className="aurora aurora--teal w-[420px] h-[420px] -top-32 right-[6%]" />
      <span aria-hidden className="aurora aurora--coral w-[320px] h-[320px] -bottom-32 left-[10%]" />
      <div className="absolute inset-0 grain-overlay opacity-40" />

      <div className="container-wide relative">
        <div className="max-w-3xl">
          <span className="eyebrow text-coral-300">El problema</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight text-bone-50">
            La ventana crítica de
            <br />
            <span className="italic font-light text-teal-200">18 meses a 3 años</span>
            <br />
            se está perdiendo.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Stat
            number="5–6"
            unit="años"
            description="Edad promedio de diagnóstico de TEA en Perú. Las intervenciones tempranas pierden su mayor potencial."
          />
          <Stat
            number="204k"
            unit="personas"
            description="Estimación OMS para Perú. MINSA solo registra 5,328: una brecha del 97.4%."
          />
          <Stat
            number="4×"
            unit="más en niños"
            description="El TEA tiene un sesgo de detección por género. En niñas se detecta aún menos. Hay que cambiarlo."
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, unit, description }: { number: string; unit: string; description: string }) {
  return (
    <div className="border-l-2 border-teal-400/50 pl-6">
      <div className="font-display text-5xl text-bone-50 leading-none tabular">
        {number}
        <span className="text-base text-teal-200/80 ml-2 font-sans">{unit}</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-bone-200/80">{description}</p>
    </div>
  );
}

// ============================================================================
// SECCIÓN: FEATURES
// ============================================================================
function FeaturesSection() {
  return (
    <section className="py-20 bg-bone-50">
      <div className="container-wide">
        <div className="max-w-2xl mb-16">
          <span className="eyebrow">La solución</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
            Tres puertas hacia el diagnóstico oportuno.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<ClipboardCheck size={28} />}
            badge="M-CHAT-R"
            title="Cuestionario validado"
            description="Las 20 preguntas oficiales de Robins, Fein & Barton (2009). Cálculo de riesgo server-side. Recomendaciones personalizadas según tu resultado."
          />
          <FeatureCard
            icon={<MessageCircleHeart size={28} />}
            badge="Consultas"
            title="Especialistas verificados"
            description="Pediatras y psicólogos con colegiatura validada por nuestro equipo. Recibe orientación sin salir de casa."
          />
          <FeatureCard
            icon={<ShieldCheck size={28} />}
            badge="Educación"
            title="Información confiable"
            description="Artículos escritos por especialistas peruanos y revisados antes de publicarse. Adiós a los mitos."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
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
    <div className="card-clinical group">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-700 group-hover:text-bone-50 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-mono uppercase tracking-wider text-coral-700">
          {badge}
        </span>
      </div>
      <h3 className="font-display text-2xl mb-2 text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-mute">{description}</p>
    </div>
  );
}

// ============================================================================
// CTA FINAL
// ============================================================================
function CTASection() {
  return (
    <section className="panel-darker py-24">
      <span aria-hidden className="aurora aurora--teal w-[380px] h-[380px] -top-28 left-[8%]" />
      <span aria-hidden className="aurora aurora--coral w-[300px] h-[300px] -bottom-28 right-[10%]" />
      <div className="absolute inset-0 grain-overlay opacity-40" />

      <div className="container-narrow text-center relative">
        <h2 className="font-display text-4xl md:text-6xl leading-tight mb-6">
          Tu hijo merece una
          <br />
          <span className="italic font-light text-coral-300">oportunidad temprana.</span>
        </h2>
        <p className="text-lg text-bone-200 max-w-xl mx-auto mb-10">
          Crea tu cuenta gratis. Toma el cuestionario en 5 minutos. Decide los siguientes pasos con información real.
        </p>
        <Link href="/register" className="btn-coral text-base px-8 py-3.5">
          Crear cuenta gratuita
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
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
              Sobre el proyecto
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
          <span>Made with ❤️ in Lima, Perú</span>
        </div>
      </div>
    </footer>
  );
}
