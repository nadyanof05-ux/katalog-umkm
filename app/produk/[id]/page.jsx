import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { buatKlienPublik } from "@/lib/supabase/publik";
import { formatRupiah } from "@/lib/format";

// Selalu ambil data terbaru dari database.
export const dynamic = "force-dynamic";

// US-02: ambil satu produk dari Supabase di sisi server.
async function ambilProduk(id) {
  const idProduk = Number(id);
  if (!Number.isInteger(idProduk) || idProduk <= 0) return null;

  try {
    const supabase = buatKlienPublik();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .eq("id", idProduk)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil detail produk:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Kesalahan koneksi Supabase:", err.message);
    return null;
  }
}

// US-17: produk lain dari kategori yang sama, tanpa produk yang sedang dibuka.
const JUMLAH_TERKAIT = 4;

async function ambilProdukTerkait(produk) {
  if (!produk.kategori) return [];

  try {
    const supabase = buatKlienPublik();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .eq("kategori", produk.kategori)
      .neq("id", produk.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(JUMLAH_TERKAIT);

    if (error) {
      console.error("Gagal mengambil produk terkait:", error.message);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("Kesalahan koneksi Supabase:", err.message);
    return [];
  }
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  const produkTerkait = await ambilProdukTerkait(produk);

  return (
    <>
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
        />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          <p className="text-sm text-teks-lembut">{produk.kategori}</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <TombolWhatsApp produk={produk} />
        </div>
      </article>
      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-terkait" className="flex flex-col gap-4 pb-10">
          <h2 id="judul-terkait" className="text-xl font-bold">
            Produk lain di kategori {produk.kategori}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
