/** Bucket privado (mismo que BUCKET en src/lib/mensajes-servidor.js). */
export const BUCKET_MEDIA = "whatsapp-media";

/** Videos y documentos que acepta WhatsApp (los límites de Meta, con margen). */
export const ARCHIVOS = {
  video: { tipos: ["video/mp4", "video/3gpp"], max: 16 * 1024 * 1024 },
  document: {
    tipos: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    max: 25 * 1024 * 1024,
  },
};

/** "2.4 MB" para mostrar el tamaño del archivo. */
export function pesoLegible(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
