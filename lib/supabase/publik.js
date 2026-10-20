import { createClient } from "@supabase/supabase-js";

// Koneksi server untuk pengunjung (tanpa login). Hanya untuk membaca data publik.
export function buatKlienPublik() {
  let url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (url) {
    url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default buatKlienPublik;
