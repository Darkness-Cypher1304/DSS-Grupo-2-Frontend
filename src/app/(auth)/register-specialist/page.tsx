'use client';

// ============================================================================
// /register-specialist — registro público de ESPECIALISTAS (página separada)
// ============================================================================
// Crea la cuenta (PENDING_VERIFICATION) + un perfil de especialista en estado
// PENDING vía POST /auth/register-specialist. El rol NO sube a SPECIALIST hasta
// que un ADMIN apruebe la colegiatura en su cola. Misma seguridad que el
// registro normal (blocklist de contraseñas, anti-enumeración, verificación de
// correo). Pensada para pediatras/psicólogos, separada del registro de padres.
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Brain, CheckCircle, Loader2, ShieldCheck, Stethoscope } from 'lucide-react';

import { apiPost } from '@/lib/api-client';

const schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Tu nombre es muy corto')
      .max(100)
      .regex(/^[A-Za-zÀ-ÿñÑ\s'-]+$/, 'Solo letras y espacios'),
    email: z.string().email('Correo inválido').max(255),
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9\s-]{6,20}$/, 'Teléfono inválido')
      .optional()
      .or(z.literal('')),
    licenseNumber: z.string().min(3, 'Ingresa tu colegiatura').max(50),
    specialty: z.string().min(3, 'Ingresa tu especialidad').max(100),
    institution: z.string().max(150).optional().or(z.literal('')),
    yearsOfExperience: z.coerce.number().int().min(0, 'Inválido').max(60, 'Inválido'),
    password: z.string().min(12, 'Mínimo 12 caracteres').max(128, 'Máximo 128 caracteres'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterSpecialistPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { yearsOfExperience: 1 },
  });

  const password = watch('password', '');

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await apiPost<{ message: string }>('/auth/register-specialist', {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        licenseNumber: values.licenseNumber,
        specialty: values.specialty,
        institution: values.institution || undefined,
        yearsOfExperience: Number(values.yearsOfExperience),
      });
      setSuccess(res.message);
      setTimeout(() => router.push('/login'), 3500);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const msg = error.response?.data?.message;
      setServerError(
        Array.isArray(msg)
          ? msg.join(' · ')
          : msg || 'No pudimos registrar tu solicitud. Revisa los datos e inténtalo de nuevo.',
      );
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-bone-50">
      <div className="flex flex-col justify-center p-8 md:p-16">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-bone-50 group-hover:bg-teal-800 transition-colors">
              <Brain size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl tracking-tightest font-medium">NeuroAlert</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-coral-700 mb-2">
            <Stethoscope size={13} /> Para profesionales
          </span>
          <h1 className="font-display text-4xl tracking-tightest mb-2">Registro de especialista</h1>
          <p className="text-ink-mute mb-8">
            Crea tu cuenta profesional. Verificaremos tu correo y un administrador revisará tu
            colegiatura antes de habilitarte para responder consultas.
          </p>

          {success ? (
            <div className="rounded-2xl bg-teal-50 border border-teal-200 p-6 text-center">
              <CheckCircle className="mx-auto text-teal-700 mb-3" size={40} />
              <h3 className="font-display text-2xl mb-2">Solicitud recibida</h3>
              <p className="text-sm text-ink-soft">{success}</p>
              <p className="text-xs text-ink-mute mt-3">Te redirigiremos al login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="fullName" className="label">Nombre completo</label>
                <input id="fullName" type="text" autoComplete="name" placeholder="María López Quispe" className="input" {...register('fullName')} />
                {errors.fullName && <p className="text-xs text-coral-600 mt-1.5">{errors.fullName.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="label">Correo electrónico</label>
                <input id="email" type="email" autoComplete="email" placeholder="dra.lopez@hospital.pe" className="input" {...register('email')} />
                {errors.email && <p className="text-xs text-coral-600 mt-1.5">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="licenseNumber" className="label">N° colegiatura</label>
                  <input id="licenseNumber" type="text" placeholder="CMP-12345" className="input" {...register('licenseNumber')} />
                  {errors.licenseNumber && <p className="text-xs text-coral-600 mt-1.5">{errors.licenseNumber.message}</p>}
                </div>
                <div>
                  <label htmlFor="specialty" className="label">Especialidad</label>
                  <input id="specialty" type="text" placeholder="Pediatría" className="input" {...register('specialty')} />
                  {errors.specialty && <p className="text-xs text-coral-600 mt-1.5">{errors.specialty.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="institution" className="label">
                    Institución <span className="text-ink-fade font-normal">(opc.)</span>
                  </label>
                  <input id="institution" type="text" placeholder="Hospital / clínica" className="input" {...register('institution')} />
                </div>
                <div>
                  <label htmlFor="yearsOfExperience" className="label">Años de experiencia</label>
                  <input id="yearsOfExperience" type="number" min={0} max={60} className="input" {...register('yearsOfExperience')} />
                  {errors.yearsOfExperience && <p className="text-xs text-coral-600 mt-1.5">{errors.yearsOfExperience.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="label">
                  Teléfono <span className="text-ink-fade font-normal">(opcional)</span>
                </label>
                <input id="phoneNumber" type="tel" autoComplete="tel" placeholder="+51 987 654 321" className="input" {...register('phoneNumber')} />
                {errors.phoneNumber && <p className="text-xs text-coral-600 mt-1.5">{errors.phoneNumber.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="label">Contraseña</label>
                <input id="password" type="password" autoComplete="new-password" placeholder="Mínimo 12 caracteres" className="input" {...register('password')} />
                {errors.password && <p className="text-xs text-coral-600 mt-1.5">{errors.password.message}</p>}
                <PasswordStrength value={password} />
              </div>

              <div>
                <label htmlFor="passwordConfirm" className="label">Confirma tu contraseña</label>
                <input id="passwordConfirm" type="password" autoComplete="new-password" placeholder="Repítela" className="input" {...register('passwordConfirm')} />
                {errors.passwordConfirm && <p className="text-xs text-coral-600 mt-1.5">{errors.passwordConfirm.message}</p>}
              </div>

              <div className="flex items-start gap-2 text-xs text-ink-fade">
                <ShieldCheck size={14} className="text-teal-600 mt-0.5 shrink-0" />
                <span>
                  Tras verificar tu correo, podrás iniciar sesión; un administrador validará tu
                  colegiatura para activar tu perfil. Podrás adjuntar tu licencia y CV luego.
                </span>
              </div>

              {serverError && (
                <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-800">
                  {serverError}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Enviar solicitud de registro'}
              </button>
            </form>
          )}

          <p className="mt-8 text-sm text-ink-mute text-center">
            ¿Eres padre o cuidador?{' '}
            <Link href="/register" className="text-teal-700 font-medium hover:underline">
              Crear cuenta de usuario
            </Link>
          </p>
          <p className="mt-2 text-sm text-ink-mute text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-teal-700 font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Lado decorativo */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-teal-800 via-teal-900 to-teal-950 text-bone-50 overflow-hidden p-16">
        <div className="absolute inset-0 grain-overlay opacity-50" />
        <div className="relative z-10 flex flex-col justify-center max-w-md">
          <span className="text-xs font-mono uppercase tracking-widest text-teal-300 mb-4">
            Especialistas verificados
          </span>
          <h2 className="font-display text-4xl leading-tight mb-8">
            Acompaña a las familias
            <br />
            <span className="italic font-light">con tu experiencia.</span>
          </h2>
          <div className="space-y-4">
            <FeatureBullet>Responde consultas de padres sobre señales tempranas de TEA</FeatureBullet>
            <FeatureBullet>Tu colegiatura es verificada por un administrador</FeatureBullet>
            <FeatureBullet>Publica artículos y recursos acreditados</FeatureBullet>
            <FeatureBullet>Tus credenciales y datos, protegidos y aislados por usuario</FeatureBullet>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureBullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle size={20} className="text-teal-300 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-teal-50">{children}</span>
    </div>
  );
}

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;

  let strength = 0;
  if (value.length >= 12) strength += 1;
  if (value.length >= 16) strength += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) strength += 1;
  if (/[0-9]/.test(value)) strength += 1;
  if (/[^A-Za-z0-9]/.test(value)) strength += 1;

  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'];
  const colors = ['bg-coral-500', 'bg-coral-400', 'bg-amber-400', 'bg-teal-400', 'bg-teal-600'];
  const idx = Math.min(strength, 4);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= idx ? colors[idx] : 'bg-bone-200'}`} />
        ))}
      </div>
      <p className="text-xs text-ink-mute mt-1">Fuerza: {labels[idx]}</p>
    </div>
  );
}
