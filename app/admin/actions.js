"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKlienAdmin } from "@/lib/supabase/admin";
import { buatKlienPublik } from "@/lib/supabase/publik";
import {
  daftarFoto,
  FOTO_MAKS,
  periksaFile,
  UKURAN_UNGGAH_MAKS,
} from "@/lib/foto";

export async function masuk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get ? data.get("email")?.toString()?.trim() : "";
  const password = data?.get ? data.get("password")?.toString() : "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKlienAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKlienAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get ? data.get("password_baru")?.toString() : "";
  const konfirmasi = data?.get ? data.get("konfirmasi_password")?.toString() : "";

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasi) {
    return { error: "Password baru dan konfirmasi password harus sama." };
  }

  const supabase = await buatKlienAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi telah berakhir atau Anda belum login. Silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: "Password berhasil diganti." };
}

// Memeriksa login admin di server. Mengembalikan { supabase } atau { error }.
async function periksaAdmin() {
  const supabase = await buatKlienAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Sesi telah berakhir atau Anda belum login. Silakan login kembali." };
  }

  return { supabase };
}

// Kategori produk harus ada di daftar kategori (US-31). Kosong berarti tanpa kategori.
async function periksaKategoriProduk(supabase, nama) {
  if (!nama) return null;
  const { data } = await supabase.from("kategori").select("id").eq("nama", nama).maybeSingle();
  return data ? null : "Kategori tidak ditemukan. Tambahkan dulu di menu Kategori.";
}

// Membaca dan memvalidasi field produk. Mengembalikan { produk } atau { error }.
function bacaFormProduk(formData) {
  const ambil = (nama) => formData?.get(nama)?.toString()?.trim() ?? "";
  const nama = ambil("nama");
  const harga = Number(ambil("harga"));

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (ambil("harga") === "" || !Number.isInteger(harga) || harga < 0) {
    return { error: "Harga harus berupa bilangan bulat, minimal 0." };
  }

  const teksDiskon = ambil("harga_diskon");
  const hargaDiskon = teksDiskon === "" ? null : Number(teksDiskon);
  if (hargaDiskon !== null && (!Number.isInteger(hargaDiskon) || hargaDiskon < 0)) {
    return { error: "Harga diskon harus berupa bilangan bulat, minimal 0." };
  }
  if (hargaDiskon !== null && hargaDiskon >= harga) {
    return { error: "Harga diskon harus lebih kecil dari harga normal." };
  }

  const badge = ambil("badge") || null;
  if (badge !== null && !["Baru", "Terlaris"].includes(badge)) {
    return { error: "Badge tidak valid." };
  }

  const stok = Number(ambil("stok"));
  if (ambil("stok") === "" || !Number.isInteger(stok) || stok < 0) {
    return { error: "Stok harus berupa bilangan bulat, minimal 0." };
  }

  const foto = daftarFoto(formData?.get("foto_url")?.toString());
  if (foto.length > FOTO_MAKS) {
    return { error: `Foto maksimal ${FOTO_MAKS} link.` };
  }
  if (foto.some((link) => !/^(https?:\/\/|\/)/i.test(link))) {
    return { error: "Setiap link foto harus diawali http://, https://, atau /." };
  }

  return {
    produk: {
      nama,
      harga,
      stok,
      harga_diskon: hargaDiskon,
      badge,
      kategori: ambil("kategori") || null,
      foto_url: foto.length ? foto.join("\n") : null,
      deskripsi: ambil("deskripsi") || null,
    },
  };
}

// US-29: unggah foto ke Supabase Storage dari server.
// Memakai kunci server (SUPABASE_SECRET_KEY) setelah login admin diperiksa; kunci tidak sampai ke browser.
const BUCKET_FOTO = "foto-produk";

// Mengenali tipe gambar dari isi file (bukan hanya dari nama atau tipe yang dikirim browser).
function tipeDariIsi(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { tipe: "image/jpeg", ekstensi: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { tipe: "image/png", ekstensi: "png" };
  }
  const kepala = String.fromCharCode(...bytes.slice(0, 4)) + String.fromCharCode(...bytes.slice(8, 12));
  if (kepala === "RIFFWEBP") return { tipe: "image/webp", ekstensi: "webp" };
  return null;
}

async function pastikanBucket(storage) {
  const { data } = await storage.getBucket(BUCKET_FOTO);
  if (data) return data.public ? null : "Bucket foto-produk di Supabase harus berstatus Public.";

  const { error } = await storage.createBucket(BUCKET_FOTO, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  return error ? "Gagal menyiapkan penyimpanan foto di Supabase." : null;
}

// Mengunggah file "foto_file" dari form dan menambahkan URL-nya ke produk.foto_url.
// Mengembalikan { error } atau {}.
async function unggahFotoProduk(produk, formData) {
  const files = formData
    .getAll("foto_file")
    .filter((f) => f && typeof f !== "string" && f.size > 0);
  if (files.length === 0) return {};

  const linkAda = daftarFoto(produk.foto_url);
  if (linkAda.length + files.length > FOTO_MAKS) {
    return { error: `Foto maksimal ${FOTO_MAKS} per produk (link dan file digabung).` };
  }

  for (const file of files) {
    const pesan = periksaFile(file);
    if (pesan) return { error: pesan };
  }
  if (files.reduce((jumlah, f) => jumlah + f.size, 0) > UKURAN_UNGGAH_MAKS) {
    return { error: "Total ukuran foto terlalu besar. Maksimal 4 MB sekali simpan." };
  }

  const isi = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const jenis = tipeDariIsi(bytes);
    if (!jenis) return { error: `"${file.name}" bukan gambar JPG, PNG, atau WebP yang valid.` };
    isi.push({ bytes, ...jenis });
  }

  const storage = buatKlienPublik().storage;
  const errorBucket = await pastikanBucket(storage);
  if (errorBucket) return { error: errorBucket };

  const urlBaru = [];
  for (const { bytes, tipe, ekstensi } of isi) {
    const jalur = `${crypto.randomUUID()}.${ekstensi}`;
    const { error } = await storage.from(BUCKET_FOTO).upload(jalur, bytes, { contentType: tipe });
    if (error) {
      console.error("Gagal mengunggah foto:", error.message);
      return { error: "Gagal mengunggah foto. Coba lagi." };
    }
    urlBaru.push(storage.from(BUCKET_FOTO).getPublicUrl(jalur).data.publicUrl);
  }

  produk.foto_url = [...linkAda, ...urlBaru].join("\n");
  return {};
}

export async function tambahProduk(prevState, formData) {
  const { supabase, error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const { produk, error: errorForm } = bacaFormProduk(formData);
  if (errorForm) return { error: errorForm };

  const errorKategori = await periksaKategoriProduk(supabase, produk.kategori);
  if (errorKategori) return { error: errorKategori };

  const { error: errorFoto } = await unggahFotoProduk(produk, formData);
  if (errorFoto) return { error: errorFoto };

  const { error } = await supabase.from("produk").insert(produk);

  if (error) {
    return { error: "Gagal menyimpan produk. Coba lagi." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

// Dipakai dengan .bind(null, id) dari halaman ubah.
export async function ubahProduk(id, prevState, formData) {
  const { supabase, error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const idProduk = Number(id);
  if (!Number.isInteger(idProduk) || idProduk <= 0) {
    return { error: "Produk tidak valid." };
  }

  const { produk, error: errorForm } = bacaFormProduk(formData);
  if (errorForm) return { error: errorForm };

  const errorKategori = await periksaKategoriProduk(supabase, produk.kategori);
  if (errorKategori) return { error: errorKategori };

  const { error: errorFoto } = await unggahFotoProduk(produk, formData);
  if (errorFoto) return { error: errorFoto };

  const { data, error } = await supabase
    .from("produk")
    .update(produk)
    .eq("id", idProduk)
    .select("id");

  if (error || !data?.length) {
    return { error: "Gagal menyimpan perubahan. Produk mungkin sudah dihapus." };
  }

  revalidatePath("/");
  revalidatePath(`/produk/${idProduk}`);
  revalidatePath("/admin");
  redirect("/admin");
}

// Dipakai dengan .bind(null, id) dari tombol hapus.
export async function hapusProduk(id, prevState, formData) {
  const { supabase, error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const idProduk = Number(id);
  if (!Number.isInteger(idProduk) || idProduk <= 0) {
    return { error: "Produk tidak valid." };
  }

  const { data, error } = await supabase.from("produk").delete().eq("id", idProduk).select("id");

  if (error || !data?.length) {
    return { error: "Gagal menghapus produk. Produk mungkin sudah dihapus." };
  }

  revalidatePath("/");
  revalidatePath(`/produk/${idProduk}`);
  revalidatePath("/admin");
  return { success: "Produk dihapus." };
}

// US-31: kelola kategori. Semua aksi memeriksa login admin di server.
function bacaNamaKategori(formData) {
  const nama = formData?.get("nama")?.toString()?.replace(/\s+/g, " ").trim() ?? "";
  if (!nama) return { error: "Nama kategori wajib diisi." };
  if (nama.length > 40) return { error: "Nama kategori maksimal 40 karakter." };
  return { nama };
}

const segarkanKategori = () => {
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
};

export async function tambahKategori(prevState, formData) {
  const { supabase, error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const { nama, error: errorNama } = bacaNamaKategori(formData);
  if (errorNama) return { error: errorNama };

  const { error } = await supabase.from("kategori").insert({ nama });
  if (error) {
    return {
      error: error.code === "23505" ? "Kategori itu sudah ada." : "Gagal menambah kategori.",
    };
  }

  segarkanKategori();
  return { success: `Kategori "${nama}" ditambahkan.` };
}

// Dipakai dengan .bind(null, id). Produk yang memakai kategori ini ikut diperbarui.
export async function ubahKategori(id, prevState, formData) {
  const { supabase, error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const idKategori = Number(id);
  if (!Number.isInteger(idKategori) || idKategori <= 0) return { error: "Kategori tidak valid." };

  const { nama, error: errorNama } = bacaNamaKategori(formData);
  if (errorNama) return { error: errorNama };

  const { data: lama } = await supabase
    .from("kategori")
    .select("nama")
    .eq("id", idKategori)
    .maybeSingle();
  if (!lama) return { error: "Kategori tidak ditemukan." };
  if (lama.nama === nama) return { success: "Tidak ada perubahan." };

  const { error } = await supabase.from("kategori").update({ nama }).eq("id", idKategori);
  if (error) {
    return {
      error: error.code === "23505" ? "Kategori itu sudah ada." : "Gagal mengubah kategori.",
    };
  }

  const { error: errorProduk } = await supabase
    .from("produk")
    .update({ kategori: nama })
    .eq("kategori", lama.nama);
  if (errorProduk) {
    // Kembalikan nama lama supaya kategori dan produk tidak berbeda.
    await supabase.from("kategori").update({ nama: lama.nama }).eq("id", idKategori);
    return { error: "Gagal memperbarui produk yang memakai kategori ini. Perubahan dibatalkan." };
  }

  segarkanKategori();
  return { success: `Nama kategori diubah menjadi "${nama}".` };
}

// Dipakai dengan .bind(null, id). Ditolak jika masih dipakai produk.
export async function hapusKategori(id, prevState, formData) {
  const { supabase, error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const idKategori = Number(id);
  if (!Number.isInteger(idKategori) || idKategori <= 0) return { error: "Kategori tidak valid." };

  const { data: kategori } = await supabase
    .from("kategori")
    .select("nama")
    .eq("id", idKategori)
    .maybeSingle();
  if (!kategori) return { error: "Kategori tidak ditemukan." };

  const { count, error: errorHitung } = await supabase
    .from("produk")
    .select("id", { count: "exact", head: true })
    .eq("kategori", kategori.nama);
  if (errorHitung) return { error: "Gagal memeriksa produk yang memakai kategori ini." };
  if (count > 0) {
    return {
      error: `Tidak bisa dihapus: masih dipakai ${count} produk. Pindahkan atau ubah kategori produknya dulu.`,
    };
  }

  const { data, error } = await supabase.from("kategori").delete().eq("id", idKategori).select("id");
  if (error || !data?.length) return { error: "Gagal menghapus kategori." };

  segarkanKategori();
  return { success: "Kategori dihapus." };
}

// US-14: membuat deskripsi produk dengan Gemini API. Dipanggil dari server;
// kunci (GEMINI_API_KEY) tidak pernah dikirim ke browser.
const MODEL_GEMINI = "gemini-2.5-flash";

export async function buatDeskripsi(nama, kategori) {
  const { error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const namaProduk = String(nama ?? "").trim().slice(0, 120);
  const kategoriProduk = String(kategori ?? "").trim().slice(0, 60);

  if (!namaProduk) {
    return { error: "Isi nama produk dulu sebelum membuat deskripsi." };
  }

  const kunci = process.env.GEMINI_API_KEY;
  if (!kunci) {
    return { error: "Fitur AI belum dikonfigurasi (GEMINI_API_KEY belum diisi)." };
  }

  const prompt =
    "Tulis deskripsi produk singkat dalam bahasa Indonesia untuk katalog toko UMKM. " +
    "Maksimal 2 kalimat (sekitar 25 sampai 40 kata), ramah dan menarik, tanpa emoji, tanpa judul, " +
    "dan jangan mengarang fakta spesifik seperti harga, bahan, atau berat yang tidak disebutkan.\n" +
    `Nama produk: ${namaProduk}\n` +
    `Kategori: ${kategoriProduk || "(tidak disebutkan)"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_GEMINI}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": kunci },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } },
        }),
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!res.ok) {
      console.error("Gemini API gagal:", res.status);
      return { error: "Gagal membuat deskripsi. Coba lagi sebentar lagi." };
    }

    const hasil = await res.json();
    const teks = hasil?.candidates?.[0]?.content?.parts
      ?.map((bagian) => bagian.text ?? "")
      .join("")
      .trim();

    if (!teks) {
      return { error: "AI tidak menghasilkan deskripsi. Coba lagi." };
    }

    return { deskripsi: teks };
  } catch (err) {
    console.error("Kesalahan memanggil Gemini API:", err.message);
    return { error: "Gagal menghubungi layanan AI. Coba lagi." };
  }
}

export const login = masuk;
export const logout = keluar;
export const ubahPassword = gantiPassword;
