"use client";
import { useEffect, useRef, useState } from "react";

const TOOLS: { cmd: string; arg?: string; label: string; title: string }[] = [
  { cmd: "bold", label: "B", title: "Negrito" },
  { cmd: "italic", label: "I", title: "Itálico" },
  { cmd: "formatBlock", arg: "H2", label: "Título", title: "Título" },
  { cmd: "formatBlock", arg: "H3", label: "Subtítulo", title: "Subtítulo" },
  { cmd: "formatBlock", arg: "P", label: "Texto", title: "Parágrafo normal" },
  { cmd: "insertUnorderedList", label: "• Lista", title: "Lista" },
  { cmd: "insertOrderedList", label: "1. Lista", title: "Lista numerada" },
];

/** Editor de texto simples: grava o HTML num campo escondido do formulário. */
export default function RichEditor({ name, defaultValue = "", minHeight = 220 }: { name: string; defaultValue?: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);
  const [source, setSource] = useState(false);

  useEffect(() => {
    if (ref.current && !source) ref.current.innerHTML = html;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    setHtml(ref.current?.innerHTML ?? "");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-1.5">
        {!source &&
          TOOLS.map((t) => (
            <button key={t.title} type="button" title={t.title} onClick={() => exec(t.cmd, t.arg)} className="rounded px-2 py-1 text-xs font-semibold hover:bg-white">
              {t.label}
            </button>
          ))}
        {!source && (
          <>
            <button type="button" className="rounded px-2 py-1 text-xs font-semibold hover:bg-white" onClick={() => { const u = prompt("Endereço do link:"); if (u) exec("createLink", u); }}>Link</button>
            <button type="button" className="rounded px-2 py-1 text-xs font-semibold hover:bg-white" onClick={() => { const u = prompt("Endereço da imagem (URL):"); if (u) exec("insertImage", u); }}>Imagem</button>
          </>
        )}
        <button type="button" onClick={() => setSource((v) => !v)} className="ml-auto rounded px-2 py-1 text-xs text-muted hover:bg-white">
          {source ? "Voltar ao editor" : "Ver HTML"}
        </button>
      </div>
      {source ? (
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} className="block w-full p-3 font-mono text-xs outline-none" style={{ minHeight }} />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={() => setHtml(ref.current?.innerHTML ?? "")}
          className="prose-content p-3 text-sm outline-none"
          style={{ minHeight }}
        />
      )}
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
