import { IconWhatsApp } from "./icons";

export default function WhatsAppButton({ number }: { number: string }) {
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Olá! Vim pelo site da Terapimax.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-105 md:bottom-6 md:right-6"
    >
      <IconWhatsApp /> <span className="hidden sm:inline">Atendimento</span>
    </a>
  );
}
