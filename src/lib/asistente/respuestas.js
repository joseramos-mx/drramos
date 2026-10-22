/**
 * Respuestas APROBADAS del asistente. El modelo sólo ELIGE cuál(es)
 * mandar; el texto sale tal cual está aquí (sólo se llenan {dia},
 * {hora}, {horarios} y {nombre} con datos reales de la agenda o del
 * paciente). Es el carril principal contra las "alucinaciones".
 *
 * Reglas al editar: nunca precios de tratamientos (sólo los $600 de la
 * valoración), nunca promesas de resultados, nunca "especialista".
 * Usar "usted". Mensajes cortos, como de WhatsApp.
 */
export const RESPUESTAS = {
  // ── Saludo y datos del consultorio ──
  saludo: "¿En qué le puedo ayudar? Con gusto le resuelvo sus dudas o le agendo una valoración con el Dr. Felipe 😊",
  ubicacion:
    "Estamos en Prol. Gómez Palacio 501 Pte., Zona Centro, Durango, dentro de Central Médica Santa Ana 📍 Hay estacionamiento gratuito.",
  horario: "Atendemos de lunes a viernes de 9:00 a 19:00 y sábados de 9:00 a 14:00. Los domingos está cerrado.",
  estacionamiento: "Sí, hay estacionamiento gratuito en Central Médica Santa Ana.",
  pagos:
    "Aceptamos efectivo, tarjeta y transferencia. Con Visa y American Express hay 6, 9 y 12 meses sin intereses.",
  factura: "Sí, facturamos. Al momento de pagar le pedimos sus datos fiscales.",
  telefono: "Puede escribirnos aquí mismo o llamar al 618 568 0916.",
  sobre_doctor:
    "El Dr. Felipe de Jesús Ramos Sotelo es cirujano dentista egresado de la UJED, con más de 30 años de experiencia. Es autor del libro \"El Arte de Hacer Dientes\" y fundador del Instituto Autónomo del Norte (IAN), escuela de posgrados en odontología.",
  tecnologia:
    "El doctor trabaja con escaneo 3D de la boca (sin pastas ni moldes) y tiene laboratorio propio con fresadora e impresión 3D, así que los tratamientos requieren menos citas.",

  // ── Precios (nunca de tratamientos) ──
  precio_tratamiento:
    "El Dr. Felipe no maneja precios fijos porque cada tratamiento se diseña a su medida: revisa cuántas piezas hay que trabajar, el procedimiento y le ofrece varias opciones de material. En la valoración (30 min) le escanea en 3D y sale con su presupuesto exacto. No tiene costo si hace su tratamiento con nosotros.",
  precio_valoracion:
    "La valoración no tiene costo si decide hacer su tratamiento con el doctor. Si sólo quiere la valoración, son $600.",
  valoracion_que_es:
    "La valoración dura unos 30 minutos: el doctor revisa su boca, la escanea en 3D sin pastas, platica con usted qué le gustaría mejorar y le da su presupuesto exacto con opciones.",
  que_llevar: "No necesita llevar nada especial. Si tiene radiografías o estudios recientes, puede traerlos.",
  duele:
    "El doctor trabaja con mucho cuidado y usa anestesia cuando hace falta; el escaneo 3D no lleva pastas. En la valoración le explica cada paso.",
  cuanto_tarda:
    "Depende de cada caso. Con el laboratorio propio los tiempos suelen ser más cortos, y en la valoración el doctor le da su plan con tiempos.",

  // ── Tratamientos (información general; el doctor confirma en la valoración) ──
  info_carillas:
    "Las carillas son láminas muy delgadas que se colocan sobre el frente de los dientes para mejorar su forma, color o tamaño. Pueden ser de resina o de cerámica, y el doctor le explica qué opción conviene en su caso durante la valoración.",
  info_blanqueamiento:
    "El blanqueamiento aclara el color natural de los dientes con un gel profesional. No cambia el color de resinas, coronas o carillas que ya tenga, y puede dar sensibilidad pasajera. Primero se revisa que encías y dientes estén sanos.",
  info_diseno_sonrisa:
    "El diseño de sonrisa es un plan completo para mejorar cómo se ve su sonrisa (forma, color y proporción). El doctor lo diseña en computadora como parte del tratamiento y puede combinar carillas, coronas o blanqueamiento, según el caso.",
  info_implantes:
    "Un implante reemplaza un diente que falta: se coloca un tornillo de titanio en el hueso, que funciona como raíz, y encima va una corona. El hueso necesita algunos meses para integrarse. En la valoración el doctor revisa si es candidato.",
  info_coronas:
    "Las coronas son como \"fundas\" que cubren todo el diente cuando está muy dañado o desgastado. Con el escaneo 3D y el laboratorio propio, muchas se hacen en menos citas.",
  info_puentes: "Un puente son dientes fijos que reemplazan uno o varios dientes faltantes apoyándose en los dientes vecinos.",
  info_protesis:
    "Hay prótesis removibles (se quitan y se ponen) y fijas (no se quitan, como puentes o prótesis sobre implantes). En la valoración el doctor le explica cuál conviene en su caso.",
  info_rehabilitacion:
    "La rehabilitación oral es un tratamiento integral cuando faltan varios dientes, están muy desgastados o la mordida no funciona bien. Se planea por etapas, a la medida de cada persona.",
  info_resinas: "Las resinas arreglan caries pequeñas o dientes despostillados con material del color del diente.",
  info_limpieza: "Hacemos limpieza profesional y revisión general. Se recomienda por lo menos una vez al año.",
  urgencias_si: "Sí atendemos urgencias.",

  // ── Lo que no se hace ──
  no_ortodoncia: "La ortodoncia (brackets o alineadores) no la realizamos en el consultorio, una disculpa 🙏",
  no_endodoncia: "El tratamiento de conductos (endodoncia) no lo realizamos en el consultorio, una disculpa 🙏",
  no_ninos: "En el consultorio no atendemos a niños, una disculpa 🙏",

  // ── Agendar ──
  invitar_valoracion: "¿Le gustaría agendar una valoración? ¿Le acomoda más entre semana o el sábado en la mañana?",
  ofrecer_horarios: "Para el {dia} tenemos libre a las {horarios}. ¿Cuál le acomoda?",
  sin_horarios: "Para el {dia} ya no tenemos espacio. ¿Le acomoda otro día?",
  pedir_datos: "Perfecto. Para apartar su lugar, ¿me comparte su nombre completo y qué le gustaría mejorar de su sonrisa?",
  preguntar_origen: "Una última pregunta: ¿cómo se enteró del consultorio? (Facebook, Instagram, Google, recomendación…)",
  confirmar_cita:
    "¡Listo{nombre}! Su valoración quedó el {dia} a las {hora} con el Dr. Felipe, en Prol. Gómez Palacio 501 Pte., dentro de Central Médica Santa Ana 📍 Le esperamos 😊 Sus datos se usan sólo para atenderle: drfelipedejesusramos.com/privacidad",

  // ── Cierre y casos especiales ──
  gracias: "¡Con gusto! Aquí estamos para lo que necesite 😊",
  no_escribir_mas: "Entendido, una disculpa 🙏",
  escribir_audio: "Disculpe, no puedo escuchar notas de voz. ¿Me lo podría escribir? 🙏",
  solo_consultorio: "Sólo puedo ayudarle con temas del consultorio dental 😊 ¿Le gustaría agendar una valoración?",
  pasar_dra_gaby: "Con gusto, le comunico con la Dra. Gaby para que le atienda personalmente. En un momento le escribe 😊",
  pasar_urgencia:
    "Le comunico de inmediato con la Dra. Gaby para atenderle 🙏 Si es muy urgente, puede llamar al 618 568 0916.",
};

/** Respuestas que llevan datos y cuáles. */
const VARIABLES = { ofrecer_horarios: ["dia", "horarios"], sin_horarios: ["dia"], confirmar_cita: ["dia", "hora"] };

/** Texto final de varias respuestas aprobadas, con sus datos. Devuelve { texto } o { error }. */
export function armar(ids, variables = {}) {
  const partes = [];
  for (const id of ids || []) {
    const base = RESPUESTAS[id];
    if (!base) return { error: `No existe la respuesta aprobada "${id}".` };
    const faltan = (VARIABLES[id] || []).filter((v) => !String(variables[v] || "").trim());
    if (faltan.length) return { error: `A "${id}" le falta: ${faltan.join(", ")}.` };
    partes.push(
      base
        .replace("{nombre}", variables.nombre?.trim() ? `, ${variables.nombre.trim().split(" ")[0]}` : "")
        .replace("{dia}", variables.dia || "")
        .replace("{hora}", variables.hora || "")
        .replace("{horarios}", variables.horarios || "")
    );
  }
  if (!partes.length) return { error: "No se eligió ninguna respuesta." };
  return { texto: partes.join("\n\n") };
}

/** Lista para las instrucciones del modelo (id: texto). */
export function catalogo() {
  return Object.entries(RESPUESTAS)
    .map(([id, t]) => `- ${id}: ${t}`)
    .join("\n");
}
