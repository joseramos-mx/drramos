import Link from "next/link";
import { signOutAction } from "../../actions";
import { BarraInferior, BarraSuperior } from "../encabezado";
import Avisos from "../avisos";
import ModoAsistente from "./modo-asistente";

/** Pantalla de Ajustes (la usa la app y la demo). */
export default function Ajustes({ email, base = "/crm/mensajes", agendaHref, admin = false, modo = "apagado", libres = "aprobar" }) {
  const titulo = "px-5 pb-2 pt-6 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]";
  const fila = "flex h-16 items-center justify-between px-5 text-[17px] text-[#1c1a17] active:bg-[#f5f1ea]";
  return (
    <main className="mx-auto w-full max-w-[720px] pb-28">
      <BarraSuperior titulo="Ajustes" />

      <h2 className={titulo}>🤖 Asistente virtual</h2>
      <ModoAsistente modo={modo} libres={libres} demo={base !== "/crm/mensajes"} />
      <Link href={`${base}/respuestas`} className="mx-5 mt-3 flex h-16 items-center justify-between rounded-[20px] border-2 border-[#1c1a17]/10 bg-white px-5 text-[18px] font-semibold text-[#1c1a17]">
        ✏️ Mis respuestas del asistente <span className="text-[#9a9388]">›</span>
      </Link>

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
