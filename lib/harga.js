// US-20: harga diskon. `harga_diskon` kosong atau tidak lebih kecil dari `harga` = tidak diskon.
export function adaDiskon(produk) {
  return produk.harga_diskon != null && produk.harga_diskon < produk.harga;
}

// Harga yang dibayar pembeli.
export function hargaAkhir(produk) {
  return adaDiskon(produk) ? produk.harga_diskon : produk.harga;
}
