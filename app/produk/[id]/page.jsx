import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  return (
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
  );
}
