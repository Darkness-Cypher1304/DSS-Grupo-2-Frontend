'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import { apiGet } from '@/lib/api-client';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { Spotlight } from '@/components/motion';

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  author: { fullName: string };
}

interface ContentList {
  items: ContentItem[];
}

export default function PublicArticlesPage() {
  const { data, isLoading } = useQuery<ContentList>({
    queryKey: ['public-articles'],
    queryFn: () => apiGet<ContentList>('/content?perPage=30'),
  });

  return (
    <main className="min-h-screen bg-bone-50">
      <PublicHeader />

      {/* HERO — oscuro con foco de luz que sigue el cursor + aurora */}
      <section className="canvas-dark relative overflow-hidden border-b border-white/10">
        <Spotlight />
        <span aria-hidden className="aurora aurora--teal w-[360px] h-[360px] -top-24 right-[6%]" />
        <span aria-hidden className="aurora aurora--coral w-[260px] h-[260px] bottom-[-30%] left-[-4%]" />
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
            <span className="eyebrow text-coral-300">Recursos educativos</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tightest mt-4 mb-4 max-w-2xl leading-tight text-bone-50">
            Información validada,
            <br />
            <span className="italic font-light text-teal-200">sin alarmismo.</span>
          </h1>
          <p className="text-teal-100/70 max-w-xl">
            Artículos escritos por especialistas peruanos verificados. Revisados antes de
            publicarse.
          </p>
        </div>
      </section>

      {/* GRID — claro (lectura cómoda) */}
      <section className="container-wide py-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-700" />
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="card group block"
              >
                <span className="text-xs font-mono uppercase tracking-wider text-coral-700">
                  {article.category}
                </span>
                <h3 className="font-display text-xl leading-tight mt-2 mb-3 group-hover:text-teal-700 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-ink-mute leading-relaxed line-clamp-3 mb-4">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-fade">por {article.author.fullName}</span>
                  <span className="inline-flex items-center gap-1 text-teal-700 group-hover:gap-2 transition-all">
                    Leer <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-ink-mute">
            Aún no hay artículos publicados.
          </div>
        )}
      </section>

      <PublicFooter />
    </main>
  );
}
