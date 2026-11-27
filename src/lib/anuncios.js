/**
 * Anuncios de Meta de la campaña 2026-11 (A1-A4) → qué se le contesta al
 * paciente que llegó de cada uno. El id llega en el `referral` del primer
 * mensaje (pacientes.anuncio_id, lo guarda /api/whatsapp).
 *   respuesta → respuesta aprobada (editable en "Mis respuestas") que va en el
 *               primer mensaje cuando sólo pide información
 *   imagen    → foto de public/whatsapp/ que va arriba (primer mensaje y la
 *               plantilla seguimiento_anuncio del día 3)
 * Anuncio nuevo: agregar su id aquí con su respuesta e imagen.
 */
import { imagenWhatsapp } from "@/lib/consultorio";

export const ANUNCIOS = {
  "120252378909490062": { clave: "A1", respuesta: "anuncio_a1", imagen: "A1-valoracion.jpg" },
  "120252378910830062": { clave: "A2", respuesta: "anuncio_a2", imagen: "A2-escaner.jpg" },
  "120252378911410062": { clave: "A3", respuesta: "anuncio_a3", imagen: "A3-paso-a-paso.jpg" },
  "120252378912690062": { clave: "A4", respuesta: "anuncio_a4", imagen: "A4-doctor.jpg" },
  // v2 de A1 y A3 (2026-11-27): mismos carruseles, con el link al número nuevo 618 568 0916
  "120252459543580062": { clave: "A1", respuesta: "anuncio_a1", imagen: "A1-valoracion.jpg" },
  "120252459543680062": { clave: "A3", respuesta: "anuncio_a3", imagen: "A3-paso-a-paso.jpg" },
};

/** { clave, respuesta, imagen (link público) } del anuncio, o null si no es uno de la campaña. */
export function anuncioDe(anuncioId) {
  const a = ANUNCIOS[String(anuncioId || "")];
  return a ? { ...a, imagen: imagenWhatsapp(a.imagen) } : null;
}
