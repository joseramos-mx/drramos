import LoginForm from "./login-form";

export const metadata = {
  title: { absolute: "Acceso CRM | Dr. Felipe Ramos" },
  robots: { index: false, follow: false },
};

export default function CrmLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px]">
        <p className="font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
          Personal del consultorio
        </p>

        <h1 className="mt-4 font-[family-name:var(--font-cormorant)] text-[clamp(34px,5vw,48px)] font-light leading-[1.1] text-[#f5f1ea]">
          Acceso al CRM.
        </h1>

        <p className="mt-3 font-[family-name:var(--font-albert)] text-[14px] font-light leading-[1.6] text-white/55">
          Esta sección es de uso exclusivo del equipo. Si necesitas acceso,
          pídeselo a quien administra el consultorio.
        </p>

        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
