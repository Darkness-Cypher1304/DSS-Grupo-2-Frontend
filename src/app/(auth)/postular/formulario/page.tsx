'use client';

// ============================================================================
// /postular/formulario — PANTALLA 9.5 (intermedia): formulario de postulación
// ============================================================================
// El especialista completa TODOS sus datos, sube CV (PDF) y DNI, y envía. NO se
// crea ninguna cuenta: se crea una MedicalApplication (POST /applications). La
// cuenta solo existe si un administrador aprueba la postulación.
// Se envían EXACTAMENTE los campos del DTO (el backend usa forbidNonWhitelisted).
// ============================================================================

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Brain,
  Loader2,
  ShieldCheck,
  FileText,
  IdCard,
  UploadCloud,
  CheckCircle2,
  X,
} from 'lucide-react';

import { api } from '@/lib/api-client';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (igual que el backend)

const schema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto').max(60).regex(/^[A-Za-zÀ-ÿñÑ\s'-]+$/, 'Solo letras'),
  lastName: z.string().min(2, 'Apellido muy corto').max(60).regex(/^[A-Za-zÀ-ÿñÑ\s'-]+$/, 'Solo letras'),
  email: z.string().email('Correo inválido').max(255),
  phoneNumber: z.string().regex(/^\+?[0-9\s-]{6,20}$/, 'Teléfono inválido'),
  licenseNumber: z.string().min(3, 'Ingresa tu colegiatura').max(50),
  specialty: z.string().min(3, 'Ingresa tu especialidad').max(100),
  university: z.string().min(2, 'Ingresa tu universidad').max(150),
  country: z.string().min(2, 'Ingresa tu país').max(80),
  linkedinUrl: z
    .string()
    .max(255)
    .regex(/^https?:\/\/([\w-]+\.)+[\w-]+(\/\S*)?$/, 'URL inválida')
    .optional()
    .or(z.literal('')),
  yearsOfExperience: z.coerce.number().int().min(0, 'Inválido').max(60, 'Inválido'),
  availability: z.string().min(3, 'Indica tu disponibilidad').max(500),
  motivationLetter: z.string().min(20, 'Cuéntanos un poco más (mín. 20 caracteres)').max(3000),
  consentAccepted: z
    .boolean()
    .refine((v) => v === true, { message: 'Debes aceptar la verificación de credenciales' }),
});

type FormValues = z.infer<typeof schema>;

export default function ApplicationFormPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { yearsOfExperience: 1 },
  });

  function validateFiles(): boolean {
    setFileError(null);
    if (!cvFile) {
      setFileError('Adjunta tu currículum en PDF.');
      return false;
    }
    if (cvFile.type !== 'application/pdf') {
      setFileError('El currículum debe ser un archivo PDF.');
      return false;
    }
    if (!dniFile) {
      setFileError('Adjunta tu documento de identidad (DNI).');
      return false;
    }
    const okDni = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(dniFile.type);
    if (!okDni) {
      setFileError('El DNI debe ser PDF, JPG, PNG o WebP.');
      return false;
    }
    if (cvFile.size > MAX_BYTES || dniFile.size > MAX_BYTES) {
      setFileError('Cada archivo debe pesar máximo 4 MB.');
      return false;
    }
    return true;
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    if (!validateFiles()) return;

    const fd = new FormData();
    fd.append('firstName', values.firstName);
    fd.append('lastName', values.lastName);
    fd.append('email', values.email);
    fd.append('phoneNumber', values.phoneNumber);
    fd.append('licenseNumber', values.licenseNumber);
    fd.append('specialty', values.specialty);
    fd.append('university', values.university);
    fd.append('country', values.country);
    if (values.linkedinUrl) fd.append('linkedinUrl', values.linkedinUrl);
    fd.append('yearsOfExperience', String(values.yearsOfExperience));
    fd.append('availability', values.availability);
    fd.append('motivationLetter', values.motivationLetter);
    fd.append('consentAccepted', 'true');
    fd.append('cv', cvFile as File);
    fd.append('dni', dniFile as File);

    try {
      await api.post('/applications', fd);
      router.push('/postular/enviado');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const msg = error.response?.data?.message;
      setServerError(
        Array.isArray(msg)
          ? msg.join(' · ')
          : msg || 'No pudimos enviar tu postulación. Revisa los datos e inténtalo de nuevo.',
      );
    }
  }

  return (
    <main className="min-h-screen bg-bone-50">
      <header className="border-b border-bone-200 bg-bone-50/80 backdrop-blur sticky top-0 z-10">
        <div className="container-wide flex items-center justify-between py-4">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
              <Brain size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
          </Link>
          <Link href="/postular" className="text-sm text-ink-mute hover:text-teal-700">
            ← Volver
          </Link>
        </div>
      </header>

      <div className="container-narrow py-10 md:py-14">
        <span className="text-xs font-mono uppercase tracking-widest text-coral-700">
          Postulación · paso 2 de 2
        </span>
        <h1 className="font-display text-4xl tracking-tightest mt-2 mb-2">Completa tu postulación</h1>
        <p className="text-ink-mute mb-8 max-w-xl">
          Revisaremos tu información y te contactaremos para coordinar una reunión de evaluación.
          Aún no se crea ninguna cuenta.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* -------------------------------------------------- Datos personales */}
          <section className="card">
            <h2 className="font-display text-xl mb-5">Datos personales y profesionales</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nombre" error={errors.firstName?.message}>
                <input className="input" placeholder="María" {...register('firstName')} />
              </Field>
              <Field label="Apellido" error={errors.lastName?.message}>
                <input className="input" placeholder="López Quispe" {...register('lastName')} />
              </Field>
              <Field label="Correo electrónico" error={errors.email?.message}>
                <input className="input" type="email" placeholder="dra.lopez@gmail.com" {...register('email')} />
              </Field>
              <Field label="Teléfono" error={errors.phoneNumber?.message}>
                <input className="input" type="tel" placeholder="+51 987 654 321" {...register('phoneNumber')} />
              </Field>
              <Field label="N° de colegiatura (CMP)" error={errors.licenseNumber?.message}>
                <input className="input" placeholder="CMP-12345" {...register('licenseNumber')} />
              </Field>
              <Field label="Especialidad" error={errors.specialty?.message}>
                <input className="input" placeholder="Pediatría del Desarrollo" {...register('specialty')} />
              </Field>
              <Field label="Universidad" error={errors.university?.message}>
                <input className="input" placeholder="Universidad Peruana Cayetano Heredia" {...register('university')} />
              </Field>
              <Field label="País" error={errors.country?.message}>
                <input className="input" placeholder="Perú" {...register('country')} />
              </Field>
            </div>
          </section>

          {/* ------------------------------------------------------ Documentos */}
          <section className="card">
            <h2 className="font-display text-xl mb-1">Documentos y credenciales</h2>
            <p className="text-sm text-ink-mute mb-5">
              Se validan por contenido (magic-bytes) y se registra su huella SHA-256. Máx. 4 MB c/u.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <FileField
                label="Currículum (PDF)"
                icon={<FileText size={18} />}
                accept="application/pdf"
                file={cvFile}
                onChange={setCvFile}
              />
              <FileField
                label="Documento de identidad (DNI)"
                icon={<IdCard size={18} />}
                accept="application/pdf,image/*"
                file={dniFile}
                onChange={setDniFile}
              />
            </div>
            <Field label="LinkedIn (opcional)" error={errors.linkedinUrl?.message} className="mt-4">
              <input className="input" placeholder="https://linkedin.com/in/tu-perfil" {...register('linkedinUrl')} />
            </Field>
            {fileError && (
              <div className="mt-4 rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
                {fileError}
              </div>
            )}
          </section>

          {/* -------------------------------------------------- Perfil profesional */}
          <section className="card">
            <h2 className="font-display text-xl mb-5">Perfil profesional</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Años de experiencia" error={errors.yearsOfExperience?.message}>
                <input className="input" type="number" min={0} max={60} {...register('yearsOfExperience')} />
              </Field>
              <Field label="Disponibilidad" error={errors.availability?.message}>
                <input className="input" placeholder="Lunes a viernes, tardes" {...register('availability')} />
              </Field>
            </div>
            <Field label="Carta de motivación" error={errors.motivationLetter?.message} className="mt-4">
              <textarea
                className="input min-h-[120px] resize-y"
                placeholder="Cuéntanos por qué deseas colaborar con NeuroAlert y tu experiencia con TEA…"
                {...register('motivationLetter')}
              />
            </Field>
          </section>

          {/* --------------------------------------------------- Consentimiento */}
          <section className="card-clinical">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 accent-teal-700" {...register('consentAccepted')} />
              <span className="text-sm text-ink-soft">
                Acepto que NeuroAlert verifique mis credenciales profesionales (colegiatura, identidad
                y experiencia) como parte del proceso de evaluación.
              </span>
            </label>
            {errors.consentAccepted && (
              <p className="text-xs text-coral-600 mt-2 ml-7">{errors.consentAccepted.message}</p>
            )}
          </section>

          {serverError && (
            <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
              {serverError}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="flex items-center gap-1.5 text-xs text-ink-fade">
              <ShieldCheck size={14} className="text-teal-600" /> Nunca te pediremos una contraseña
              aquí. La crearás tú si tu postulación es aprobada.
            </p>
            <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 text-base">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// ----------------------------------------------------------------------------
// Sub-componentes
// ----------------------------------------------------------------------------
function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-coral-600 mt-1.5">{error}</p>}
    </div>
  );
}

function FileField({
  label,
  icon,
  accept,
  file,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const sizeKb = useMemo(() => (file ? Math.round(file.size / 1024) : 0), [file]);
  const inputId = `file-${label.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label className="label">{label}</label>
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3">
          <CheckCircle2 size={18} className="text-teal-700 shrink-0" />
          <span className="text-sm text-ink-soft truncate flex-1">
            {file.name} <span className="text-ink-fade">· {sizeKb} KB</span>
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-ink-mute hover:text-coral-600"
            aria-label="Quitar archivo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex items-center gap-3 rounded-xl border border-dashed border-bone-300 bg-bone-50 px-4 py-3 cursor-pointer hover:border-teal-400 hover:bg-white transition-colors text-ink-mute"
        >
          <span className="text-teal-600">{icon ?? <UploadCloud size={18} />}</span>
          <span className="text-sm">Seleccionar archivo…</span>
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
