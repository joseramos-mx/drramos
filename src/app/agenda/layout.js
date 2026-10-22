import CrmLayout from "../crm/layout";

/**
 * La agenda es parte de la app de la Dra. Gaby (junto con "Mensajes"):
 * mismo tema claro, letra grande y menú de abajo. No se indexa.
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

export const viewport = { themeColor: "#ffffff" };

export default function AgendaLayout({ children }) {
  return (
    <CrmLayout>
      <div className="min-h-[100dvh] bg-[#f7f5f1] text-[#1c1a17]">{children}</div>
    </CrmLayout>
  );
}
