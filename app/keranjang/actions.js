"use server";

import { buatKlienPublik } from "@/lib/supabase/publik";

// US-21: mengambil data terbaru (harga, diskon, stok) produk di keranjang.
// Hanya membaca data katalog yang memang publik; harga tidak dipercaya dari browser.
export async function ambilProdukKeranjang(daftarId) {
  const ids = [...new Set((Array.isArray(daftarId) ? daftarId : []).map(Number))]
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, 100);

  if (ids.length === 0) return { produk: [] };

  try {
    const supabase = buatKlienPublik();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, foto_url, stok, harga_diskon")
      .in("id", ids);

    if (error) {
      console.error("Gagal mengambil produk keranjang:", error.message);
      return { error: "Keranjang belum bisa dimuat. Coba lagi nanti." };
    }

    return { produk: data ?? [] };
  } catch (err) {
    console.error("Kesalahan koneksi Supabase:", err.message);
    return { error: "Keranjang belum bisa dimuat. Coba lagi nanti." };
  }
}
