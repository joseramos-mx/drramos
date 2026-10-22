/**
 * Número de WhatsApp al que la web y los links por fuente mandan a los pacientes.
 * Mientras el número nuevo no esté conectado sigue el de siempre (618 206 6760).
 * El día del cambio basta con poner en Vercel NEXT_PUBLIC_WHATSAPP_CONSULTORIO=526185680916
 * y volver a publicar: todos los botones y links cambian a la vez.
 */
export const WHATSAPP_CONSULTORIO = process.env.NEXT_PUBLIC_WHATSAPP_CONSULTORIO || "526182066760";

export const waConsultorio = (texto) =>
  `https://wa.me/${WHATSAPP_CONSULTORIO}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
