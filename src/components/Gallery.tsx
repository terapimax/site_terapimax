"use client";
import Image from "next/image";
import { useState } from "react";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return <div className="aspect-square rounded-2xl bg-gray-100" />;
  return (
    <div className="flex min-w-0 flex-col gap-3 md:flex-row-reverse">
      <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
        <Image src={images[i]} alt={name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-3" />
      </div>
      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto md:max-h-[520px] md:w-20 md:flex-col md:overflow-y-auto">
          {images.map((src, idx) => (
            <li key={src} className="shrink-0">
              <button
                onClick={() => setI(idx)}
                aria-label={`Ver imagem ${idx + 1}`}
                className={`relative block h-16 w-16 overflow-hidden rounded-lg bg-white ring-2 md:h-20 md:w-20 ${idx === i ? "ring-brand-500" : "ring-transparent"}`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
