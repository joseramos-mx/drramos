"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { useAplicacion } from "./aplicacion-context";

/**
 * Aplicacion · sidebar slide-in con formulario de 3 preguntas.
 *
 * Flujo de submit:
 *   1. POST a /api/lead (persiste el lead + dispara CAPI server-side).
 *   2. Si /api/lead devuelve 200: fbq trackCustom con MISMO eventId (dedup).
 *   3. Render pantalla de confirmación con CTA a WhatsApp cualificado.
 *
 * El WhatsApp sólo aparece DESPUÉS de guardar el lead, nunca antes.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const WHATSAPP_PHONE = "526182066760";

const QUESTIONS = [
  {
    id: "dientes",
    title: "¿Te faltan uno o más dientes, o sientes que alguno se mueve?",
    options: [
      { value: "intactos",        label: "No, los tengo todos y firmes" },
      { value: "faltan_o_flojos", label: "Sí, me falta alguno o se mueve" },
    ],
  },
  {
    id: "motivo",
    title: "¿Hay un motivo o fecha por la que quieres lograrlo?",
    options: [
      { value: "evento_boda", label: "Un evento o boda" },
      { value: "trabajo",     label: "Tema de trabajo o imagen" },
      { value: "merezco",     label: "Ya me lo merezco" },
      { value: "viendo",      label: "Solo viendo opciones" },
    ],
  },
  {
    id: "plan",
    title:
      "El diseño de sonrisa es una inversión con pago a meses. ¿Te late conocer tu plan?",
    options: [
      { value: "si_plan",       label: "Sí, quiero ver mi plan y mi mensualidad" },
      { value: "precio_rapido", label: "Solo quiero un precio rápido" },
    ],
  },
];

const LABELS = {
  dientes: {
    intactos: "Tengo todos los dientes y firmes",
    faltan_o_flojos: "Me falta alguno o se mueve",
  },
  motivo: {
    evento_boda: "Un evento o boda",
    trabajo: "Tema de trabajo o imagen",
    merezco: "Ya me lo merezco",
    viendo: "Solo viendo opciones",
  },
  plan: {
    si_plan: "Quiero ver mi plan y mi mensualidad",
    precio_rapido: "Solo quiero un precio rápido",
  },
};

// Lee fbp / fbc de cookies para enriquecer el evento CAPI server-side
function readCookie(name) {
  if (typeof document === "undefined") return undefined;
  const value = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.split("=")[1]) : undefined;
}

function buildWhatsappUrl({ nombre, whatsapp, answers }) {
  const msg = `Hola Dr. Felipe, completé la aplicación.

Soy ${nombre}.
Mi WhatsApp: ${whatsapp}.

Mi situación: ${LABELS.dientes[answers.dientes]}.
Mi motivo: ${LABELS.motivo[answers.motivo]}.
Sobre el plan: ${LABELS.plan[answers.plan]}.

Me gustaría coordinar mi valoración privada.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}

export default function AplicacionModal() {
  const { open, closeModal } = useAplicacion();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ nombre: "", whatsapp: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const totalSteps = QUESTIONS.length + 1;
  const isContactStep = step >= QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];
  const isSuccess = status === "success";
  const progress = isSuccess
    ? 100
    : (Math.min(step + 1, totalSteps) / totalSteps) * 100;

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset al cerrar
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStep(0);
      setAnswers({});
      setContact({ nombre: "", whatsapp: "" });
      setStatus("idle");
      setErrorMsg("");
    }, 600);
    return () => clearTimeout(t);
  }, [open]);

  // ESC cierra
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(() => setStep((s) => s + 1), 320);
  }, []);

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "submitting") return;

    const esReconstruccion = answers.dientes === "faltan_o_flojos";
    const evento = esReconstruccion ? "LeadReconstruccion" : "LeadDisenoSonrisa";
    const track = esReconstruccion ? "full_mouth" : "estetica";
    const eventId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const payload = {
      eventId,
      evento,
      track,
      nombre: contact.nombre.trim(),
      whatsapp: contact.whatsapp.trim(),
      answers,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
    };

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.detail) {
          console.error("[aplicacion] backend detail:", data.detail);
        }
        throw new Error(data?.error || `status_${res.status}`);
      }

      // Pixel client-side con el MISMO nombre neutral, eventId, value y
      // currency que devolvió el server. Esa identidad estricta es lo
      // que permite a Meta deduplicar contra el evento CAPI.
      // Nada de track, motivo, plan ni dientes acá: no es información
      // que deba ver Meta.
      if (
        typeof window !== "undefined" &&
        typeof window.fbq === "function" &&
        data.pixel
      ) {
        window.fbq(
          "trackCustom",
          data.pixel.eventName,
          {
            value: data.pixel.value,
            currency: data.pixel.currency,
          },
          { eventID: data.pixel.eventId }
        );
      }

      setStatus("success");
    } catch (err) {
      console.error("[aplicacion] submit", err);
      setErrorMsg(
        "No pudimos guardar tu aplicación. Intenta de nuevo en unos segundos."
      );
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-0 z-[100]"
          aria-modal="true"
          role="dialog"
          aria-label="Aplicación de 3 preguntas"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeModal}
            className="absolute inset-0 bg-[#000000]/85 backdrop-blur-xl"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/[0.1] bg-[#000000] shadow-[-24px_0_60px_-24px_rgba(0,0,0,0.7)] sm:max-w-[480px] md:max-w-[560px]"
          >
            {/* Progress bar */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: EASE }}
                className="h-full bg-[#b89968]"
              />
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Cerrar aplicación"
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center text-white/55 transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
            >
              <XIcon size={22} weight="thin" />
            </button>

            <div className="flex-1 overflow-y-auto p-7 pt-20 md:p-12 md:pt-24">
              {/* Step counter — sólo durante el form */}
              {!isSuccess && (
                <p className="mb-6 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.3em] text-[#b89968]">
                  Paso {Math.min(step + 1, totalSteps)} de {totalSteps}
                </p>
              )}

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <ConfirmationView
                    key="success"
                    contact={contact}
                    answers={answers}
                    onClose={closeModal}
                  />
                ) : !isContactStep ? (
                  <motion.div
                    key={`q-${step}`}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <h2 className="font-[family-name:var(--font-cormorant)] font-light leading-[1.2] tracking-[-0.005em] text-[clamp(22px,2.6vw,30px)] text-[#f5f1ea]">
                      {currentQuestion.title}
                    </h2>

                    <div className="mt-9 space-y-3">
                      {currentQuestion.options.map((opt) => {
                        const selected = answers[currentQuestion.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                            className={`group flex w-full items-center justify-between gap-4 border px-6 py-5 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${
                              selected
                                ? "border-[#b89968] bg-[#b89968]/[0.08]"
                                : "border-white/[0.12] hover:border-white/30 hover:bg-white/[0.02]"
                            }`}
                          >
                            <span className="font-[family-name:var(--font-albert)] text-[16px] font-light text-[#f5f1ea]">
                              {opt.label}
                            </span>
                            <span
                              aria-hidden
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                                selected
                                  ? "border-[#b89968] bg-[#b89968]"
                                  : "border-white/25 group-hover:border-white/45"
                              }`}
                            >
                              {selected && (
                                <CheckIcon
                                  size={12}
                                  weight="bold"
                                  className="text-[#000000]"
                                />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="contact"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    onSubmit={handleSubmit}
                  >
                    <h2 className="font-[family-name:var(--font-cormorant)] font-light leading-[1.2] tracking-[-0.005em] text-[clamp(22px,2.6vw,30px)] text-[#f5f1ea]">
                      ¿Cómo te contactamos?
                    </h2>
                    <p className="mt-3 font-[family-name:var(--font-albert)] text-[14px] font-light leading-[1.6] text-white/55">
                      Te escribimos para coordinar tu valoración privada.
                    </p>

                    <div className="mt-9 space-y-5">
                      <div>
                        <label
                          htmlFor="nombre"
                          className="mb-2 block font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.22em] text-white/55"
                        >
                          Nombre
                        </label>
                        <input
                          id="nombre"
                          type="text"
                          required
                          autoComplete="name"
                          value={contact.nombre}
                          onChange={(e) =>
                            setContact({ ...contact, nombre: e.target.value })
                          }
                          className="min-h-[52px] w-full border border-white/[0.12] bg-transparent px-5 py-4 font-[family-name:var(--font-albert)] text-[16px] font-light text-[#f5f1ea] placeholder:text-white/25 transition-colors duration-300 focus:border-[#b89968] focus:outline-none"
                          placeholder="Tu nombre"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="whatsapp"
                          className="mb-2 block font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.22em] text-white/55"
                        >
                          WhatsApp
                        </label>
                        <input
                          id="whatsapp"
                          type="tel"
                          required
                          autoComplete="tel"
                          inputMode="tel"
                          value={contact.whatsapp}
                          onChange={(e) =>
                            setContact({ ...contact, whatsapp: e.target.value })
                          }
                          className="min-h-[52px] w-full border border-white/[0.12] bg-transparent px-5 py-4 font-[family-name:var(--font-albert)] text-[16px] font-light text-[#f5f1ea] placeholder:text-white/25 transition-colors duration-300 focus:border-[#b89968] focus:outline-none"
                          placeholder="+52..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      data-event="application_submit"
                      className="group mt-10 inline-flex min-h-[56px] w-full items-center justify-between gap-3 bg-[#f5f1ea] px-7 py-4 font-[family-name:var(--font-albert)] text-[15px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968] disabled:opacity-60"
                    >
                      {status === "submitting" ? "Enviando..." : "Enviar aplicación"}
                      {status !== "submitting" && (
                        <ArrowRightIcon
                          size={18}
                          weight="light"
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      )}
                    </button>

                    {status === "error" && (
                      <p
                        role="alert"
                        aria-live="polite"
                        className="mt-4 font-[family-name:var(--font-albert)] text-[12px] font-light leading-[1.6] text-[#ff7a7a]"
                      >
                        {errorMsg}
                      </p>
                    )}

                    <p className="mt-4 font-[family-name:var(--font-albert)] text-[11px] font-light leading-[1.6] text-white/40">
                      Solo te contactamos para tu valoración. Tus datos no se
                      comparten con terceros.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>

              {step > 0 && !isContactStep && !isSuccess && (
                <button
                  type="button"
                  onClick={goBack}
                  className="mt-8 inline-flex min-h-[44px] items-center gap-2 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.22em] text-white/45 transition-colors duration-300 hover:text-white/85"
                >
                  <ArrowLeftIcon size={14} weight="thin" />
                  Anterior
                </button>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
//  Pantalla de confirmación · WhatsApp post-aplicación
// ─────────────────────────────────────────────────────────────
function ConfirmationView({ contact, answers, onClose }) {
  const wa = buildWhatsappUrl(contact.nombre && answers.dientes ? {
    nombre: contact.nombre.trim(),
    whatsapp: contact.whatsapp.trim(),
    answers,
  } : { nombre: "", whatsapp: "", answers: {} });

  const first = (contact.nombre || "").trim().split(/\s+/)[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: EASE }}
      role="status"
      aria-live="polite"
    >
      <p className="font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.3em] text-[#b89968]">
        Recibimos tu aplicación
      </p>

      <h2 className="mt-6 font-[family-name:var(--font-cormorant)] font-light leading-[1.05] tracking-[-0.005em] text-[clamp(28px,3.2vw,40px)] text-[#f5f1ea]">
        {first ? `Gracias, ${first}.` : "Gracias."}
      </h2>

      <p className="mt-5 font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/70">
        Revisamos tu caso y te contactamos en horario de consultorio para
        coordinar tu valoración privada. Si prefieres, puedes continuar la
        conversación ahora por WhatsApp con tu información ya cargada.
      </p>

      <a
        href={wa}
        target="_blank"
        rel="noopener"
        data-event="whatsapp_post_application"
        onClick={onClose}
        className="group mt-9 inline-flex min-h-[56px] w-full items-center justify-between gap-3 bg-[#25D366] px-7 py-4 font-[family-name:var(--font-albert)] text-[15px] font-medium tracking-[0.02em] text-white transition-transform duration-300 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]"
      >
        <span className="inline-flex items-center gap-3">
          <WhatsappLogoIcon size={20} weight="light" />
          Continuar por WhatsApp
        </span>
        <ArrowRightIcon
          size={18}
          weight="light"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </a>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 inline-flex min-h-[44px] items-center font-[family-name:var(--font-albert)] text-[12px] font-light uppercase tracking-[0.22em] text-white/55 transition-colors duration-300 hover:text-white"
      >
        Cerrar
      </button>
    </motion.div>
  );
}
