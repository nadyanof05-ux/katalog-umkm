"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatKlienAdmin } from "@/lib/supabase/admin";

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

  return {
    produk: {
      nama,
      harga,
      kategori: ambil("kategori") || null,
      foto_url: ambil("foto_url") || null,
      deskripsi: ambil("deskripsi") || null,
    },
  };
}

export async function tambahProduk(prevState, formData) {
  const { supabase, error: errorLogin } = await periksaAdmin();
  if (errorLogin) return { error: errorLogin };

  const { produk, error: errorForm } = bacaFormProduk(formData);
  if (errorForm) return { error: errorForm };

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

export const login = masuk;
export const logout = keluar;
export const ubahPassword = gantiPassword;
