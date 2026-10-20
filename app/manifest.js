import { toko } from "@/lib/toko";

// US-13: web app manifest. Next.js menautkannya otomatis di <head> sebagai /manifest.webmanifest.
// Warna mengikuti token `latar` dan `utama` di DESIGN.md.
export default function manifest() {
  return {
    name: toko.nama,
    short_name: toko.nama,
    description: toko.tagline,
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f6b4f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
