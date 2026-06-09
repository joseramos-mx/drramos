This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## CRM interno (/crm)

Mini panel para que el personal del consultorio gestione los leads que
entran por el formulario de la landing.

### Setup manual en Supabase, una sola vez

1. **Correr la migración** `supabase/migrations/20260609000000_crm_extensions.sql`
   en SQL Editor del proyecto. Agrega la columna `notas` y las policies
   de SELECT y UPDATE para usuarios autenticados.
2. **Desactivar signups públicos.** En el dashboard de Supabase:
   Authentication, Providers, Email. Apaga el toggle de **Enable Sign ups**.
   Sin esto, cualquiera podría crear una cuenta con la anon key del
   browser y leer los leads (RLS lo permite a `authenticated`).
3. **Crear los usuarios del personal a mano** en Authentication, Users,
   Add user, Create new user. Pon email y contraseña. Marca **Auto
   confirm user** para que no requiera verificación de correo.

### Acceso

- `/crm/login` para iniciar sesión.
- `/crm` muestra los leads, contadores, filtros y permite editar
  estado y notas inline.
- Las páginas tienen `robots: noindex, nofollow`.

### Seguridad

- Todo el acceso pasa por anon key + Row Level Security de Supabase.
- Nunca se usa la `service_role` key en el browser ni en middleware.
- La policy de INSERT para `anon` (la landing pública) sigue intacta;
  los nuevos policies son SELECT y UPDATE solo para `authenticated`.
- El middleware de Next protege todo `/crm/*` excepto `/crm/login`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
