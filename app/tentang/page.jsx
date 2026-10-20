import Tombol from "@/components/Tombol";
import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang ${toko.nama}`,
  description: toko.tagline,
};

// US-22: profil toko, alamat, jam buka, dan kontak. Semua data dari lib/toko.js.
export default function HalamanTentang() {
  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "");
  const linkWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(
    `Halo ${toko.nama}, saya ingin bertanya.`,
  )}`;
  const linkPeta = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${toko.nama} ${toko.alamat}`,
  )}`;

  return (
    <div className="flex max-w-2xl flex-col gap-8 py-8 sm:py-12">
      <section>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
          Tentang {toko.nama}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-teks-lembut">{toko.tagline}</p>
      </section>

      <section aria-labelledby="judul-info" className="flex flex-col gap-4">
        <h2 id="judul-info" className="text-xl font-bold">
          Informasi toko
        </h2>
        <dl className="flex flex-col divide-y divide-garis rounded-2xl border border-garis">
          <div className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6">
            <dt className="font-semibold sm:w-32">Alamat</dt>
            <dd className="text-teks-lembut">{toko.alamat}</dd>
          </div>
          <div className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6">
            <dt className="font-semibold sm:w-32">Jam buka</dt>
            <dd className="text-teks-lembut">{toko.jamBuka}</dd>
          </div>
          <div className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6">
            <dt className="font-semibold sm:w-32">WhatsApp</dt>
            <dd className="text-teks-lembut">+{nomor}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap"
        >
          Hubungi via WhatsApp
        </a>
        <a
          href={linkPeta}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-5 py-3 font-semibold text-teks hover:border-utama hover:text-utama"
        >
          Lihat di peta
        </a>
        <Tombol href="/" varian="garis" className="py-3">
          Lihat katalog
        </Tombol>
      </div>
    </div>
  );
}
