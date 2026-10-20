import Link from "next/link";
import BadgeProduk from "@/components/BadgeProduk";
import HargaProduk from "@/components/HargaProduk";
import { fotoUtama } from "@/lib/foto";

export default function KartuProduk({ produk }) {
  const habis = produk.stok <= 0;

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
    >
      <div className="relative">
        <img
          src={fotoUtama(produk.foto_url)}
          alt={produk.nama}
          className={`aspect-square w-full bg-permukaan object-cover ${habis ? "opacity-50" : ""}`}
        />
        <BadgeProduk badge={produk.badge} className="absolute right-2 top-2" />
        {habis && (
          <span className="absolute left-2 top-2 rounded-md bg-teks px-2 py-0.5 text-xs font-bold text-latar">
            Habis
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-teks-lembut">{produk.kategori}</p>
        <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>
        <div className="mt-auto">
          <HargaProduk produk={produk} />
        </div>
      </div>
    </Link>
  );
}
