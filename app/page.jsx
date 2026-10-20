import KartuProduk from "@/components/KartuProduk";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatKlienPublik } from "@/lib/supabase/publik";
import { toko } from "@/lib/toko";

// Selalu ambil data terbaru dari database.
export const dynamic = "force-dynamic";

// Escape karakter khusus pola LIKE supaya "%" dan "_" dicari apa adanya.
const escapeLike = (teks) => teks.replace(/[\\%_]/g, "\\$&");

// US-15: pilihan urutan, diterapkan di query ke database. Nilai lain jatuh ke "terbaru".
const URUTAN = {
  terbaru: { label: "Terbaru", kolom: "created_at", naik: false },
  termurah: { label: "Termurah", kolom: "harga", naik: true },
  termahal: { label: "Termahal", kolom: "harga", naik: false },
};

// US-11: penyaringan dilakukan di server lewat query string (?q=...&kategori=...).
async function ambilProduk({ q, kategori, urutan }) {
  try {
    const supabase = buatKlienPublik();
    let query = supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .order(URUTAN[urutan].kolom, { ascending: URUTAN[urutan].naik })
      .order("id", { ascending: false });

    if (kategori) query = query.eq("kategori", kategori);
    if (q) query = query.ilike("nama", `%${escapeLike(q)}%`);

    const { data, error } = await query;

    if (error) {
      console.error("Gagal mengambil data produk:", error.message);
      return { data: [], error };
    }

    return { data: data ?? [], error: null };
  } catch (err) {
    console.error("Kesalahan koneksi Supabase:", err.message);
    return { data: [], error: err };
  }
}

async function ambilKategori() {
  try {
    const supabase = buatKlienPublik();
    const { data } = await supabase.from("produk").select("kategori");
    const unik = new Set((data ?? []).map((baris) => baris.kategori).filter(Boolean));
    return [...unik].sort((a, b) => a.localeCompare(b, "id"));
  } catch {
    return [];
  }
}

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const nilai = (kunci) => {
    const v = params?.[kunci];
    return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  };
  const q = nilai("q");
  const kategori = nilai("kategori");
  const urutan = Object.hasOwn(URUTAN, nilai("urutan")) ? nilai("urutan") : "terbaru";
  const adaFilter = Boolean(q || kategori);
  const disaring = adaFilter || urutan !== "terbaru";

  const [{ data: daftarProduk, error }, daftarKategori] = await Promise.all([
    ambilProduk({ q, kategori, urutan }),
    ambilKategori(),
  ]);

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        <form method="get" action="/" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:flex-1">
            <Input
              label="Cari produk"
              name="q"
              type="search"
              placeholder="Ketik nama produk"
              defaultValue={q}
            />
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Kategori
            <select
              name="kategori"
              defaultValue={kategori}
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
            >
              <option value="">Semua kategori</option>
              {daftarKategori.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Urutkan
            <select
              name="urutan"
              defaultValue={urutan}
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
            >
              {Object.entries(URUTAN).map(([kunci, { label }]) => (
                <option key={kunci} value={kunci}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <Tombol type="submit">Terapkan</Tombol>
            {disaring && (
              <Tombol href="/" varian="garis">
                Reset
              </Tombol>
            )}
          </div>
        </form>
        {error ? (
          <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-teks-lembut">
            Produk belum bisa ditampilkan saat ini. Silakan coba lagi nanti.
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-teks-lembut">
            {adaFilter ? "Tidak ada produk yang cocok dengan pencarian atau kategori ini." : "Belum ada produk."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
