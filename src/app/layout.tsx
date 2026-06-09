import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: {
    default: 'NeuroAlert · Detección temprana del TEA',
    template: '%s · NeuroAlert',
  },
  description:
    'Plataforma educativa peruana para la detección temprana del Trastorno del Espectro Autista. M-CHAT-R, contenido validado, y consultas con especialistas.',
  keywords: ['TEA', 'autismo', 'detección temprana', 'M-CHAT-R', 'Perú'],
  authors: [{ name: 'NeuroAlert' }],
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    title: 'NeuroAlert',
    description: 'Detección temprana del TEA en Perú',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Etiqueta de build visible: sirve para OBSERVAR que un cambio mergeado en
// GitHub llegó al sitio en vivo tras el deploy. Bumpea este valor por release.
const BUILD_TAG = 'v1.1 · demo observable';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            bottom: 8,
            right: 8,
            zIndex: 50,
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 6,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            pointerEvents: 'none',
          }}
        >
          NeuroAlert · {BUILD_TAG}
        </div>
      </body>
    </html>
  );
}
