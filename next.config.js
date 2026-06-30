/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo standalone: genera servidor autocontenido para Docker en producción.
  // Reduce el tamaño de la imagen de ~1GB → ~200MB.
  output: 'standalone',

  reactStrictMode: true,
  poweredByHeader: false, // OWASP A05: ocultar X-Powered-By
  productionBrowserSourceMaps: false,

  // Permitir imágenes externas si las necesitamos
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Headers de seguridad. ANTES los ponía Nginx en prod, pero la app se migró a
  // Render (sin Nginx) → la app DEBE ponerlos ella misma. La CSP es la última
  // línea de defensa contra XSS: aunque se inyecte un <script>, el navegador
  // se niega a ejecutarlo si no lo permite esta política.
  async headers() {
    // CSP pragmática y compatible con Next 15 (App Router):
    //  - 'unsafe-inline' en script/style ES necesario: Next inyecta scripts y
    //    estilos inline para la hidratación (no usamos nonce-middleware).
    //  - SIN 'unsafe-eval': el build de PRODUCCIÓN de Next no lo requiere.
    //  - connect-src incluye AMBOS backends (dev y prod) porque el MISMO build
    //    de `main` sirve a los dos ambientes (solo cambia NEXT_PUBLIC_API_URL).
    //  - font/style de Google Fonts: globals.css importa Fraunces/Geist.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://miapp-dev.onrender.com https://miapp-6ex5.onrender.com",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
