#!/usr/bin/env bash
# ============================================================================
# health-check.sh — verificación REFORZADA de un despliegue del FRONTEND (Next.js).
# ----------------------------------------------------------------------------
# Uso:  health-check.sh <BASE_URL> [ETIQUETA]
#   <BASE_URL>  URL del sitio desplegado   (p. ej. la de Render dev/prod)
#   [ETIQUETA]  texto para los logs        (p. ej. "Dev" o "Producción")
#
# Paridad con el health-check del backend, ADAPTADO a una UI: el frontend NO
# expone un /health JSON (es una app Next.js), así que su "salud" es que la
# página se sirve correctamente. Qué valida (y por qué):
#
#   1) RESPONDE HTTP 200 (con -L, tolera redirects de Next), reintentando con
#      backoff para dar margen al cold-start de Render free-tier.
#   2) El HTML es un RENDER REAL de Next.js → GATE DURO: se exige el marcador
#      "/_next/" (referencias a los assets estáticos que Next incrusta en toda
#      página servida). Descarta el falso verde de una página de error/placeholder
#      de Render o de un build fallido que aún devuelva 200.
#   3) Cabeceras de seguridad (CSP, X-Frame-Options, X-Content-Type-Options,
#      Referrer-Policy — definidas en next.config.js) → se REPORTAN (informativo,
#      no gatean, para no arriesgar la demo si una cabecera cambiara de nombre).
#
# READ-ONLY: solo hace GET de la página (y una lectura de cabeceras). No escribe
# nada. Seguro incluso contra PRODUCCIÓN.
#
# Dependencias: curl (preinstalado en ubuntu-latest). No usa jq (no hay JSON).
# Config opcional por env: HEALTH_ATTEMPTS (18) · HEALTH_SLEEP (20s) ·
#                          HEALTH_TIMEOUT (20s) · HEALTH_MARKER (/_next/)
# ============================================================================
set -uo pipefail

BASE_URL="${1:?Falta la URL base (uso: health-check.sh <BASE_URL> [ETIQUETA])}"
LABEL="${2:-frontend}"

ATTEMPTS="${HEALTH_ATTEMPTS:-18}"
SLEEP_SECS="${HEALTH_SLEEP:-20}"
CURL_TIMEOUT="${HEALTH_TIMEOUT:-20}"
MARKER="${HEALTH_MARKER:-/_next/}"

echo "== Health Check (frontend Next.js) — ${LABEL} (${BASE_URL}) =="

ok=""
for i in $(seq 1 "$ATTEMPTS"); do
  # -L sigue redirects · -s silencioso · -w '\n%{http_code}' anexa el código HTTP.
  resp="$(curl -L -s -w $'\n%{http_code}' --max-time "$CURL_TIMEOUT" "$BASE_URL" || true)"
  code="$(printf '%s' "$resp" | tail -n1)"
  body="$(printf '%s' "$resp" | sed '$d')"

  if [ "$code" = "200" ] && printf '%s' "$body" | grep -qF "$MARKER"; then
    echo "✅ ${LABEL} OK — HTTP 200 y render Next.js válido (marcador '${MARKER}') (intento ${i}/${ATTEMPTS})"
    ok="1"
    break
  fi

  if [ "$code" = "200" ]; then
    echo "Intento ${i}/${ATTEMPTS}: responde 200 pero sin el marcador '${MARKER}' (¿placeholder o build viejo?); reintentando…"
  else
    echo "Intento ${i}/${ATTEMPTS}: aún no operativo (HTTP ${code:-timeout})…"
  fi
  sleep "$SLEEP_SECS"
done

if [ -z "$ok" ]; then
  echo "❌ ${LABEL} no quedó operativo tras ${ATTEMPTS} intentos (¿build falló, sigue en curso, o placeholder de Render?)."
  exit 1
fi

# --- Smoke de seguridad: cabeceras (informativo, NO gatea) ---
echo "-- Cabeceras de seguridad en ${LABEL} — informativo --"
headers="$(curl -L -s -o /dev/null -D - --max-time "$CURL_TIMEOUT" "$BASE_URL" || true)"
for h in "content-security-policy" "x-frame-options" "x-content-type-options" "referrer-policy"; do
  if printf '%s' "$headers" | grep -iq "^${h}:"; then
    echo "  ✅ ${h} presente"
  else
    echo "  ⚠️  ${h} ausente (revisar headers en next.config.js de ${LABEL})"
  fi
done

echo "== ${LABEL}: verificación de salud completada con éxito =="
