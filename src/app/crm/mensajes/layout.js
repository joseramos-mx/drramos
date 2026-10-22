/**
 * "Mensajes" es la app de la Dra. Gaby en su celular: tema CLARO, letra
 * grande y botones redondos para usarla sin lentes y con una mano. Usa
 * los colores de la marca (crema #f5f1ea y dorado #b89968) en versión
 * clara; el resto del CRM conserva el diseño oscuro de /diseno-sonrisa.
 */
export const viewport = { themeColor: "#f5f1ea" };

export default function MensajesLayout({ children }) {
  return <div className="min-h-[100dvh] bg-[#f5f1ea] text-[#1c1a17]">{children}</div>;
}
