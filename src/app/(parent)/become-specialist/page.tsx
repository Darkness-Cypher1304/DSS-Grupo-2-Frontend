'use client';

// ============================================================================
// /become-specialist — solicitud de upgrade a SPECIALIST con documentos (RF-10)
// ============================================================================
// Sube la licencia (CMP/CPsP) y el CV a /storage/upload (valida magic-bytes +
// SHA-256 + tamaño en el servidor) y luego envía /users/me/request-specialist
// con los IDs de los FileObject. Un ADMIN los revisa y aprueba/rechaza.
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, UploadCloud, FileText, ShieldCheck } from 'lucide-react';

import { api } from '@/lib/api-client';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// Sube un archivo y devuelve el ID del FileObject creado.
async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await api.post<{ data: { id: string } }>('/storage/upload', fd);
  return res.data.data.id;
}

function humanSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function BecomeSpecialistPage() {
  const [form, setForm] = useState({
    licenseNumber: '',
    specialty: '',
    institution: '',
    yearsOfExperience: 1,
    bio: '',
  });
  const [license, setLicense] = useState<File | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function validateFile(file: File): string | null {
    if (!ALLOWED.includes(file.type)) return 'Formato no permitido. Usa PDF, JPG, PNG o WebP.';
    if (file.size > MAX_BYTES) return 'El archivo supera 4 MB.';
    return null;
  }

  function pickFile(setter: (f: File | null) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          setter(null);
          e.target.value = '';
          return;
        }
      }
      setError(null);
      setter(file);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.licenseNumber.trim().length < 3) return setError('Ingresa tu número de colegiatura.');
    if (form.specialty.trim().length < 3) return setError('Ingresa tu especialidad.');
    if (!license) return setError('Adjunta el documento de tu licencia profesional.');

    setSubmitting(true);
    try {
      const licenseDocumentId = await uploadFile(license, 'specialist-docs');
      const cvDocumentId = cv ? await uploadFile(cv, 'specialist-docs') : undefined;

      await api.post('/users/me/request-specialist', {
        licenseNumber: form.licenseNumber.trim(),
        specialty: form.specialty.trim(),
        institution: form.institution.trim() || undefined,
        yearsOfExperience: Number(form.yearsOfExperience),
        bio: form.bio.trim() || undefined,
        licenseDocumentId,
        cvDocumentId,
      });
      setDone(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'No pudimos enviar tu solicitud. Revisa los datos e inténtalo de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container-narrow py-12 min-h-screen">
        <div className="animate-fade-in-up max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 mb-6">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-display text-4xl tracking-tightest mb-3">Solicitud enviada</h1>
          <p className="text-ink-mute mb-8">
            Un administrador revisará tu colegiatura y tus documentos. Te avisaremos cuando tu
            cuenta sea verificada como especialista.
          </p>
          <Link href="/dashboard" className="btn-primary px-8 py-3.5">
            Volver al inicio <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow py-12 min-h-screen">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink-mute hover:text-teal-700 mb-8">
        <ArrowLeft size={16} /> Volver
      </Link>

      <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
        Verificación profesional
      </span>
      <h1 className="font-display text-4xl tracking-tightest mt-2 mb-3">Conviértete en especialista</h1>
      <p className="text-ink-mute mb-8 max-w-xl">
        Comparte tus credenciales y adjunta tu licencia profesional (CMP/CPsP). Un administrador
        las verificará antes de habilitar tu perfil para responder consultas.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Número de colegiatura</label>
            <input
              className="input"
              placeholder="CMP-12345"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Especialidad</label>
            <input
              className="input"
              placeholder="Pediatría del Desarrollo"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Institución <span className="text-ink-fade font-normal">(opcional)</span></label>
            <input
              className="input"
              placeholder="Hospital / clínica"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Años de experiencia</label>
            <input
              type="number"
              min={0}
              max={60}
              className="input"
              value={form.yearsOfExperience}
              onChange={(e) => setForm({ ...form, yearsOfExperience: parseInt(e.target.value || '0', 10) })}
            />
          </div>
        </div>

        <div>
          <label className="label">Bio <span className="text-ink-fade font-normal">(opcional)</span></label>
          <textarea
            rows={3}
            className="input resize-y"
            placeholder="Cuéntanos brevemente sobre tu experiencia con TEA."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <FileField
          label="Licencia profesional"
          required
          file={license}
          onChange={pickFile(setLicense)}
        />
        <FileField
          label="CV (opcional)"
          file={cv}
          onChange={pickFile(setCv)}
        />

        <div className="flex items-start gap-2 text-xs text-ink-fade">
          <ShieldCheck size={14} className="text-teal-600 mt-0.5 shrink-0" />
          <span>
            Formatos: PDF, JPG, PNG o WebP · máx. 4 MB. El servidor valida el contenido real del
            archivo (no solo la extensión) y guarda un hash de integridad.
          </span>
        </div>

        {error && (
          <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary px-8 py-3.5 text-base">
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Enviando…
            </>
          ) : (
            <>
              Enviar solicitud <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function FileField({
  label,
  required,
  file,
  onChange,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-coral-600">*</span>}
      </label>
      <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-bone-300 hover:border-teal-400 cursor-pointer transition-colors bg-bone-50">
        {file ? <FileText size={18} className="text-teal-700 shrink-0" /> : <UploadCloud size={18} className="text-ink-fade shrink-0" />}
        <span className="text-sm text-ink-soft truncate">
          {file ? `${file.name} · ${humanSize(file.size)}` : 'Selecciona un archivo (PDF/JPG/PNG/WebP)'}
        </span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onChange}
        />
      </label>
    </div>
  );
}
