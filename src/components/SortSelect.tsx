"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Ordenar</span>
      <select
        className="rounded-lg border border-gray-200 bg-white px-3 py-2"
        value={params.get("ordem") ?? "relevance"}
        onChange={(e) => {
          const p = new URLSearchParams(params);
          p.set("ordem", e.target.value);
          router.push(`${pathname}?${p}`);
        }}
      >
        <option value="relevance">Relevância</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="name">Nome</option>
      </select>
    </label>
  );
}
