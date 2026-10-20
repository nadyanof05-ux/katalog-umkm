import Tombol from "@/components/Tombol";
import { daftarNomorHalaman } from "@/lib/paginasi";

// Navigasi halaman. `buatUrl(nomor)` membuat tautan yang membawa kata kunci dan filter.
export default function Paginasi({ halaman, totalHalaman, totalProduk, buatUrl }) {
  if (totalHalaman <= 1) return null;

  return (
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
            <Tombol key={n} href={buatUrl(n)} varian={n === halaman ? "utama" : "garis"}>
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
  );
}
