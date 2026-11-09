import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <h1 className="mt-3 text-xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-muted">O endereço pode ter mudado com o novo site.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">Ir para a página inicial</Link>
    </div>
  );
}
