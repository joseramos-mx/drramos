export const metadata = {
  title: { absolute: "Aviso de privacidad | Dr. Felipe Ramos · Durango" },
  description:
    "Aviso de privacidad del Consultorio del Dr. Felipe de Jesús Ramos. Tratamiento de datos personales, finalidades, derechos ARCO y herramientas de medición.",
  alternates: {
    canonical: "https://www.drfelipedejesusramos.com/privacidad",
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATE = "9 de junio de 2026";

export default function PrivacidadPage() {
  return (
    <article className="mx-auto w-full max-w-[760px] px-8 py-20 md:px-12 md:py-28">
      <p className="font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
        Aviso de privacidad
      </p>

      <h1 className="mt-6 font-[family-name:var(--font-cormorant)] text-[clamp(36px,5vw,56px)] font-light leading-[1.1] text-[#f5f1ea]">
        Aviso de privacidad integral.
      </h1>

      <p className="mt-6 font-[family-name:var(--font-albert)] text-[13px] font-light uppercase tracking-[0.18em] text-white/55">
        Última actualización: {LAST_UPDATE}
      </p>

      <div className="mt-8 border border-[#b89968]/30 bg-[#b89968]/[0.06] p-5 font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/70">
        Nota interna: este documento debe ser revisado y aprobado por el
        responsable legal del consultorio antes de su publicación definitiva.
        Los campos marcados con [REVISAR] deben confirmarse o reemplazarse
        con los datos reales del consultorio.
      </div>

      <Prose>
        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de sus datos personales es el
            Consultorio del Dr. Felipe de Jesús Ramos Sotelo, con
            domicilio en Prol. Gómez Palacio 501, Zona Centro, C.P. 34000,
            Durango, Dgo., México [REVISAR: confirmar razón social
            registrada para efectos fiscales]. Para cualquier asunto
            relacionado con sus datos personales puede dirigirse al correo
            electrónico{" "}
            <a
              href="mailto:hello@rmsindustries.io"
              className="underline decoration-[#b89968]/60 underline-offset-4 transition-colors hover:text-[#b89968]"
            >
              hello@rmsindustries.io
            </a>
            .
          </p>
        </Section>

        <Section title="2. Datos personales que recolectamos">
          <p>
            A través del formulario de aplicación de la página
            <em> /diseno-sonrisa</em> recopilamos los siguientes datos
            personales:
          </p>
          <ul>
            <li>Nombre.</li>
            <li>Número de WhatsApp.</li>
            <li>
              Respuestas a tres preguntas breves sobre su situación dental
              actual, su motivo o fecha para iniciar el tratamiento y su
              interés en conocer un plan personalizado. Algunas de estas
              respuestas pueden considerarse datos personales sensibles
              relacionados con su salud bucal.
            </li>
          </ul>
          <p>
            Adicionalmente, al navegar el sitio se recolectan datos técnicos
            no identificativos (URL de referencia, agente de usuario, hora de
            la visita) por nuestras herramientas de medición. Para detalle
            ver la sección 6.
          </p>
        </Section>

        <Section title="3. Finalidades del tratamiento">
          <p>
            Los datos personales se recaban con las siguientes finalidades
            primarias, necesarias para la relación que usted inicia con el
            consultorio:
          </p>
          <ul>
            <li>
              Contactarle por WhatsApp o teléfono para coordinar una
              valoración privada con el Dr. Felipe.
            </li>
            <li>
              Dar seguimiento a su interés en el tratamiento de diseño
              digital de sonrisa o rehabilitación, según corresponda al
              caso.
            </li>
            <li>
              Generar un expediente interno con la información que usted
              compartió, para que el equipo clínico pueda preparar su cita
              de manera eficiente.
            </li>
          </ul>
          <p>
            No utilizamos sus datos para fines distintos a los anteriores
            sin obtener antes su consentimiento.
          </p>
        </Section>

        <Section title="4. Almacenamiento y seguridad">
          <p>
            Sus datos se almacenan en una base de datos administrada por
            nuestro proveedor de servicios en la nube, con controles de
            acceso restringido al personal autorizado del consultorio.
            Implementamos medidas técnicas, administrativas y físicas para
            protegerlos contra pérdida, alteración o acceso no autorizado.
          </p>
        </Section>

        <Section title="5. Transferencias">
          <p>
            No vendemos, comercializamos ni compartimos sus datos personales
            con terceros con fines comerciales. Únicamente compartimos
            información con proveedores tecnológicos que nos ayudan a operar
            el sitio (medición publicitaria y análisis de uso), bajo
            obligación de confidencialidad y limitada a lo descrito en la
            sección 6.
          </p>
        </Section>

        <Section title="6. Herramientas de medición de terceros">
          <p>
            Esta página utiliza dos herramientas de medición:
          </p>
          <ul>
            <li>
              <strong>Meta (Facebook) Pixel y Conversions API.</strong> Se
              utilizan para medir la efectividad de las campañas de
              anuncios. Cuando usted envía el formulario, se reporta a Meta
              el evento de conversión junto con un valor económico
              referencial y la moneda. No se envían a Meta los detalles de
              sus respuestas del cuestionario (estado de salud bucal,
              motivo, intención de financiamiento). Su nombre y número de
              teléfono se envían en forma anonimizada mediante el algoritmo
              de hashing SHA-256, conforme a la práctica estándar de la
              plataforma para mejorar el match de eventos.
            </li>
            <li>
              <strong>Microsoft Clarity.</strong> Se utiliza para análisis
              agregado de uso del sitio (mapas de calor y grabaciones de
              sesión anonimizadas). Clarity está configurado con
              enmascaramiento de contenido sensible, por lo que los campos
              de texto del formulario (nombre y WhatsApp) se ocultan en las
              grabaciones.
            </li>
          </ul>
          <p>
            Estas herramientas pueden colocar cookies o identificadores
            similares en su navegador. Usted puede bloquearlas con las
            opciones de su navegador o con extensiones de privacidad.
          </p>
        </Section>

        <Section title="7. Derechos ARCO">
          <p>
            Usted tiene en todo momento el derecho de:
          </p>
          <ul>
            <li>
              <strong>Acceder</strong> a los datos personales que tenemos
              sobre usted.
            </li>
            <li>
              <strong>Rectificar</strong> datos inexactos o incompletos.
            </li>
            <li>
              <strong>Cancelar</strong> el uso de sus datos cuando considere
              que no se requieren para los fines señalados.
            </li>
            <li>
              <strong>Oponerse</strong> al tratamiento para fines
              específicos.
            </li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escriba a{" "}
            <a
              href="mailto:hello@rmsindustries.io"
              className="underline decoration-[#b89968]/60 underline-offset-4 transition-colors hover:text-[#b89968]"
            >
              hello@rmsindustries.io
            </a>{" "}
            indicando su nombre completo, una forma de contacto y el
            derecho que desea ejercer. Le responderemos en un plazo no
            mayor a veinte días hábiles.
          </p>
        </Section>

        <Section title="8. Conservación de los datos">
          <p>
            Conservamos sus datos por el tiempo necesario para cumplir las
            finalidades descritas y las obligaciones legales aplicables. Si
            decide no continuar con el tratamiento, puede solicitar la
            cancelación en cualquier momento mediante el correo señalado.
          </p>
        </Section>

        <Section title="9. Cambios a este aviso">
          <p>
            Cualquier cambio relevante a este Aviso de Privacidad se
            publicará en esta misma página con la fecha de actualización
            correspondiente. Le sugerimos revisarlo periódicamente.
          </p>
        </Section>

        <Section title="10. Consentimiento">
          <p>
            Al enviar el formulario de aplicación usted reconoce haber leído
            este Aviso de Privacidad y otorga su consentimiento expreso para
            el tratamiento de sus datos personales conforme a las
            finalidades aquí descritas, incluyendo el tratamiento de datos
            personales sensibles relativos a su salud bucal.
          </p>
        </Section>
      </Prose>
    </article>
  );
}

function Prose({ children }) {
  return (
    <div className="mt-12 space-y-12 font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.75] text-white/75 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-white/70 [&_p]:max-w-[640px] [&_em]:italic [&_em]:text-white/85 [&_strong]:font-medium [&_strong]:text-[#f5f1ea]">
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-[22px] font-light text-[#f5f1ea] md:text-[26px]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
