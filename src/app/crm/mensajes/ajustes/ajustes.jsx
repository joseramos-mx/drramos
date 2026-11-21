import Link from "next/link";
import { ChatTextIcon } from "@phosphor-icons/react/dist/ssr";
import { signOutAction } from "../../actions";
import { BarraInferior, BarraSuperior } from "../encabezado";
import Avisos from "../avisos";
import ModoAsistente from "./modo-asistente";
import Recordatorios from "./recordatorios";
import Contrasena from "./contrasena";

/** Pantalla de Ajustes (la usa la app y la demo). */
export default function Ajustes({ email, base = "/crm/mensajes", agendaHref, admin = false, modo = "apagado", libres = "aprobar", automaticos = {}, llave = null }) {
  const titulo = "px-5 pb-2 pt-6 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]";
  const fila = "flex h-16 items-center justify-between px-5 text-[17px] text-[#1c1a17] active:bg-[#f5f1ea]";
  return (
    <main className="mx-auto w-full max-w-[720px] pb-28">
      <BarraSuperior titulo="Ajustes" />

      <h2 className={titulo}>Asistente virtual</h2>
      {llave && llave.estado !== "ok" && (
        // Sin llave (o con una que falla) el asistente no contesta: todo le llega a ella
        <p className="mx-5 mb-3 rounded-[16px] bg-[#fbe9e7] px-4 py-3 text-[16px] leading-snug text-[#8a2a1c]">
          <span className="block font-semibold">El asistente no está funcionando.</span>
          {llave.estado === "falta"
            ? "Falta la llave de Claude en Vercel. Mientras, todos los mensajes te llegan a ti."
            : `Su último intento falló (${new Date(llave.en).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" })}). Puede ser la llave de Claude o el saldo. Los mensajes te llegan a ti.`}
        </p>
      )}
      <ModoAsistente modo={modo} libres={libres} demo={base !== "/crm/mensajes"} />
      <Link href={`${base}/respuestas`} className="mx-5 mt-3 flex h-16 items-center justify-between rounded-[20px] border-2 border-[#1c1a17]/10 bg-white px-5 text-[18px] font-semibold text-[#1c1a17]">
        <span className="flex items-center gap-3">
          <ChatTextIcon size={24} className="text-[#8a6d3f]" /> Mis respuestas del asistente
        </span>
        <span className="text-[#9a9388]">›</span>
      </Link>

      <h2 className={titulo}>Mensajes automáticos</h2>
      <Recordatorios estado={automaticos} demo={base !== "/crm/mensajes"} />

      <h2 className={titulo}>Avisos</h2>
      <div className="px-5">
        <Avisos />
      </div>

      {admin && (
        <>
          <h2 className={titulo}>Otras secciones</h2>
          <ul className="border-y border-[#1c1a17]/[0.08]">
            <li className="border-b border-[#1c1a17]/[0.06]">
              <Link href="/crm/resultados" className={fila}>
                Resultados <span className="text-[#9a9388]">›</span>
              </Link>
            </li>
            <li className="border-b border-[#1c1a17]/[0.06]">
              <Link href="/agenda/pantalla" className={fila}>
                Agenda en el monitor <span className="text-[#9a9388]">›</span>
              </Link>
            </li>
            <li className="border-b border-[#1c1a17]/[0.06]">
              <Link href={`${base}/pruebas`} className={fila}>
                Probar asistente <span className="text-[#9a9388]">›</span>
              </Link>
            </li>
            <li>
              <Link href="/crm" className={fila}>
                Leads del formulario <span className="text-[#9a9388]">›</span>
              </Link>
            </li>
          </ul>

        </>
      )}

      <h2 className={titulo}>Cuenta</h2>
      <div className="border-y border-[#1c1a17]/[0.08]">
        {email && <p className="px-5 pt-4 text-[15px] text-[#7a7368]">{email}</p>}
        <Contrasena demo={base !== "/crm/mensajes"} />
        <form action={base === "/crm/mensajes" ? signOutAction : undefined}>
          <button type="submit" className={`${fila} w-full font-semibold text-[#c0392b]`}>
            Cerrar sesión
          </button>
        </form>
      </div>

      <BarraInferior activo="ajustes" base={base} agendaHref={agendaHref} />
    </main>
  );
}
