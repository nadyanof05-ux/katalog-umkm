import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Paginasi from "@/components/Paginasi";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKlienAdmin } from "@/lib/supabase/admin";
import { escapeLike } from "@/lib/paginasi";

// Selalu ambil data produk terbaru dari database.
export const dynamic = "force-dynamic";

// US-33: jumlah baris per halaman di daftar admin.
const PER_HALAMAN = 10;

// Dilindungi proxy.js. Pencarian dan halaman ada di URL (?q=...&halaman=...).
export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const nilai = (kunci) => {
    const v = params?.[kunci];
    return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  };
  const q = nilai("q");
  const halamanDiminta = Math.max(1, parseInt(nilai("halaman"), 10) || 1);

  const buatUrl = (nomor) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (nomor > 1) sp.set("halaman", String(nomor));
    const teks = sp.toString();
    return teks ? `/admin?${teks}` : "/admin";
  };

  const saring = (query) => (q ? query.ilike("nama", `%${escapeLike(q)}%`) : query);

  let daftarProduk = [];
  let totalProduk = 0;
  let halaman = halamanDiminta;
  let error = null;

  try {
    const supabase = await buatKlienAdmin();

    // Hitung total yang cocok di database, lalu ambil hanya satu halaman (.range).
    const hitung = await saring(
      supabase.from("produk").select("id", { count: "exact", head: true }),
    );
    if (hitung.error) throw hitung.error;
    totalProduk = hitung.count ?? 0;

    halaman = Math.min(halamanDiminta, Math.max(1, Math.ceil(totalProduk / PER_HALAMAN)));

    if (halaman === halamanDiminta && totalProduk > 0) {
      const dari = (halaman - 1) * PER_HALAMAN;
      const hasil = await saring(
        supabase
          .from("produk")
          .select("id, nama, harga, deskripsi, foto_url, kategori, stok, harga_diskon, badge, aktif, created_at")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(dari, dari + PER_HALAMAN - 1),
      );
      if (hasil.error) throw hasil.error;
      daftarProduk = hasil.data ?? [];
    }
  } catch (err) {
    console.error("Gagal mengambil daftar produk di halaman admin:", err.message);
    error = err;
  }

  // Nomor halaman di luar jangkauan: arahkan ke halaman terakhir yang sah.
  if (!error && halaman !== halamanDiminta) redirect(buatUrl(halaman));

  const totalHalaman = Math.max(1, Math.ceil(totalProduk / PER_HALAMAN));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      <form method="get" action="/admin" className="flex items-end gap-3">
        <div className="max-w-sm flex-1">
          <Input
            label="Cari produk"
            name="q"
            type="search"
            placeholder="Ketik nama produk"
            defaultValue={q}
          />
        </div>
        <Tombol type="submit">Cari</Tombol>
        {q && (
          <Tombol href="/admin" varian="garis">
            Reset
          </Tombol>
        )}
      </form>

      {error ? (
        <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-bahaya">
          Daftar produk belum bisa dimuat. Coba muat ulang halaman.
        </p>
      ) : daftarProduk.length === 0 ? (
        <p className="rounded-lg border border-garis bg-permukaan px-3 py-2 text-sm text-teks-lembut">
          {q ? `Tidak ada produk yang cocok dengan "${q}".` : "Belum ada produk."}
        </p>
      ) : (
        <>
          <TabelProduk daftarProduk={daftarProduk} />
          <Paginasi
            halaman={halaman}
            totalHalaman={totalHalaman}
            totalProduk={totalProduk}
            buatUrl={buatUrl}
          />
        </>
      )}
    </div>
  );
}
