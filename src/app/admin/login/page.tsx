"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(params.get("erro") === "sem-acesso" ? "Este usuário não tem acesso ao painel." : "");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError("E-mail ou senha incorretos.");
    router.replace("/admin");
    router.refresh();
  }

  const input = "w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-lg">
      <Image src="/logo-horizontal.png" alt="Terapimax" width={486} height={108} className="mx-auto h-10 w-auto" />
      <h1 className="text-center text-lg font-semibold">Painel administrativo</h1>
      <input className={input} type="email" required placeholder="E-mail" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={input} type="password" required placeholder="Senha" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white disabled:opacity-60">
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-900 p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
