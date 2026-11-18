"use client";

import { useState, useTransition } from "react";
import { EyeIcon, EyeSlashIcon, LockKeyIcon } from "@phosphor-icons/react";
import { cambiarContrasenaAction } from "../actions";

const caja =
  "h-14 w-full rounded-full bg-[#f2efe9] px-5 text-[18px] text-[#1c1a17] placeholder:text-[#9a9388] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]";

/** Ajustes → Cuenta: cambiar la contraseña sin pedírsela a nadie. */
export default function Contrasena({ demo = false }) {
  const [abierto, setAbierto] = useState(false);
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [ver, setVer] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pendiente, start] = useTransition();

  const guardar = () =>
    start(async () => {
      if (nueva !== repetir) return setMsg({ error: true, texto: "Las dos contraseñas no son iguales." });
      const res = demo ? { ok: true } : await cambiarContrasenaAction(nueva);
      if (res?.error) return setMsg({ error: true, texto: res.error });
      setNueva("");
      setRepetir("");
      setAbierto(false);
      setMsg({ error: false, texto: "Listo, tu contraseña cambió. Úsala la próxima vez que entres." });
    });

  if (!abierto)
    return (
      <div className="px-5 pb-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setMsg(null);
            setAbierto(true);
          }}
          className="flex h-14 w-full items-center gap-3 text-[17px] font-semibold text-[#1c1a17]"
        >
          <LockKeyIcon size={24} className="text-[#8a6d3f]" /> Cambiar contraseña
        </button>
        {msg && <p role="status" className="pb-2 text-[15px] font-medium text-[#2f7a4b]">{msg.texto}</p>}
      </div>
    );

  return (
    <div className="flex flex-col gap-2.5 px-5 py-3">
      <label htmlFor="nueva" className="text-[15px] font-semibold text-[#5b544a]">
        Contraseña nueva (mínimo 8 letras o números)
      </label>
      <div className="relative">
        <input id="nueva" type={ver ? "text" : "password"} value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" className={caja} />
        <button
          type="button"
          onClick={() => setVer(!ver)}
          aria-label={ver ? "Ocultar contraseña" : "Ver contraseña"}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[#5b544a]"
        >
          {ver ? <EyeSlashIcon size={22} /> : <EyeIcon size={22} />}
        </button>
      </div>
      <label htmlFor="repetir" className="text-[15px] font-semibold text-[#5b544a]">
        Escríbela otra vez
      </label>
      <input id="repetir" type={ver ? "text" : "password"} value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" className={caja} />
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={guardar} disabled={pendiente || !nueva} className="h-12 flex-1 rounded-full bg-[#1c1a17] text-[17px] font-semibold text-white disabled:opacity-50">
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAbierto(false);
            setMsg(null);
          }}
          className="h-12 flex-1 rounded-full bg-[#f2efe9] text-[17px] font-semibold text-[#1c1a17]"
        >
          Cancelar
        </button>
      </div>
      {msg?.error && <p role="alert" className="text-[15px] font-medium text-[#c0392b]">{msg.texto}</p>}
    </div>
  );
}
