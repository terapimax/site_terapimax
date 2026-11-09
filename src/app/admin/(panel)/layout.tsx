import type { Metadata } from "next";
import { Suspense } from "react";
import AdminNav from "@/components/admin/AdminNav";
import Flash from "@/components/admin/Flash";
import { requireAdmin } from "@/lib/admin";
import { hasSupabase } from "@/lib/supabase/env";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold">Painel ainda não conectado</h1>
        <p className="mt-3 text-muted">
          Configure as variáveis do Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e
          SUPABASE_SERVICE_ROLE_KEY) na Vercel. O passo a passo está no README do projeto.
        </p>
      </div>
    );
  }
  const { user } = await requireAdmin();
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminNav email={user.email ?? ""} signOut={signOut} />
      <div className="min-w-0 flex-1 p-4 md:p-8">
        <Suspense><Flash /></Suspense>
        {children}
      </div>
    </div>
  );
}
