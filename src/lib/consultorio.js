/**
 * Número de WhatsApp al que la web y los links por fuente mandan a los pacientes.
 * Mientras el número nuevo no esté conectado sigue el de siempre (618 206 6760).
 * El día del cambio basta con poner en Vercel NEXT_PUBLIC_WHATSAPP_CONSULTORIO=526185680916
 * y volver a publicar: todos los botones y links cambian a la vez.
 */
export const WHATSAPP_CONSULTORIO = process.env.NEXT_PUBLIC_WHATSAPP_CONSULTORIO || "526182066760";

export const waConsultorio = (texto) =>
  `https://wa.me/${WHATSAPP_CONSULTORIO}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;

/**
 * Dirección pública de la web (para las fotos que se mandan por WhatsApp: Meta las baja
 * de aquí, así que deben estar publicadas). SITIO_URL la cambia (sin "/" al final).
 */
export const SITIO_URL = (process.env.SITIO_URL || "https://www.drfelipedejesusramos.com").replace(/\/+$/, "");

/** "03-carillas.jpg" → link público de public/whatsapp/03-carillas.jpg (o null). */
export const imagenWhatsapp = (archivo) => (archivo ? `${SITIO_URL}/whatsapp/${archivo}` : null);
