import IsiKeranjang from "@/components/IsiKeranjang";

export const metadata = { title: "Keranjang" };

export default function HalamanKeranjang() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-extrabold">Keranjang</h1>
      <IsiKeranjang />
    </div>
  );
}
