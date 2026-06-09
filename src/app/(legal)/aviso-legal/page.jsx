export const metadata = {
  title: { absolute: "Aviso legal | Dr. Felipe Ramos · Durango" },
  description:
    "Aviso legal del sitio del Dr. Felipe de Jesús Ramos. Titularidad, propósito informativo, propiedad intelectual y limitación de responsabilidad.",
  alternates: {
    canonical: "https://www.drfelipedejesusramos.com/aviso-legal",
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATE = "9 de junio de 2026";

export default function AvisoLegalPage() {
  return (
    <article className="mx-auto w-full max-w-[760px] px-8 py-20 md:px-12 md:py-28">
      <p className="font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
        Aviso legal
      </p>

      <h1 className="mt-6 font-[family-name:var(--font-cormorant)] text-[clamp(36px,5vw,56px)] font-light leading-[1.1] text-[#f5f1ea]">
        Términos de uso del sitio.
      </h1>

      <p className="mt-6 font-[family-name:var(--font-albert)] text-[13px] font-light uppercase tracking-[0.18em] text-white/55">
        Última actualización: {LAST_UPDATE}
      </p>

      <div className="mt-8 border border-[#b89968]/30 bg-[#b89968]/[0.06] p-5 font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/70">
        Nota interna: este documento debe ser revisado y aprobado por el
        responsable legal del consultorio antes de su publicación. Los
        campos marcados con [REVISAR] deben confirmarse o reemplazarse
        con los datos reales del consultorio.
      </div>

      <Prose>
        <Section title="1. Titularidad">
          <p>
            El sitio{" "}
            <em>www.drfelipedejesusramos.com</em> y todas sus subrutas son
            operados por el Consultorio del Dr. Felipe de Jesús Ramos
            Sotelo, con domicilio en Prol. Gómez Palacio 501, Zona Centro,
            C.P. 34000, Durango, Dgo., México [REVISAR: confirmar razón
            social y datos fiscales registrados]. Para cualquier asunto
            relacionado con el contenido del sitio, escriba a{" "}
            <a
              href="mailto:hello@rmsindustries.io"
              className="underline decoration-[#b89968]/60 underline-offset-4 transition-colors hover:text-[#b89968]"
            >
              hello@rmsindustries.io
            </a>
            .
          </p>
        </Section>

        <Section title="2. Propósito informativo">
          <p>
            El contenido publicado en este sitio tiene un propósito
            exclusivamente informativo. Describe servicios de odontología
            estética, diseño digital de sonrisa y rehabilitación, así como
            la trayectoria profesional del Dr. Felipe. Ninguna información
            de este sitio constituye un diagnóstico médico, recomendación
            individual de tratamiento ni sustituye una consulta presencial
            con un profesional de la salud.
          </p>
          <p>
            La determinación del tratamiento aplicable a cada caso se
            realiza únicamente durante la valoración privada en el
            consultorio, considerando la situación clínica específica del
            paciente.
          </p>
        </Section>

        <Section title="3. Casos y resultados mostrados">
          <p>
            Las fotografías de antes y después que se muestran en el sitio
            corresponden a pacientes reales del Dr. Felipe, publicadas con
            su consentimiento. Los resultados son individuales y dependen
            de las condiciones particulares de cada paciente, por lo que
            no constituyen una promesa de resultado clínico equivalente
            para terceros. Los tiempos de tratamiento referidos (pocas
            citas) son estimaciones generales y se ajustan durante la
            valoración inicial.
          </p>
        </Section>

        <Section title="4. Propiedad intelectual">
          <p>
            Todos los contenidos del sitio, incluyendo pero no limitado a
            textos, gráficos, fotografías, ilustraciones, logotipos,
            tipografías, código fuente, diseño visual y selección y
            disposición de la información, están protegidos por las leyes
            de propiedad intelectual y derechos de autor aplicables en los
            Estados Unidos Mexicanos.
          </p>
          <p>
            Las marcas comerciales de terceros que aparecen en el sitio
            (por ejemplo TRIOS, 3Shape, exocad, Elegoo, BSM, RMS Zahn,
            Visa, Mastercard, American Express) son propiedad de sus
            respectivos titulares y se usan únicamente con propósito
            informativo y de identificación de tecnologías o métodos de
            pago aceptados, sin implicar afiliación, patrocinio o respaldo
            por su parte.
          </p>
          <p>
            Queda prohibida la reproducción, distribución, comunicación
            pública o transformación del contenido del sitio sin
            autorización previa por escrito del titular.
          </p>
        </Section>

        <Section title="5. Enlaces a terceros">
          <p>
            El sitio puede contener enlaces a servicios de terceros (por
            ejemplo WhatsApp para coordinar una cita). El titular no
            controla ni se responsabiliza por el contenido, las prácticas
            de privacidad o el funcionamiento de los sitios o servicios
            enlazados.
          </p>
        </Section>

        <Section title="6. Limitación de responsabilidad">
          <p>
            El titular hace su mejor esfuerzo por mantener el sitio
            disponible, seguro y actualizado, pero no garantiza la
            ausencia de errores, interrupciones, virus u otros elementos
            que puedan afectar el sitio. En la medida permitida por la ley,
            el titular no será responsable por daños directos, indirectos,
            incidentales o consecuentes que se deriven del uso, la
            imposibilidad de uso, o la confianza en la información del
            sitio.
          </p>
          <p>
            Las decisiones clínicas se toman únicamente con base en la
            valoración presencial y bajo la responsabilidad del
            profesional tratante, no con base en el contenido publicado en
            el sitio.
          </p>
        </Section>

        <Section title="7. Tratamiento de datos personales">
          <p>
            El tratamiento de los datos personales que usted comparte a
            través del formulario o por otros medios se rige por nuestro{" "}
            <a
              href="/privacidad"
              className="underline decoration-[#b89968]/60 underline-offset-4 transition-colors hover:text-[#b89968]"
            >
              Aviso de privacidad
            </a>
            , que forma parte integral de este Aviso legal.
          </p>
        </Section>

        <Section title="8. Legislación y jurisdicción">
          <p>
            Este Aviso legal se rige por las leyes aplicables en los
            Estados Unidos Mexicanos. Para cualquier controversia derivada
            del uso del sitio, las partes se someten a la jurisdicción de
            los tribunales competentes en Durango, Dgo.
          </p>
        </Section>

        <Section title="9. Modificaciones">
          <p>
            El titular se reserva el derecho de modificar este Aviso legal
            en cualquier momento. Los cambios serán efectivos al momento
            de su publicación en esta misma página, con la fecha de
            actualización correspondiente.
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
