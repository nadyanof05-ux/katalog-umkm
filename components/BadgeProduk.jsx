// US-20: label "Baru" atau "Terlaris" dari kolom `badge`.
export default function BadgeProduk({ badge, className = "" }) {
  if (badge !== "Baru" && badge !== "Terlaris") return null;

  return (
    <span
      className={`inline-block rounded-md bg-utama px-2 py-0.5 text-xs font-bold text-white ${className}`}
    >
      {badge}
    </span>
  );
}
