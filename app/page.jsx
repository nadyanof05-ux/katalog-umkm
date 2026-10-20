import KartuProduk from "@/components/KartuProduk";
import { buatKlienPublik } from "@/lib/supabase/publik";
import { toko } from "@/lib/toko";

// Selalu ambil data terbaru dari database.
export const dynamic = "force-dynamic";

async function ambilProduk() {
  try {
    const supabase = buatKlienPublik();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .order("created_at", { ascending: false });

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

export default async function HalamanKatalog() {
  const { data: daftarProduk, error } = await ambilProduk();

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
        {error ? (
          <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-teks-lembut">
            Produk belum bisa ditampilkan saat ini. Silakan coba lagi nanti.
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-teks-lembut">
            Belum ada produk.
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
