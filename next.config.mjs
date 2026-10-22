/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fotos que la Dra. Gaby manda desde "Mensajes" (ya reducidas en el navegador)
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
