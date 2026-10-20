import { redirect } from "next/navigation";
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

// US-16: jumlah produk per halaman. 12 habis dibagi 2 dan 3 (jumlah kolom grid).
const PER_HALAMAN = 12;

// US-11: penyaringan dilakukan di server lewat query string (?q=...&kategori=...).
const terapkanFilter = (query, { q, kategori }) => {
  if (kategori) query = query.eq("kategori", kategori);
  if (q) query = query.ilike("nama", `%${escapeLike(q)}%`);
  return query;
};

// Hitung total produk yang cocok (query terpisah di database, tanpa mengambil barisnya).
async function hitungProduk(filter) {
  const supabase = buatKlienPublik();
  const { count, error } = await terapkanFilter(
    supabase.from("produk").select("id", { count: "exact", head: true }),
    filter,
  );
  if (error) throw error;
  return count ?? 0;
}

// US-16: hanya satu halaman yang diambil dari database (.range), bukan semuanya.
async function ambilProduk(filter, { urutan, halaman }) {
  const supabase = buatKlienPublik();
  const dari = (halaman - 1) * PER_HALAMAN;
  const { data, error } = await terapkanFilter(
    supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, stok, harga_diskon, badge, created_at")
      .order(URUTAN[urutan].kolom, { ascending: URUTAN[urutan].naik })
      .order("id", { ascending: false })
      .range(dari, dari + PER_HALAMAN - 1),
    filter,
  );
  if (error) throw error;
  return data ?? [];
}

// Nomor halaman yang ditampilkan: awal, akhir, dan sekitar halaman aktif ("..." untuk celah).
function daftarNomorHalaman(aktif, total) {
  const nomor = new Set([1, total, aktif - 1, aktif, aktif + 1]);
  const urut = [...nomor].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const hasil = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push("...");
    hasil.push(n);
  });
  return hasil;
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
  const halamanDiminta = Math.max(1, parseInt(nilai("halaman"), 10) || 1);
  const disaring = adaFilter || urutan !== "terbaru";

  const filter = { q, kategori };
  const buatUrl = (nomor) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (kategori) sp.set("kategori", kategori);
    if (urutan !== "terbaru") sp.set("urutan", urutan);
    if (nomor > 1) sp.set("halaman", String(nomor));
    const teks = sp.toString();
    return teks ? `/?${teks}` : "/";
  };

  let daftarProduk = [];
  let totalProduk = 0;
  let error = null;
  let halaman = halamanDiminta;
  const daftarKategori = await ambilKategori();

  try {
    totalProduk = await hitungProduk(filter);
    const totalHalamanSementara = Math.max(1, Math.ceil(totalProduk / PER_HALAMAN));
    halaman = Math.min(halamanDiminta, totalHalamanSementara);
    if (halaman === halamanDiminta && totalProduk > 0) {
      daftarProduk = await ambilProduk(filter, { urutan, halaman });
    }
  } catch (err) {
    console.error("Gagal mengambil data produk:", err.message);
    error = err;
  }

  // Nomor halaman di luar jangkauan: arahkan ke halaman terakhir yang sah.
  if (!error && halaman !== halamanDiminta) redirect(buatUrl(halaman));

  const totalHalaman = Math.max(1, Math.ceil(totalProduk / PER_HALAMAN));

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
        {!error && totalHalaman > 1 && (
          <nav aria-label="Navigasi halaman" className="flex flex-col items-center gap-3 pb-4">
            <p className="text-sm text-teks-lembut">
              Halaman {halaman} dari {totalHalaman} ({totalProduk} produk)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {halaman > 1 && (
                <Tombol href={buatUrl(halaman - 1)} varian="garis">
                  Sebelumnya
                </Tombol>
              )}
              {daftarNomorHalaman(halaman, totalHalaman).map((n, i) =>
                n === "..." ? (
                  <span key={`celah-${i}`} className="px-1 text-teks-lembut">
                    ...
                  </span>
                ) : (
                  <Tombol
                    key={n}
                    href={buatUrl(n)}
                    varian={n === halaman ? "utama" : "garis"}
                  >
                    {n}
                  </Tombol>
                ),
              )}
              {halaman < totalHalaman && (
                <Tombol href={buatUrl(halaman + 1)} varian="garis">
                  Berikutnya
                </Tombol>
              )}
            </div>
          </nav>
        )}
      </section>
    </>
  );
}
