import { formatRupiah } from "@/lib/format";
import { adaDiskon, hargaAkhir } from "@/lib/harga";

// Harga produk; kalau diskon, harga normal tampil dicoret (US-20).
export default function HargaProduk({ produk, besar = false }) {
  const label = besar ? "px-3 py-1 text-xl" : "px-2 py-0.5 text-sm";
  const coret = besar ? "text-base" : "text-xs";

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <p className={`rounded-md bg-harga-latar font-bold text-harga ${label}`}>
        {formatRupiah(hargaAkhir(produk))}
      </p>
      {adaDiskon(produk) && (
        <p className={`text-teks-lembut line-through ${coret}`}>
          <span className="sr-only">Harga normal </span>
          {formatRupiah(produk.harga)}
        </p>
      )}
    </div>
  );
}
