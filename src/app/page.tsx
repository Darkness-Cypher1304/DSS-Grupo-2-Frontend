// ============================================================================
// Landing page · NeuroAlert — dirección visual "Aurora Prisma"
// ============================================================================
// Primera impresión. Comunica el problema (97.4%), la solución (M-CHAT-R +
// especialistas verificados) y CTAs claros. Tema oscuro premium: lienzo teal
// profundo, foco de luz que sigue el cursor, superficies de vidrio (bento),
// aurora a la deriva y revelados al desplazar. Solo aspecto/carcasa: los
// apartados, textos y flujos no cambian.
// ============================================================================

import Link from 'next/link';
import { ArrowRight, ClipboardCheck, MessageCircleHeart, ShieldCheck, Sparkles } from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';
import { Spotlight, Reveal, CountUp } from '@/components/motion';

export default function LandingPage() {
  return (
    <main className="bg-bone-50 text-ink min-h-screen [overflow-x:clip]">
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
// HEADER — vidrio esmerilado, borde-hairline
// ============================================================================
function Header() {
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

// ============================================================================
// HERO — foco de luz que sigue el cursor + aurora + tarjeta de vidrio
// ============================================================================
function Hero() {
  return (
    <section className="canvas-dark relative overflow-hidden">
      {/* Foco de luz que sigue el cursor (la firma de Aurora Prisma) */}
      <Spotlight />
      {/* Aurora a la deriva */}
      <span aria-hidden className="aurora aurora--teal w-[420px] h-[420px] -top-24 right-[6%]" />
      <span aria-hidden className="aurora aurora--coral w-[300px] h-[300px] top-1/3 left-[-6%]" />
      {/* Retícula clínica muy tenue, atenuada a los bordes */}
      <div
        className="absolute inset-0 clinical-grid opacity-60"
        style={{
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 76%)',
          maskImage: 'radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 76%)',
        }}
      />

      <div className="container-wide relative z-10 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Texto — entrada por animación CSS (visible siempre, sin depender de JS) */}
          <div className="md:col-span-7">
            <div className="animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-teal-100 text-xs font-medium mb-6">
                <Sparkles size={14} className="text-teal-300" />
                Plataforma gratuita · validada con M-CHAT-R
              </div>
            </div>

            <h1
              className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tightest text-bone-50 mb-6 animate-fade-in-up"
              style={{ animationDelay: '80ms', animationFillMode: 'both' }}
            >
              Detectar a tiempo
              <br />
              <span className="italic font-light text-teal-200/90">cambia</span>
              <br />
              <span className="bg-gradient-to-r from-bone-50 via-teal-200 to-teal-300 bg-clip-text text-transparent">
                una vida entera.
              </span>
            </h1>

            <p
              className="text-lg md:text-xl text-teal-100/70 max-w-xl leading-relaxed mb-8 animate-fade-in-up"
              style={{ animationDelay: '160ms', animationFillMode: 'both' }}
            >
              En el Perú, el <span className="font-semibold text-bone-50">97.4%</span> de las personas
              con autismo no están diagnosticadas. NeuroAlert te ayuda a identificar señales tempranas
              con la herramienta validada internacionalmente y a conectar con especialistas
              verificados.
            </p>

            <div className="animate-fade-in-up" style={{ animationDelay: '240ms', animationFillMode: 'both' }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-aqua text-base px-7 py-3.5">
                  Empezar evaluación gratuita
                  <ArrowRight size={18} />
                </Link>
                <Link href="/articles" className="btn-outline-dark text-base px-7 py-3.5">
                  Aprender sobre el TEA
                </Link>
              </div>
              <p className="mt-6 text-sm font-mono uppercase tracking-widest text-teal-200/50">
                Sin costo · Sin diagnóstico automático · Datos protegidos
              </p>
            </div>
          </div>

          {/* Visual: tarjeta de vidrio con la cifra */}
          <div
            className="md:col-span-5 animate-fade-in"
            style={{ animationDelay: '320ms', animationFillMode: 'both' }}
          >
            <StatCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard() {
  return (
    <div className="glass p-8 md:p-10 text-center relative overflow-hidden">
      <span aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="relative">
        <div className="font-display text-7xl md:text-8xl font-medium text-bone-50 leading-none tabular">
          <CountUp to={97.4} decimals={1} />
          <span className="text-3xl md:text-4xl align-top text-teal-300">%</span>
        </div>
        <div className="mt-5 text-xs uppercase tracking-widest text-teal-200/60 font-mono">
          personas con TEA en Perú
        </div>
        <div className="mt-1.5 text-sm font-medium text-coral-300">sin diagnosticar</div>

        <div className="hairline my-7 !bg-gradient-to-r !from-transparent !via-white/15 !to-transparent" />

        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <div className="font-display text-2xl text-teal-200 tabular">204k</div>
            <div className="text-xs text-teal-100/50 mt-1">personas (est. OMS)</div>
          </div>
          <div>
            <div className="font-display text-2xl text-teal-200 tabular">5,328</div>
            <div className="text-xs text-teal-100/50 mt-1">registradas por MINSA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ¿QUÉ DESEAS HACER? — bifurcación de los dos caminos
// ============================================================================
function PathChooser() {
  return (
    <section className="relative border-y border-bone-200 bg-white py-20">
      <div className="container-wide">
        <Reveal>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="eyebrow-coral">¿Qué deseas hacer?</span>
            <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-tightest text-ink">
              Elige tu camino
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Reveal>
            <div className="card-clinical h-full flex flex-col">
              <span className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 mb-4">
                <MessageCircleHeart size={22} />
              </span>
              <h3 className="font-display text-2xl mb-1 text-ink">Soy padre o apoderado</h3>
              <p className="text-ink-mute text-sm mb-6 flex-1">
                Quiero evaluar a mi hijo o hija con la herramienta M-CHAT-R y conectar con
                especialistas verificados.
              </p>
              <Link href="/register" className="btn-primary self-start px-6 py-3">
                Crear cuenta <ArrowRight size={17} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card h-full flex flex-col">
              <span className="w-12 h-12 rounded-2xl bg-coral-50 border border-coral-100 flex items-center justify-center text-coral-600 mb-4">
                <ShieldCheck size={22} />
              </span>
              <h3 className="font-display text-2xl mb-1 text-ink">Soy profesional de la salud</h3>
              <p className="text-ink-mute text-sm mb-6 flex-1">
                Quiero postular como especialista de NeuroAlert. Revisaremos tu colegiatura y
                credenciales antes de aprobarte.
              </p>
              <Link href="/postular" className="btn-secondary self-start px-6 py-3">
                Postular como especialista <ArrowRight size={17} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SECCIÓN: PROBLEMA
// ============================================================================
function ProblemSection() {
  return (
    <section className="panel-darker relative overflow-hidden py-24">
      <span aria-hidden className="aurora aurora--teal w-[380px] h-[380px] top-10 right-[8%]" />
      <span aria-hidden className="aurora aurora--coral w-[260px] h-[260px] bottom-0 left-[4%]" />
      <div className="container-wide relative">
        <Reveal>
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
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Reveal>
            <Stat
              number="5–6"
              unit="años"
              description="Edad promedio de diagnóstico de TEA en Perú. Las intervenciones tempranas pierden su mayor potencial."
            />
          </Reveal>
          <Reveal delay={100}>
            <Stat
              number="204k"
              unit="personas"
              description="Estimación OMS para Perú. MINSA solo registra 5,328: una brecha del 97.4%."
            />
          </Reveal>
          <Reveal delay={200}>
            <Stat
              number="4×"
              unit="más en niños"
              description="El TEA tiene un sesgo de detección por género. En niñas se detecta aún menos. Hay que cambiarlo."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({ number, unit, description }: { number: string; unit: string; description: string }) {
  return (
    <div className="glass-card h-full">
      <div className="font-display text-5xl text-bone-50 leading-none tabular">
        {number}
        <span className="text-base text-teal-200/70 ml-2 font-sans">{unit}</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-teal-100/60">{description}</p>
    </div>
  );
}

// ============================================================================
// SECCIÓN: FEATURES (bento de vidrio)
// ============================================================================
function FeaturesSection() {
  return (
    <section className="relative bg-bone-50 py-24">
      <div className="container-wide">
        <Reveal>
          <div className="max-w-2xl mb-16">
            <span className="eyebrow">La solución</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight text-ink">
              Tres puertas hacia el diagnóstico oportuno.
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          <Reveal>
            <FeatureCard
              accent="teal"
              icon={<ClipboardCheck size={28} />}
              badge="M-CHAT-R"
              title="Cuestionario validado"
              description="Las 20 preguntas oficiales de Robins, Fein & Barton (2009). Cálculo de riesgo server-side. Recomendaciones personalizadas según tu resultado."
            />
          </Reveal>
          <Reveal delay={100}>
            <FeatureCard
              accent="coral"
              icon={<MessageCircleHeart size={28} />}
              badge="Consultas"
              title="Especialistas verificados"
              description="Pediatras y psicólogos con colegiatura validada por nuestro equipo. Recibe orientación sin salir de casa."
            />
          </Reveal>
          <Reveal delay={200}>
            <FeatureCard
              accent="amber"
              icon={<ShieldCheck size={28} />}
              badge="Educación"
              title="Información confiable"
              description="Artículos escritos por especialistas peruanos y revisados antes de publicarse. Adiós a los mitos."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const ACCENTS = {
  teal: { chip: 'bg-teal-100 text-teal-700 group-hover:bg-teal-700 group-hover:text-bone-50', badge: 'text-teal-700' },
  coral: { chip: 'bg-coral-50 text-coral-600 group-hover:bg-coral-500 group-hover:text-white', badge: 'text-coral-700' },
  amber: { chip: 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white', badge: 'text-amber-700' },
} as const;

function FeatureCard({
  icon,
  badge,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="card-clinical group h-full">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${a.chip}`}>
          {icon}
        </div>
        <span className={`text-xs font-mono uppercase tracking-wider ${a.badge}`}>{badge}</span>
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
    <section className="panel-darker relative overflow-hidden py-28">
      <span aria-hidden className="aurora aurora--teal w-[420px] h-[420px] -top-20 left-[10%]" />
      <span aria-hidden className="aurora aurora--coral w-[320px] h-[320px] -bottom-24 right-[12%]" />
      <div className="container-narrow text-center relative">
        <Reveal>
          <h2 className="font-display text-4xl md:text-6xl leading-tight mb-6 text-bone-50">
            Tu hijo merece una
            <br />
            <span className="italic font-light text-coral-300">oportunidad temprana.</span>
          </h2>
          <p className="text-lg text-teal-100/70 max-w-xl mx-auto mb-10">
            Crea tu cuenta gratis. Toma el cuestionario en 5 minutos. Decide los siguientes pasos con
            información real.
          </p>
          <Link href="/register" className="btn-aqua text-base px-8 py-4">
            Crear cuenta gratuita
            <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
function Footer() {
  return (
    <footer className="canvas-dark border-t border-white/10 py-12 relative">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row gap-6 justify-between text-sm text-teal-100/60">
          <div>
            <div className="mb-3">
              <BrandLogo size="sm" onDark />
            </div>
            <p className="text-xs max-w-md leading-relaxed text-teal-100/50">
              Plataforma educativa sin fines diagnósticos. Para diagnóstico oficial, consulta siempre
              con un profesional de la salud certificado.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <Link href="/about" className="hover:text-teal-200 transition-colors">
              Sobre el proyecto
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
