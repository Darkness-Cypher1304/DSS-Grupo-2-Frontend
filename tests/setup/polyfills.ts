// ============================================================================
// Polyfills para MSW v2 bajo jsdom
// ----------------------------------------------------------------------------
// jsdom no expone la Fetch API ni los streams/encoders que MSW necesita para
// construir sus `Response`. Los tomamos de los módulos nativos de Node y de
// `undici`. Se cargan vía `setupFiles` (ANTES del framework de test).
//
// ORDEN IMPORTANTE: `undici` referencia `TextEncoder` al evaluarse, así que hay
// que definir los encoders (de `node:util`) ANTES de requerir `undici`. Por eso
// undici entra con `require` en el cuerpo del módulo, no con `import` (que se
// hoistea y se evaluaría demasiado pronto).
// ============================================================================
import { TextEncoder, TextDecoder } from 'node:util';
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';

function define(name: string, value: unknown) {
  if (typeof (globalThis as Record<string, unknown>)[name] === 'undefined') {
    Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  }
}

// 1) Encoders y streams primero (undici depende de ellos al cargar).
define('TextEncoder', TextEncoder);
define('TextDecoder', TextDecoder);
define('ReadableStream', ReadableStream);
define('TransformStream', TransformStream);
define('WritableStream', WritableStream);

// 2) Ahora sí, Fetch API desde undici.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetch, Headers, Request, Response, FormData } = require('undici');
define('fetch', fetch);
define('Headers', Headers);
define('Request', Request);
define('Response', Response);
define('FormData', FormData);

// 3) BroadcastChannel (MSW lo usa en algunos flujos).
if (typeof (globalThis as Record<string, unknown>).BroadcastChannel === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BroadcastChannel } = require('node:worker_threads');
  define('BroadcastChannel', BroadcastChannel);
}
