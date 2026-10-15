import CrmLayout from "../crm/layout";

/**
 * La agenda usa las mismas fuentes y fondo que el CRM (y que la
 * landing /diseno-sonrisa). No se indexa.
 */
export const metadata = {
  title: { absolute: "Agenda | Dr. Felipe Ramos" },
  description: "Agenda interna del consultorio.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default CrmLayout;
