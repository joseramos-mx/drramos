/**
 * Respuestas APROBADAS del asistente. El modelo sólo ELIGE cuál(es)
 * mandar; el texto sale tal cual está aquí (sólo se llenan {dia},
 * {hora}, {horarios} y {nombre} con datos reales de la agenda o del
 * paciente). Es el carril principal contra las "alucinaciones".
 *
 * Reglas al editar: nunca precios de tratamientos (sólo los $500 de la
 * valoración), nunca promesas de resultados, nunca "especialista".
 * Usar "usted". Mensajes cortos, como de WhatsApp.
 */
export const RESPUESTAS = {
  // ── Saludo y datos del consultorio ──
  saludo:
    "¿En qué le puedo ayudar?",
  ubicacion:
    "Estamos en Gómez Palacio 501 Pte., Zona Centro, dentro de Central Médica Santa Ana. Estacionamiento gratis 📍 https://g.page/r/Cetfn6-lbzR1EBM",
  horario: "Atendemos de lunes a viernes de 9:00 a 20:00 y sábados de 9:00 a 14:00. Los domingos está cerrado.",
  estacionamiento:
    "Sí, contamos con estacionamiento gratuito para pacientes en consulta. Está en la esquina de Gómez Palacio y Victoria.",
  pagos:
    "Aceptamos efectivo, tarjeta y transferencia. Tenemos *6 meses sin intereses* con tarjetas de crédito participantes.",
  factura:
    "Sí facturamos. Pídala al pagar y mande su Constancia de Situación Fiscal a contacto@drfelipedejesusramos.com",
  telefono: "Puede escribirnos aquí mismo o llamar al 618 568 0916.",
  sobre_doctor:
    "El Dr. Felipe es cirujano dentista de la UJED, con más de 30 años de experiencia y autor del libro \"El Arte de Hacer Dientes\".",
  mas_informacion:
    "El Dr. Felipe es cirujano dentista con más de 30 años de experiencia en estética dental e implantes. ¿Qué le gustaría mejorar de su sonrisa?",
  tecnologia:
    "Escaneamos sus dientes en 3D, sin pastas, y fabricamos su trabajo en nuestro laboratorio propio. ¿Le agendo una valoración?",

  // ── Precios (nunca de tratamientos) ──
  precio_tratamiento:
    "Cada tratamiento se cotiza a su medida. En su valoración sale con su presupuesto exacto. ¿Le agendo?",
  precio_valoracion:
    "La valoración cuesta *$500* y se le toma a cuenta si ese día deja el anticipo de su tratamiento. ¿Le agendo?",
  valoracion_que_es:
    "Dura 30 min: el doctor escanea sus dientes en 3D, sin pastas, y le da su presupuesto. ¿Le agendo?",
  que_llevar: "No necesita llevar nada especial. Si tiene radiografías o estudios recientes, puede traerlos.",
  duele:
    "El doctor trabaja con mucho cuidado y usa anestesia cuando hace falta. El escaneo 3D no lleva pastas.",
  cuanto_tarda:
    "Depende de su caso; el doctor le dice el tiempo en su valoración. ¿Le agendo?",

  // ── Tratamientos (información general; el doctor confirma en la valoración) ──
  info_carillas:
    "Con carillas, el Dr. Felipe rediseña la forma y el color de sus dientes. Escanea su boca en 3D, diseña cada carilla en computadora y la fabrica en su laboratorio propio, ajustándola a mano para que se vea natural. ¿Le agendo su valoración?",
  info_blanqueamiento:
    "El blanqueamiento aclara el tono natural de sus dientes con gel profesional. Antes, el Dr. Felipe revisa que sus dientes y encías estén sanos para hacerlo de forma segura. ¿Le agendo su valoración?",
  info_diseno_sonrisa:
    "Su nueva sonrisa se planea primero en computadora: el Dr. Felipe escanea sus dientes en 3D y diseña con usted la forma, el tamaño y el color que mejor le van. Después la fabrica en su propio laboratorio. ¿Le agendo su valoración?",
  info_implantes:
    "Un implante le devuelve el diente que le falta, fijo y natural. El Dr. Felipe lo planea en 3D: raíz de titanio, pilar y una corona que él mismo diseña y fabrica en su laboratorio, a la medida de su boca. ¿Le agendo su valoración para ver si es candidato?",
  info_coronas:
    "Una corona protege y devuelve la forma a un diente muy dañado. El Dr. Felipe escanea su diente en 3D, sin pastas, y fabrica la corona en su propio laboratorio, con gran precisión. ¿Le agendo su valoración?",
  info_puentes: "Un puente son dientes fijos que reemplazan uno o varios dientes faltantes apoyándose en los dientes vecinos.",
  info_protesis:
    "Hay prótesis que se quitan y se ponen, y prótesis fijas sobre implantes, que se quedan firmes en su lugar. El Dr. Felipe las diseña en 3D y las fabrica en su laboratorio. En la valoración le dice cuál le conviene. ¿Le agendo?",
  info_rehabilitacion:
    "Cuando faltan o están dañados varios dientes, el Dr. Felipe planea su boca completa, pieza por pieza, por etapas y a su medida, y fabrica cada trabajo en su laboratorio propio. ¿Le agendo su valoración?",
  info_resinas: "Las resinas arreglan caries pequeñas o dientes despostillados con material del color del diente.",
  info_limpieza:
    "Limpieza profesional con ultrasonido y revisión completa con el Dr. Felipe. Se recomienda cada 6 meses para cuidar sus dientes y encías. ¿Le agendo?",
  info_endodoncia:
    "El tratamiento de conductos (endodoncia) depende de cada caso: en la valoración el doctor revisa su diente y le indica cómo se puede atender.",
  otros_tratamientos:
    "Cada caso es distinto: el Dr. Felipe escanea su boca en 3D, sin pastas, y le explica qué se puede hacer. ¿Le agendo su valoración?",
  urgencias_si: "Sí atendemos urgencias.",

  // ── Lo que no se hace ──
  no_ortodoncia:
    "La ortodoncia (brackets o alineadores) por el momento no la realizamos en el consultorio, una disculpa 🙏",
  no_cirugia_maxilofacial:
    "La cirugía maxilofacial la realiza un cirujano maxilofacial; por el momento no la realizamos en el consultorio, una disculpa 🙏",
  no_ninos:
    "Por el momento no atendemos a niños, una disculpa 🙏 Atendemos a partir de los 18 años.",

  // ── Agendar ──
  invitar_valoracion: "¿Le acomoda más entre semana o el sábado en la mañana?",
  ofrecer_horarios: "Para el {dia} tenemos libre a las {horarios}. ¿Cuál le acomoda?",
  sin_horarios: "Para el {dia} ya no tenemos espacio. ¿Le acomoda otro día?",
  pedir_datos: "Perfecto. Para apartar su lugar, ¿me comparte su nombre completo y qué le gustaría mejorar de su sonrisa?",
  preguntar_origen: "Una última pregunta: ¿cómo se enteró del consultorio?",
  confirmar_cita:
    "¡Listo{nombre}! Su valoración quedó el {dia} a las {hora} con el Dr. Felipe 📍 Gómez Palacio 501 Pte., dentro de Central Médica Santa Ana. Aviso de privacidad: drfelipedejesusramos.com/privacidad",

  // ── Cierre y casos especiales ──
  gracias: "¡Con gusto! Aquí estamos para lo que necesite 😊",
  voy_tarde: "¡Gracias por avisarnos! 🙏 Aquí le esperamos.",
  ya_llegue: "¡Gracias! En un momento le atendemos 😊",
  no_escribir_mas: "Entendido, una disculpa 🙏",
  escribir_audio: "Disculpe, no puedo escuchar notas de voz. ¿Me lo podría escribir? 🙏",
  solo_consultorio: "Sólo puedo ayudarle con temas del consultorio dental 😊 ¿Le gustaría agendar una valoración?",
  pasar_dra_gaby: "Con gusto, le comunico con la asistente del Dr. Felipe para que le atienda personalmente. En un momento le escribe 😊",
  pasar_urgencia:
    "Le comunico de inmediato con la asistente del Dr. Felipe para atenderle 🙏 Si es muy urgente, puede llamar al 618 568 0916.",
  pasar_dra_gaby_cerrado:
    "Ya le dejé su mensaje a la asistente del Dr. Felipe 🙏 En este momento el consultorio está cerrado; ella le escribe {dia} a partir de las 9:00.",
  // ── Primer mensaje según el anuncio de Meta que tocó (lo agrega el sistema, ver src/lib/anuncios.js) ──
  anuncio_a1:
    "En su valoración, el Dr. Felipe revisa su caso, le explica sus opciones y le arma un presupuesto a su medida. ¿Le agendo?",
  anuncio_a2:
    "Así trabaja el Dr. Felipe: un escáner en lugar de pastas, su diseño en la computadora y su propio laboratorio. ¿Le agendo su valoración?",
  anuncio_a3:
    "Del escaneo a su sonrisa, todo en un mismo lugar: el Dr. Felipe escanea, diseña, fabrica y personaliza su trabajo. ¿Le agendo su valoración?",
  anuncio_a4:
    "El Dr. Felipe es autor del libro «El Arte de Hacer Dientes», fundador de la licenciatura en Médico Cirujano Odontólogo de la UNES y tiene más de 30 años de experiencia en Durango. ¿Le agendo su valoración con él?",
  urgencia_cerrado:
    "Lamentamos su molestia 🙏 Ahorita estamos cerrados; abrimos {dia} a las 9:00. ¿Le aparto lugar a primera hora? Si tiene sangrado que no para, hinchazón que no le deja respirar o tragar, o fiebre alta, acuda a urgencias de un hospital.",
};

/** Primer renglón del primer mensaje a un paciente nuevo (lo agrega el código, el modelo no lo elige). */
export const PRESENTACION =
  "¡Hola! Soy el asistente virtual del Dr. Felipe Ramos 😊";

/** Respuestas que llevan datos y cuáles (el sistema los llena con la agenda). */
export const VARIABLES = {
  ofrecer_horarios: ["dia", "horarios"],
  sin_horarios: ["dia"],
  confirmar_cita: ["dia", "hora"],
  pasar_dra_gaby_cerrado: ["dia"],
  // ── Primer mensaje según el anuncio de Meta que tocó (lo agrega el sistema, ver src/lib/anuncios.js) ──
  anuncio_a1:
    "En su valoración, el Dr. Felipe revisa su caso, le explica sus opciones y le arma un presupuesto a su medida. ¿Le agendo?",
  anuncio_a2:
    "Así trabaja el Dr. Felipe: un escáner en lugar de pastas, su diseño en la computadora y su propio laboratorio. ¿Le agendo su valoración?",
  anuncio_a3:
    "Del escaneo a su sonrisa, todo en un mismo lugar: el Dr. Felipe escanea, diseña, fabrica y personaliza su trabajo. ¿Le agendo su valoración?",
  anuncio_a4:
    "El Dr. Felipe es autor del libro «El Arte de Hacer Dientes», fundador de la licenciatura en Médico Cirujano Odontólogo de la UNES y tiene más de 30 años de experiencia en Durango. ¿Le agendo su valoración con él?",
  urgencia_cerrado: ["dia"],
};

/** Cómo se ven los datos al editar: la Dra. Gaby ve [DÍA] en vez de {dia}. */
export const ETIQUETAS_DATO = { dia: "DÍA", hora: "HORA", horarios: "HORARIOS", nombre: "NOMBRE" };

/** Orden y títulos para la pantalla "Mis respuestas" (todas las editables, incluida la presentación). */
export const SECCIONES = [
  ["Saludo y datos del consultorio", [
    ["presentacion", "Primer mensaje a un paciente nuevo (siempre va arriba)"],
    ["saludo", "Saludo"], ["ubicacion", "¿Dónde están?"], ["horario", "¿Qué horario tienen?"],
    ["estacionamiento", "¿Hay estacionamiento?"], ["pagos", "¿Cómo se puede pagar? / meses sin intereses"],
    ["factura", "¿Facturan?"], ["telefono", "¿A qué número llamo?"],
    ["sobre_doctor", "¿Quién es el doctor?"], ["mas_informacion", "Cuando piden \"más información\" sin decir de qué"],
    ["tecnologia", "Escáner 3D y laboratorio propio"],
  ]],
  ["Precios y valoración", [
    ["precio_tratamiento", "¿Cuánto cuesta un tratamiento? (nunca se da precio)"],
    ["precio_valoracion", "¿Cuánto cuesta la valoración?"], ["valoracion_que_es", "¿Qué hacen en la valoración?"],
    ["que_llevar", "¿Qué llevo a la valoración?"], ["duele", "¿Duele?"], ["cuanto_tarda", "¿Cuánto tarda? / ¿En cuánto me lo entregan? (nunca se promete un plazo)"],
  ]],
  ["Tratamientos", [
    ["info_carillas", "Carillas"], ["info_blanqueamiento", "Blanqueamiento"], ["info_diseno_sonrisa", "Diseño de sonrisa"],
    ["info_implantes", "Implantes"], ["info_coronas", "Coronas"], ["info_puentes", "Puentes"],
    ["info_protesis", "Prótesis"], ["info_rehabilitacion", "Rehabilitación oral"], ["info_resinas", "Resinas"],
    ["info_limpieza", "Limpieza y revisión"], ["info_endodoncia", "Tratamiento de conductos (depende del caso)"],
    ["otros_tratamientos", "Extracciones, guardas, encías u otros: hay que valorar"], ["urgencias_si", "¿Atienden urgencias?"],
  ]],
  ["Lo que no hacemos", [
    ["no_ortodoncia", "Brackets / alineadores"], ["no_cirugia_maxilofacial", "Cirugía maxilofacial"], ["no_ninos", "Niños (atendemos desde 18 años)"],
  ]],
  ["Para agendar la valoración", [
    ["invitar_valoracion", "Invitar a agendar"], ["ofrecer_horarios", "Ofrecer horarios libres"],
    ["sin_horarios", "Ese día ya no hay lugar"], ["pedir_datos", "Pedir nombre y qué quiere mejorar"],
    ["preguntar_origen", "¿Cómo nos conoció?"], ["confirmar_cita", "Confirmar la cita"],
  ]],
  ["Despedidas y casos especiales", [
    ["gracias", "Cuando dicen gracias"], ["voy_tarde", "Cuando avisa que va tarde a su cita"], ["ya_llegue", "Cuando avisa que ya llegó"], ["no_escribir_mas", "Cuando piden que ya no les escriban"],
    ["escribir_audio", "Cuando mandan nota de voz"], ["solo_consultorio", "Cuando preguntan cosas que no son del consultorio"],
    ["pasar_dra_gaby", "Cuando le pasa el chat a la Dra. Gaby"], ["pasar_urgencia", "Cuando es urgencia"],
    ["pasar_dra_gaby_cerrado", "Le pasa el chat con el consultorio cerrado ([DÍA] = mañana, el lunes…)"],
    ["urgencia_cerrado", "Urgencia con el consultorio cerrado (de noche o domingo)"],
  ]],
  ["Primer mensaje según el anuncio (cuando sólo piden información)", [
    ["anuncio_a1", "Anuncio A1: valoración"], ["anuncio_a2", "Anuncio A2: video del escáner"],
    ["anuncio_a3", "Anuncio A3: paso a paso"], ["anuncio_a4", "Anuncio A4: el doctor"],
  ]],
];

/** Textos originales (los de este archivo), incluida la presentación. */
export const ORIGINALES = { presentacion: PRESENTACION, ...RESPUESTAS };

/**
 * Textos que usa el asistente: los que la Dra. Gaby editó en "Mis
 * respuestas" (tabla asistente_respuestas) encima de los originales.
 */
export function textosEfectivos(editadas = []) {
  const t = { ...ORIGINALES };
  const cuando = {};
  for (const e of editadas) {
    if (!String(e?.texto || "").trim()) continue;
    if (e.id in t) t[e.id] = e.texto;
    else if (esPropia(e.id) && e.cuando) {
      t[e.id] = e.texto;
      cuando[e.id] = e.cuando;
    }
  }
  // Las que agregó ella llevan su "cuándo usarla" (no enumerable: no se mezcla con los textos)
  Object.defineProperty(t, "cuando", { value: cuando, enumerable: false });
  return t;
}

/** Respuestas que agregó la Dra. Gaby en "Mis respuestas" (id "propia_…"). */
export const esPropia = (id) => /^propia_[a-z0-9]{6,20}$/.test(String(id || ""));

/** Ids que el modelo puede elegir: las fijas más las que agregó ella. */
export function elegiblesDe(textos = ORIGINALES) {
  return [...ELEGIBLES, ...Object.keys(textos.cuando || {})];
}

/** Quita el "¿Le agendo?" (o "¿Le agendo su valoración?") del final, para juntar varias respuestas con una sola pregunta. */
export const sinPregunta = (t) => String(t || "").replace(/\s*¿Le agendo[^¿?]*\?\s*$/, "");

/**
 * El costo de la valoración SIEMPRE va con las formas de pago (y los 6 MSI). Sin
 * pregunta: para ponerlo arriba de otra respuesta (prueba de precio).
 */
export const costoSinPregunta = (textos = ORIGINALES) =>
  [sinPregunta(textos.precio_valoracion), sinPregunta(textos.pagos)].filter(Boolean).join("\n\n");

/** Costo + formas de pago, con UNA sola pregunta al final (botón "Costo de la consulta"). */
export const textoCosto = (textos = ORIGINALES) => `${costoSinPregunta(textos)} ¿Le agendo?`;

/** Si eligió el costo de la valoración sin las formas de pago, se agregan justo después. */
function conPagos(ids) {
  const lista = [...(ids || [])];
  const i = lista.indexOf("precio_valoracion");
  if (i >= 0 && !lista.includes("pagos")) lista.splice(i + 1, 0, "pagos");
  return lista;
}

/** Texto final de varias respuestas aprobadas, con sus datos. Devuelve { texto } o { error }. */
export function armar(idsElegidos, variables = {}, textos = ORIGINALES) {
  const ids = conPagos(idsElegidos);
  const partes = [];
  for (const id of ids) {
    const base = id === "presentacion" ? null : textos[id];
    if (!base) return { error: `No existe la respuesta aprobada "${id}".` };
    const faltan = (VARIABLES[id] || []).filter((v) => !String(variables[v] || "").trim());
    if (faltan.length) return { error: `A "${id}" le falta: ${faltan.join(", ")}.` };
    partes.push(
      base
        .replaceAll("{nombre}", variables.nombre?.trim() ? `, ${variables.nombre.trim().split(" ")[0]}` : "")
        .replaceAll("{dia}", variables.dia || "")
        .replaceAll("{hora}", variables.hora || "")
        .replaceAll("{horarios}", variables.horarios || "")
    );
  }
  if (!partes.length) return { error: "No se eligió ninguna respuesta." };
  // Al juntar varias, el "¿Le agendo?" sólo va en la última (una sola pregunta por mensaje)
  const ultima = partes.length - 1;
  let texto = partes.map((p, i) => (i < ultima ? sinPregunta(p) : p)).join("\n\n");
  // Con el costo, el mensaje termina invitando a agendar (si lo último no pregunta nada)
  if (ids.includes("precio_valoracion") && !/\?\s*$/.test(texto)) texto = `${texto} ¿Le agendo?`;
  return { texto };
}

/** Lista para las instrucciones del modelo (id: texto), sin la presentación. */
/** Respuestas que manda SÓLO el sistema (al pasar el caso): el modelo no las puede elegir. */
export const SOLO_SISTEMA = new Set([
  "pasar_dra_gaby", "pasar_urgencia", "pasar_dra_gaby_cerrado", "urgencia_cerrado",
  "anuncio_a1", "anuncio_a2", "anuncio_a3", "anuncio_a4",
]);

/** Ids que el modelo sí puede elegir con enviar_respuestas_aprobadas. */
export const ELEGIBLES = Object.keys(RESPUESTAS).filter((id) => !SOLO_SISTEMA.has(id));

export function catalogo(textos = ORIGINALES) {
  const fijas = ELEGIBLES.map((id) => `- ${id}: ${textos[id]}`);
  const propias = Object.entries(textos.cuando || {}).map(([id, cuando]) => `- ${id} (úsala ${cuando}): ${textos[id]}`);
  return [...fijas, ...propias].join("\n");
}

/** [DÍA] → {dia} (y al revés) para la pantalla de edición. */
export function aCorchetes(texto) {
  return String(texto).replace(/\{(dia|hora|horarios|nombre)\}/g, (_, k) => `[${ETIQUETAS_DATO[k]}]`);
}
export function deCorchetes(texto) {
  return String(texto)
    .replace(/\[\s*d[ií]a\s*\]/gi, "{dia}")
    .replace(/\[\s*horarios\s*\]/gi, "{horarios}")
    .replace(/\[\s*hora\s*\]/gi, "{hora}")
    .replace(/\[\s*nombre\s*\]/gi, "{nombre}");
}

/** Lista de respuestas con el texto que usa hoy el asistente (editado o original). */
/** Las que agregó ella, para la pantalla de edición (las más nuevas al final). */
export function propiasParaEditar(editadas) {
  return (editadas || [])
    .filter((e) => esPropia(e.id) && e.cuando)
    .sort((a, b) => String(a.updated_at || "").localeCompare(String(b.updated_at || "")))
    .map((e) => ({ id: e.id, cuando: e.cuando, texto: e.texto }));
}

export function seccionesParaEditar(editadas) {
  const mapa = Object.fromEntries((editadas || []).map((e) => [e.id, e.texto]));
  return SECCIONES.map(([seccion, items]) => ({
    seccion,
    items: items.map(([id, titulo]) => ({
      id,
      titulo,
      original: ORIGINALES[id],
      texto: mapa[id] || ORIGINALES[id],
      editada: Boolean(mapa[id]),
    })),
  }));
}
