"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/types";

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const n = banners.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);
  if (n === 0) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-2 pt-3 md:px-4 md:pt-5" aria-roledescription="carrossel" aria-label="Destaques">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${i * 100}%)` }}>
          {banners.map((b, idx) => (
            <Link key={b.id ?? idx} href={b.link || "/"} className="relative block w-full shrink-0" aria-hidden={idx !== i} tabIndex={idx === i ? 0 : -1}>
              <picture>
                {b.mobile_image_url && <source media="(max-width: 767px)" srcSet={b.mobile_image_url} />}
                <Image
                  src={b.image_url}
                  alt={b.title}
                  width={1920}
                  height={500}
                  priority={idx === 0}
                  sizes="100vw"
                  className="h-auto w-full"
                />
              </picture>
            </Link>
          ))}
        </div>
        {n > 1 && (
          <>
            <button
              aria-label="Anterior"
              onClick={() => setI((v) => (v - 1 + n) % n)}
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-xl shadow md:block"
            >
              ‹
            </button>
            <button
              aria-label="Próximo"
              onClick={() => setI((v) => (v + 1) % n)}
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-xl shadow md:block"
            >
              ›
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Ir para destaque ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-brand-500" : "w-2 bg-gray-300"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
