import HargaProduk from "@/components/HargaProduk";
import BadgeProduk from "@/components/BadgeProduk";
import { fotoUtama } from "@/lib/foto";
import Tombol from "@/components/Tombol";
import TombolAktif from "@/components/TombolAktif";
import TombolHapus from "@/components/TombolHapus";

export default function TabelProduk({ daftarProduk }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">Stok</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className={`border-t border-garis ${produk.aktif === false ? "bg-permukaan" : ""}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={fotoUtama(produk.foto_url)} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <span className="font-semibold">{produk.nama}</span>
                  <BadgeProduk badge={produk.badge} />
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
              <td className="px-4 py-3">
                <HargaProduk produk={produk} />
              </td>
              <td className={`px-4 py-3 ${produk.stok <= 0 ? "font-semibold text-bahaya" : ""}`}>
                {produk.stok <= 0 ? "Habis" : produk.stok}
              </td>
              <td className={`px-4 py-3 ${produk.aktif === false ? "text-teks-lembut" : "font-semibold text-utama"}`}>
                {produk.aktif === false ? "Nonaktif" : "Aktif"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {/* US-09 dan US-10: ubah dan hapus produk */}
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <TombolAktif id={produk.id} aktif={produk.aktif !== false} />
                  <TombolHapus id={produk.id} nama={produk.nama} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
