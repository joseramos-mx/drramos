"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { CANALES } from "./fuentes";

/**
 * Alta de fuentes y gasto mensual de las fuentes de paga. Lo usa quien
 * administra el marketing (no la Dra. Gaby). RLS: sólo authenticated.
 */

const CANALES_OK = new Set(CANALES.map((c) => c.value).filter((v) => v !== "sin_dato"));

export async function crearFuenteAction(_prev, formData) {
  const codigo = String(formData.get("codigo") || "").trim().toUpperCase();
  const nombre = String(formData.get("nombre") || "").trim();
  const canal = String(formData.get("canal") || "");
  const mensaje = String(formData.get("mensaje") || "").trim();
  const dePago = formData.get("de_pago") === "si";

  if (!/^[A-Z0-9]{1,8}$/.test(codigo)) return { error: "El código: sólo letras y números, máximo 8 (ej. A2, RADIO1)." };
  if (!nombre) return { error: "Ponle nombre a la fuente." };
  if (!CANALES_OK.has(canal)) return { error: "Elige el canal." };
  if (!mensaje) return { error: "Escribe el mensaje que verá el paciente." };

  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from("fuentes")
    .insert({ codigo, nombre, canal, mensaje, de_pago: dePago });
  if (error) {
    return { error: error.code === "23505" ? "Ese código ya existe." : error.message };
  }
  revalidatePath("/crm/resultados");
  return { ok: true, savedAt: Date.now() };
}

export async function guardarGastoMesAction(_prev, formData) {
  const fuenteId = String(formData.get("fuente_id") || "");
  const mes = String(formData.get("mes") || "");
  const raw = String(formData.get("monto") || "").replace(/[^\d.]/g, "");
  const monto = raw ? Number(raw) : 0;

  if (!fuenteId || !/^\d{4}-\d{2}-01$/.test(mes)) return { error: "Datos inválidos." };
  if (!Number.isFinite(monto) || monto < 0) return { error: "Monto inválido." };

  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from("fuente_gastos")
    .upsert({ fuente_id: fuenteId, mes, monto }, { onConflict: "fuente_id,mes" });
  if (error) return { error: error.message };
  revalidatePath("/crm/resultados");
  return { ok: true, savedAt: Date.now() };
}
