import type { Settings } from "./types";

/** Calcula frete e desconto do pedido a partir das configurações da loja. */
export function computeTotals(
  settings: Settings,
  subtotal: number,
  method: "pix" | "card",
) {
  const freeByValue =
    settings.free_shipping_min_cents > 0 && subtotal >= settings.free_shipping_min_cents;
  const freeByPix = method === "pix" && settings.pix_free_shipping;
  const shipping = freeByValue || freeByPix ? 0 : settings.flat_shipping_cents;
  const discount =
    method === "pix" ? Math.round((subtotal * settings.pix_discount_percent) / 100) : 0;
  return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}
