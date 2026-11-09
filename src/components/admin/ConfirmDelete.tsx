"use client";

export default function ConfirmDelete({
  action,
  fields,
  label = "Excluir",
  message = "Tem certeza que deseja excluir? Isso não pode ser desfeito.",
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string>;
  label?: string;
  message?: string;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <button className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">{label}</button>
    </form>
  );
}
