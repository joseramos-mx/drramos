"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { crearRespuestaPropiaAction, editarRespuestaPropiaAction, guardarRespuestaAction, restaurarRespuestaAction } from "../actions";
import { aCorchetes } from "@/lib/asistente/respuestas";

// Cómo se ven en el globo los datos que llena el sistema
const EJEMPLO = { dia: "lunes 26 de octubre", hora: "10:00", horarios: "10:00, 12:30 o 17:00", nombre: ", María" };

function Globo({ texto }) {
  const partes = String(texto).split(/(\{(?:dia|hora|horarios|nombre)\})/g);
  return (
    <p className="whitespace-pre-wrap rounded-[20px] rounded-br-md bg-[#efe3cc] px-4 py-3 text-[17px] leading-snug text-[#1c1a17]">
      {partes.map((p, i) => {
        const m = p.match(/^\{(dia|hora|horarios|nombre)\}$/);
        return m ? (
          <span key={i} title="Lo pone el sistema" className="rounded-md bg-white px-1.5 font-semibold text-[#8a6d3f]">
            {EJEMPLO[m[1]]}
          </span>
        ) : (
          <span key={i}>{p}</span>
        );
      })}
    </p>
  );
}

function Tarjeta({ item, demo }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(item.texto);
  const [editada, setEditada] = useState(item.editada);
  const [borrador, setBorrador] = useState("");
  const [msg, setMsg] = useState(null); // { tipo: "error" | "aviso" | "ok", texto }
  const [pendiente, start] = useTransition();
  const tieneDatos = /\{(dia|hora|horarios|nombre)\}/.test(item.original);

  function abrir() {
    setBorrador(aCorchetes(texto));
    setMsg(null);
    setEditando(true);
  }

  function guardar() {
    start(async () => {
      if (demo) {
        setTexto(borrador);
        setEditada(true);
        setEditando(false);
        return setMsg({ tipo: "ok", texto: "Guardado (demo)" });
      }
      const res = await guardarRespuestaAction(item.id, borrador);
      if (res?.error) return setMsg({ tipo: "error", texto: res.error });
      const nuevo = borrador
        .replace(/\[\s*d[ií]a\s*\]/gi, "{dia}")
        .replace(/\[\s*horarios\s*\]/gi, "{horarios}")
        .replace(/\[\s*hora\s*\]/gi, "{hora}")
        .replace(/\[\s*nombre\s*\]/gi, "{nombre}")
        .trim();
      setTexto(nuevo);
      setEditada(nuevo !== item.original);
      setEditando(false);
      setMsg(res.aviso ? { tipo: "aviso", texto: res.aviso } : { tipo: "ok", texto: "Guardado ✓ El asistente ya lo usa así." });
    });
  }

  function restaurar() {
    start(async () => {
      if (!demo) {
        const res = await restaurarRespuestaAction(item.id);
        if (res?.error) return setMsg({ tipo: "error", texto: res.error });
      }
      setTexto(item.original);
      setEditada(false);
      setEditando(false);
      setMsg({ tipo: "ok", texto: "Volvió al texto original ✓" });
    });
  }

  const colorMsg = { error: "text-[#c0392b]", aviso: "text-[#9a5b16]", ok: "text-[#2f7a4b]" };
  return (
    <li className="flex flex-col gap-3 border-b border-[#1c1a17]/[0.07] px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[18px] font-bold text-[#1c1a17]">{item.titulo}</p>
        {editada && <span className="shrink-0 rounded-full bg-[#efe3cc] px-2.5 py-0.5 text-[13px] font-semibold text-[#5e4a26]">Editada por ti</span>}
      </div>

      {!editando ? (
        <>
          <Globo texto={texto} />
          <button
            type="button"
            onClick={abrir}
            className="flex h-12 w-fit items-center gap-2 rounded-full border-2 border-[#1c1a17]/10 bg-white px-5 text-[16px] font-semibold text-[#1c1a17]"
          >
            <PencilSimpleIcon size={20} weight="bold" /> Editar
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-2.5">
          <label htmlFor={`r-${item.id}`} className="text-[15px] font-semibold text-[#5b544a]">
            Así lo diría yo:
          </label>
          <textarea
            id={`r-${item.id}`}
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            rows={Math.min(8, Math.max(3, Math.ceil(borrador.length / 32)))}
            autoCapitalize="sentences"
            className="w-full resize-y rounded-[20px] border-0 bg-[#f2efe9] px-4 py-3 text-[18px] leading-snug text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]"
          />
          {tieneDatos && (
            <p className="text-[15px] leading-snug text-[#7a7368]">
              Lo que está entre [CORCHETES] lo pone el sistema solo (el día, la hora…). Déjalo tal cual.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={guardar}
              disabled={pendiente}
              className="h-12 flex-1 rounded-full bg-[#1c1a17] px-5 text-[17px] font-semibold text-white disabled:opacity-50"
            >
              {pendiente ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setMsg(null);
              }}
              className="h-12 flex-1 rounded-full bg-[#f2efe9] px-5 text-[17px] font-semibold text-[#1c1a17]"
            >
              Cancelar
            </button>
          </div>
          {editada && (
            <button type="button" onClick={restaurar} disabled={pendiente} className="w-fit text-[15px] font-semibold text-[#8a6d3f] underline underline-offset-4">
              Volver al texto original
            </button>
          )}
        </div>
      )}
      {msg && (
        <p role={msg.tipo === "error" ? "alert" : "status"} className={`text-[15px] font-medium ${colorMsg[msg.tipo]}`}>
          {msg.texto}
        </p>
      )}
    </li>
  );
}

const CAJA =
  "w-full resize-y rounded-[20px] border-0 bg-[#f2efe9] px-4 py-3 text-[18px] leading-snug text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]";

/** Formulario de una respuesta que agrega ella: cuándo usarla + el texto. */
function FormaPropia({ inicial, onGuardar, onCancelar, pendiente }) {
  const [cuando, setCuando] = useState(inicial?.cuando || "");
  const [texto, setTexto] = useState(inicial?.texto || "");
  const id = inicial?.id || "nueva";
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={`c-${id}`} className="text-[15px] font-semibold text-[#5b544a]">
        ¿Cuándo debe usarla el asistente?
      </label>
      <input
        id={`c-${id}`}
        value={cuando}
        onChange={(e) => setCuando(e.target.value)}
        placeholder="Por ejemplo: cuando preguntan si atienden en domingo"
        autoCapitalize="sentences"
        className={CAJA}
      />
      <label htmlFor={`t-${id}`} className="text-[15px] font-semibold text-[#5b544a]">
        Lo que le contesta al paciente:
      </label>
      <textarea id={`t-${id}`} value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} autoCapitalize="sentences" className={CAJA} />
      <p className="text-[15px] leading-snug text-[#7a7368]">Sin precios (sólo los $500 de la valoración), sin promesas de resultados y sin decir &quot;especialista&quot;.</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onGuardar(cuando, texto)}
          disabled={pendiente}
          className="h-12 flex-1 rounded-full bg-[#1c1a17] px-5 text-[17px] font-semibold text-white disabled:opacity-50"
        >
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={onCancelar} className="h-12 flex-1 rounded-full bg-[#f2efe9] px-5 text-[17px] font-semibold text-[#1c1a17]">
          Cancelar
        </button>
      </div>
    </div>
  );
}

const COLOR_MSG = { error: "text-[#c0392b]", aviso: "text-[#9a5b16]", ok: "text-[#2f7a4b]" };

/** Una respuesta que agregó ella: se puede cambiar o borrar. */
function TarjetaPropia({ item, demo, onBorrada }) {
  const [actual, setActual] = useState(item);
  const [editando, setEditando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pendiente, start] = useTransition();

  const guardar = (cuando, texto) =>
    start(async () => {
      const res = demo ? { ok: true } : await editarRespuestaPropiaAction(item.id, cuando, texto);
      if (res?.error) return setMsg({ tipo: "error", texto: res.error });
      setActual({ ...actual, cuando: cuando.trim(), texto: texto.trim() });
      setEditando(false);
      setMsg({ tipo: "ok", texto: "Guardado ✓ El asistente ya la usa así." });
    });

  const borrar = () =>
    start(async () => {
      const res = demo ? { ok: true } : await restaurarRespuestaAction(item.id);
      if (res?.error) return setMsg({ tipo: "error", texto: res.error });
      onBorrada(item.id);
    });

  return (
    <li className="flex flex-col gap-3 border-b border-[#1c1a17]/[0.07] px-5 py-4">
      {!editando ? (
        <>
          <p className="text-[18px] font-bold text-[#1c1a17]">Úsala {actual.cuando}</p>
          <Globo texto={actual.texto} />
          {confirmar ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[16px] font-semibold text-[#1c1a17]">¿Borrar esta respuesta?</span>
              <button type="button" onClick={borrar} disabled={pendiente} className="h-12 rounded-full bg-[#c0392b] px-5 text-[16px] font-semibold text-white disabled:opacity-50">
                Sí, borrar
              </button>
              <button type="button" onClick={() => setConfirmar(false)} className="h-12 rounded-full bg-[#f2efe9] px-5 text-[16px] font-semibold text-[#1c1a17]">
                No
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMsg(null);
                  setEditando(true);
                }}
                className="flex h-12 w-fit items-center gap-2 rounded-full border-2 border-[#1c1a17]/10 bg-white px-5 text-[16px] font-semibold text-[#1c1a17]"
              >
                <PencilSimpleIcon size={20} weight="bold" /> Editar
              </button>
              <button
                type="button"
                onClick={() => setConfirmar(true)}
                className="flex h-12 w-fit items-center gap-2 rounded-full border-2 border-[#1c1a17]/10 bg-white px-5 text-[16px] font-semibold text-[#c0392b]"
              >
                <TrashIcon size={20} weight="bold" /> Borrar
              </button>
            </div>
          )}
        </>
      ) : (
        <FormaPropia inicial={actual} onGuardar={guardar} onCancelar={() => setEditando(false)} pendiente={pendiente} />
      )}
      {msg && (
        <p role={msg.tipo === "error" ? "alert" : "status"} className={`text-[15px] font-medium ${COLOR_MSG[msg.tipo]}`}>
          {msg.texto}
        </p>
      )}
    </li>
  );
}

/** Sección "Respuestas que agregaste" con el botón para agregar una nueva. */
function Propias({ iniciales, demo }) {
  const [lista, setLista] = useState(iniciales);
  const [agregando, setAgregando] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pendiente, start] = useTransition();

  const crear = (cuando, texto) =>
    start(async () => {
      const res = demo ? { ok: true, id: `propia_demo${Date.now().toString(36)}` } : await crearRespuestaPropiaAction(cuando, texto);
      if (res?.error) return setMsg({ tipo: "error", texto: res.error });
      setLista((l) => [...l, { id: res.id, cuando: cuando.trim(), texto: texto.trim() }]);
      setAgregando(false);
      setMsg({ tipo: "ok", texto: "Guardada ✓ El asistente ya la puede usar." });
    });

  return (
    <section>
      <h2 className="px-5 pb-1 pt-5 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]">Respuestas que agregaste</h2>
      {lista.length === 0 && !agregando && (
        <p className="px-5 pb-2 text-[16px] leading-snug text-[#5b544a]">
          ¿Los pacientes preguntan algo que no está aquí? Agrega la respuesta y el asistente la usará cuando venga al caso.
        </p>
      )}
      <ul>
        {lista.map((it) => (
          <TarjetaPropia key={it.id} item={it} demo={demo} onBorrada={(id) => setLista((l) => l.filter((x) => x.id !== id))} />
        ))}
      </ul>
      <div className="flex flex-col gap-3 px-5 py-4">
        {agregando ? (
          <FormaPropia
            onGuardar={crear}
            onCancelar={() => {
              setAgregando(false);
              setMsg(null);
            }}
            pendiente={pendiente}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setMsg(null);
              setAgregando(true);
            }}
            className="flex h-12 w-fit items-center gap-2 rounded-full bg-[#1c1a17] px-5 text-[17px] font-semibold text-white"
          >
            <PlusIcon size={20} weight="bold" /> Agregar respuesta
          </button>
        )}
        {msg && (
          <p role={msg.tipo === "error" ? "alert" : "status"} className={`text-[15px] font-medium ${COLOR_MSG[msg.tipo]}`}>
            {msg.texto}
          </p>
        )}
      </div>
    </section>
  );
}

/** "Mis respuestas": la Dra. Gaby ve y edita cómo contesta el asistente, y agrega las suyas. */
export default function EditorRespuestas({ secciones, propias = [], volver = "/crm/mensajes/ajustes", demo = false }) {
  const editadas = secciones.flatMap((s) => s.items).filter((i) => i.editada).length;
  return (
    <>
      <header className="flex items-center gap-2 px-2 pb-1 pt-4">
        <Link href={volver} aria-label="Regresar a Ajustes" className="flex h-12 w-12 items-center justify-center rounded-full active:bg-[#f2efe9]">
          <ArrowLeftIcon size={26} weight="bold" />
        </Link>
        <h1 className="text-[26px] font-bold tracking-tight text-[#1c1a17]">Mis respuestas</h1>
      </header>
      <p className="px-5 pb-2 text-[16px] leading-snug text-[#5b544a]">
        Así contesta el asistente a los pacientes. Toca <b>Editar</b> para decirlo a tu manera; el asistente lo usa así desde el
        siguiente mensaje.{editadas > 0 && ` Llevas ${editadas} editada${editadas === 1 ? "" : "s"}.`}
      </p>
      <Propias iniciales={propias} demo={demo} />
      {secciones.map((s) => (
        <section key={s.seccion}>
          <h2 className="px-5 pb-1 pt-5 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]">{s.seccion}</h2>
          <ul>
            {s.items.map((it) => (
              <Tarjeta key={it.id} item={it} demo={demo} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
