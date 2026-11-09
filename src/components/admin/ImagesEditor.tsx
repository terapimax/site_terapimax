"use client";
import { useState } from "react";

/** Lista de imagens do produto: reordenar, remover e enviar novas. */
export default function ImagesEditor({ initial }: { initial: string[] }) {
  const [imgs, setImgs] = useState(initial);
  const move = (i: number, d: number) =>
    setImgs((a) => {
      const b = [...a];
      const j = i + d;
      if (j < 0 || j >= b.length) return a;
      [b[i], b[j]] = [b[j], b[i]];
      return b;
    });
  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {imgs.map((src, i) => (
          <li key={src} className="relative rounded-lg border bg-gray-50 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="aspect-square w-full object-contain" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 text-[10px] text-white">Capa</span>}
            <input type="hidden" name="images" value={src} />
            <div className="mt-1 flex justify-between text-xs">
              <button type="button" onClick={() => move(i, -1)} aria-label="Mover para a esquerda" className="px-1">◀</button>
              <button type="button" onClick={() => setImgs((a) => a.filter((x) => x !== src))} className="px-1 text-rose-600">Remover</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Mover para a direita" className="px-1">▶</button>
            </div>
          </li>
        ))}
      </ul>
      <label className="mt-3 block text-sm">
        <span className="mb-1 block font-medium">Adicionar imagens</span>
        <input type="file" name="new_images" accept="image/*" multiple className="text-sm" />
      </label>
    </div>
  );
}
