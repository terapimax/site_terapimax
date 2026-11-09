"use client";
import { useSearchParams } from "next/navigation";

export default function Flash() {
  const erro = useSearchParams().get("erro");
  if (!erro) return null;
  return <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700" role="alert">{erro}</p>;
}
