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
    "¡Hola! Bienvenido al consultorio del Dr. Felipe de Jesús Ramos 👋 ¿En qué le puedo ayudar? Con gusto le resuelvo sus dudas o le agendo su cita de valoración.",
  ubicacion:
    "Estamos en calle Gómez Palacio 501 Pte., entre Juárez y Victoria, Zona Centro, Durango, dentro de Central Médica Santa Ana 📍 Contamos con estacionamiento gratuito para pacientes en consulta, en la esquina de Gómez Palacio y Victoria.\nUbicación en el mapa: https://g.page/r/Cetfn6-lbzR1EBM",
  horario: "Atendemos de lunes a viernes de 9:00 a 20:00 y sábados de 9:00 a 14:00. Los domingos está cerrado.",
  estacionamiento:
    "Sí, contamos con estacionamiento gratuito para pacientes en consulta. Está en la esquina de Gómez Palacio y Victoria.",
  pagos:
    "Aceptamos efectivo, tarjeta y transferencia. Tenemos 6 meses sin intereses con tarjetas de crédito participantes.",
  factura:
    "Sí, facturamos. Al momento de su pago solicite su factura, por favor, y envíe su Constancia de Situación Fiscal (CSF) al correo contacto@drfelipedejesusramos.com.",
  telefono: "Puede escribirnos aquí mismo o llamar al 618 568 0916.",
  sobre_doctor:
    "El Dr. Felipe de Jesús Ramos Sotelo es cirujano dentista egresado de la UJED, con más de 30 años de experiencia. Es autor del libro \"El Arte de Hacer Dientes\", sobre estética dental.",
  mas_informacion:
    "El Dr. Felipe de Jesús Ramos Sotelo es cirujano dentista con más de 30 años de experiencia en odontología estética, diseño de sonrisa, prótesis dental y rehabilitación con implantes 🦷 Es fundador del IAN, instituto de actualización para odontólogos, y autor de un libro de estética dental. Cada tratamiento se diseña a la medida de cada paciente. ¿Le gustaría agendar su valoración? Más información: drfelipedejesusramos.com",
  tecnologia:
    "Realizamos escaneo intraoral 3D de su boca para crear un modelo exacto de sus dientes, sin moldes de pasta, así que el proceso es cómodo y rápido. Nuestro laboratorio es totalmente digital: permite un ajuste muy preciso, tratamientos menos invasivos y, según el caso, coronas o incrustaciones hasta en una sola cita. Cada tratamiento es totalmente personalizado.",

  // ── Precios (nunca de tratamientos) ──
  precio_tratamiento:
    "El Dr. Felipe no maneja precios fijos porque cada tratamiento se diseña a su medida: revisa cuántas piezas hay que trabajar y el procedimiento, y le ofrece el mejor tratamiento para su caso. En su valoración (unos 30 minutos) el Dr. Ramos:\n✔️ le escanea sus dientes en 3D\n✔️ le muestra en pantalla cómo están sus dientes, para ofrecerle una alternativa que se adapte a sus necesidades\n✔️ si hace falta, le toma radiografía digital, incluida en el costo de la valoración\nY sale con su presupuesto exacto.",
  precio_valoracion:
    "La valoración tiene un costo de $500. Si en esa cita deja el anticipo de su tratamiento, se le toma a cuenta.",
  valoracion_que_es:
    "La valoración dura unos 30 minutos: el doctor revisa su boca, hace un escaneo intraoral en 3D sin pastas de impresión, platica con usted qué le gustaría mejorar y le da su presupuesto exacto.",
  que_llevar: "No necesita llevar nada especial. Si tiene radiografías o estudios recientes, puede traerlos.",
  duele:
    "El doctor trabaja con mucho cuidado y usa anestesia cuando hace falta; el escaneo 3D no lleva pastas. En la valoración le explica cada paso.",
  cuanto_tarda:
    "Depende de cada caso. Con el laboratorio propio los tiempos suelen ser más cortos, y en la cita de valoración el doctor le da su plan con tiempos.",

  // ── Tratamientos (información general; el doctor confirma en la valoración) ──
  info_carillas:
    "Las carillas son láminas muy delgadas que se colocan sobre el frente de los dientes para mejorar su forma, color o tamaño. Pueden ser de diferentes materiales, y el doctor le explica qué opción conviene en su caso durante la cita de valoración.",
  info_blanqueamiento:
    "El blanqueamiento aclara el color natural de los dientes con un gel profesional. No cambia el color de resinas, coronas o carillas que ya tenga, y puede dar sensibilidad pasajera. Primero se revisa que encías y dientes estén sanos.",
  info_diseno_sonrisa:
    "El diseño de sonrisa es una planeación personalizada en la que la estética y la función de la mordida se integran para lograr un resultado natural. El doctor lo diseña en computadora como parte del tratamiento y puede combinar carillas, coronas o blanqueamiento, según el caso.",
  info_implantes:
    "Un implante reemplaza un diente que falta: se coloca un tornillo de titanio en el hueso, que funciona como raíz, y encima va una corona. El hueso necesita algunos meses para integrarse. En la valoración el doctor revisa si es candidato.",
  info_coronas:
    "Las coronas son como \"fundas\" que cubren todo el diente cuando está muy dañado o desgastado. Con el escaneo 3D y el laboratorio propio, según el caso, muchas se hacen hasta en una cita.",
  info_puentes: "Un puente son dientes fijos que reemplazan uno o varios dientes faltantes apoyándose en los dientes vecinos.",
  info_protesis:
    "Hay prótesis removibles (se quitan y se ponen) y fijas (no se quitan, como puentes o prótesis sobre implantes). En la valoración el doctor le explica cuál conviene en su caso.",
  info_rehabilitacion:
    "La rehabilitación oral es un tratamiento integral cuando faltan o están dañados varios dientes, están muy desgastados o la mordida no funciona bien (por ejemplo, por bruxismo). Se planea por etapas, a la medida de cada persona.",
  info_resinas: "Las resinas arreglan caries pequeñas o dientes despostillados con material del color del diente.",
  info_limpieza:
    "Hacemos limpieza profesional con ultrasonido y revisión general. Se recomienda cada 6 meses.",
  info_endodoncia:
    "El tratamiento de conductos (endodoncia) depende de cada caso: en la valoración el doctor revisa su diente y le indica cómo se puede atender.",
  otros_tratamientos:
    "Para ese tratamiento es importante valorar su caso, para ver si es candidato. ¿Le gustaría agendar una valoración?",
  urgencias_si: "Sí atendemos urgencias.",

  // ── Lo que no se hace ──
  no_ortodoncia:
    "La ortodoncia (brackets o alineadores) por el momento no la realizamos en el consultorio, una disculpa 🙏",
  no_cirugia_maxilofacial:
    "La cirugía maxilofacial la realiza un cirujano maxilofacial; por el momento no la realizamos en el consultorio, una disculpa 🙏",
  no_ninos:
    "Por el momento no atendemos a niños, una disculpa 🙏 Atendemos a partir de los 18 años.",

  // ── Agendar ──
  invitar_valoracion: "¿Le gustaría agendar una valoración? ¿Le acomoda más entre semana o el sábado en la mañana?",
  ofrecer_horarios: "Para el {dia} tenemos libre a las {horarios}. ¿Cuál le acomoda?",
  sin_horarios: "Para el {dia} ya no tenemos espacio. ¿Le acomoda otro día?",
  pedir_datos: "Perfecto. Para apartar su lugar, ¿me comparte su nombre completo y qué le gustaría mejorar de su sonrisa?",
  preguntar_origen: "Una última pregunta: ¿cómo se enteró del consultorio? (Facebook, Instagram, Google, recomendación…)",
  confirmar_cita:
    "¡Listo{nombre}! Su valoración quedó el {dia} a las {hora} con el Dr. Felipe, en Gómez Palacio 501 Pte., dentro de Central Médica Santa Ana 📍 Le esperamos 😊 Sus datos se usan sólo para atenderle: drfelipedejesusramos.com/privacidad",

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
  urgencia_cerrado:
    "Lamentamos mucho su molestia 🙏 En este momento el consultorio está cerrado. Abrimos {dia} a las 9:00 y con gusto le apartamos un lugar a primera hora; ¿quiere que se lo aparte? Si tiene sangrado que no para, hinchazón que le dificulta respirar o tragar, o fiebre alta, acuda a urgencias de un hospital.",
};

/** Primer renglón del primer mensaje a un paciente nuevo (lo agrega el código, el modelo no lo elige). */
export const PRESENTACION =
  "Hola, soy el asistente virtual del consultorio del Dr. Felipe Ramos 😊 Al escribirnos acepta nuestro aviso de privacidad: drfelipedejesusramos.com/privacidad";

/** Respuestas que llevan datos y cuáles (el sistema los llena con la agenda). */
export const VARIABLES = {
  ofrecer_horarios: ["dia", "horarios"],
  sin_horarios: ["dia"],
  confirmar_cita: ["dia", "hora"],
  pasar_dra_gaby_cerrado: ["dia"],
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
    ["que_llevar", "¿Qué llevo a la valoración?"], ["duele", "¿Duele?"], ["cuanto_tarda", "¿Cuánto tarda el tratamiento?"],
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

/** Texto final de varias respuestas aprobadas, con sus datos. Devuelve { texto } o { error }. */
export function armar(ids, variables = {}, textos = ORIGINALES) {
  const partes = [];
  for (const id of ids || []) {
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
  return { texto: partes.join("\n\n") };
}

/** Lista para las instrucciones del modelo (id: texto), sin la presentación. */
/** Respuestas que manda SÓLO el sistema (al pasar el caso): el modelo no las puede elegir. */
export const SOLO_SISTEMA = new Set(["pasar_dra_gaby", "pasar_urgencia", "pasar_dra_gaby_cerrado", "urgencia_cerrado"]);

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
