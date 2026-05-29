"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon } from "@phosphor-icons/react";

/**
 * Aplicación · formulario de 3 preguntas (Modo B del blueprint).
 * - Q1 = detector de reconstrucción ($100k track) vs diseño de sonrisa estética.
 * - Q2 = motivo (boda / trabajo / merezco / viendo).
 * - Q3 = intención sobre plan a meses.
 * - Al submit: dispara Pixel event correcto + abre WhatsApp con contexto.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const WHATSAPP_PHONE = "526182066760";

const QUESTIONS = [
  {
    id: "dientes",
    title: "¿Te faltan uno o más dientes, o sientes que alguno se mueve?",
    options: [
      { value: "intactos",         label: "No, los tengo todos y firmes" },
      { value: "faltan_o_flojos",  label: "Sí, me falta alguno o se mueve" },
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
    title: "El diseño de sonrisa es una inversión con pago a meses. ¿Te late conocer tu plan?",
    options: [
      { value: "si_plan",        label: "Sí, quiero ver mi plan y mi mensualidad" },
      { value: "precio_rapido",  label: "Solo quiero un precio rápido" },
    ],
  },
];

// Labels legibles para el mensaje de WhatsApp
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

export default function AplicacionModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ nombre: "", whatsapp: "" });

  const totalSteps = QUESTIONS.length + 1;
  const isContactStep = step >= QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / totalSteps) * 100;

  // Body scroll lock cuando está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset al cerrar (con delay para no parpadear durante el exit)
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(0);
        setAnswers({});
        setContact({ nombre: "", whatsapp: "" });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC para cerrar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(() => setStep((s) => s + 1), 320);
  }, []);

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = (e) => {
    e.preventDefault();

    const esReconstruccion = answers.dientes === "faltan_o_flojos";

    // Pixel event — placeholder; sólo se dispara si Meta Pixel ya está inicializado
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq(
        "trackCustom",
        esReconstruccion ? "LeadReconstruccion" : "LeadDisenoSonrisa",
        {
          track: esReconstruccion ? "full_mouth" : "estetica",
          motivo: answers.motivo,
          plan: answers.plan,
        }
      );
    }

    // WhatsApp cualificado: el doctor recibe el lead con todo el contexto
    const msg = `Hola Dr. Felipe, completé la aplicación.

Soy ${contact.nombre.trim()}.
Mi WhatsApp: ${contact.whatsapp.trim()}

Mi situación: ${LABELS.dientes[answers.dientes]}.
Mi motivo: ${LABELS.motivo[answers.motivo]}.
Sobre el plan: ${LABELS.plan[answers.plan]}.

Me gustaría coordinar mi valoración privada.`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener");

    onClose();
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
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute inset-0 bg-[#000000]/85 backdrop-blur-xl"
          />

          {/* Sidebar — slide-in desde la derecha */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/[0.1] bg-[#000000] shadow-[-24px_0_60px_-24px_rgba(0,0,0,0.7)] sm:max-w-[480px] md:max-w-[560px]"
          >
            {/* Progress bar superior */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/[0.08]">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: EASE }}
                className="h-full bg-[#b89968]"
              />
            </div>

            {/* Close — tap target 48x48 accesible */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar aplicación"
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center text-white/55 transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
            >
              <XIcon size={22} weight="thin" />
            </button>

            {/* Content — scrollable internamente */}
            <div className="flex-1 overflow-y-auto p-7 pt-20 md:p-12 md:pt-24">
              {/* Step counter */}
              <p className="mb-6 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.3em] text-[#b89968]">
                Paso {Math.min(step + 1, totalSteps)} de {totalSteps}
              </p>

              <AnimatePresence mode="wait">
                {!isContactStep ? (
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
                              {selected && <CheckIcon size={12} weight="bold" className="text-[#000000]" />}
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
                          onChange={(e) => setContact({ ...contact, nombre: e.target.value })}
                          className="w-full border border-white/[0.12] bg-transparent px-5 py-4 font-[family-name:var(--font-albert)] text-[15px] font-light text-[#f5f1ea] placeholder:text-white/25 transition-colors duration-300 focus:border-[#b89968] focus:outline-none"
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
                          onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                          className="w-full border border-white/[0.12] bg-transparent px-5 py-4 font-[family-name:var(--font-albert)] text-[15px] font-light text-[#f5f1ea] placeholder:text-white/25 transition-colors duration-300 focus:border-[#b89968] focus:outline-none"
                          placeholder="+52 ..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      data-event="application_submit"
                      className="group mt-10 inline-flex w-full items-center justify-between gap-3 bg-[#f5f1ea] px-7 py-4 font-[family-name:var(--font-albert)] text-[14px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white"
                    >
                      Enviar aplicación
                      <ArrowRightIcon
                        size={18}
                        weight="light"
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </button>

                    <p className="mt-4 font-[family-name:var(--font-albert)] text-[11px] font-light leading-[1.6] text-white/35">
                      Te contactamos por WhatsApp con tu información ya cargada. Sin spam.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Back */}
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="mt-8 inline-flex items-center gap-2 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.22em] text-white/45 transition-colors duration-300 hover:text-white/85"
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
