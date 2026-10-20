import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Koneksi sesi admin memakai Supabase Auth (@supabase/ssr) dan cookie.
export async function buatKlienAdmin() {
  const cookieStore = await cookies();

  let url = process.env.SUPABASE_URL;
  if (url) {
    url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  }

  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Abaikan jika dipanggil dari Server Component
        }
      },
    },
  });
}

export default buatKlienAdmin;

