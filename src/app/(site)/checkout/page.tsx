import type { Metadata } from "next";
import CheckoutForm from "./CheckoutForm";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default async function CheckoutPage() {
  return <CheckoutForm settings={await getSettings()} />;
}
