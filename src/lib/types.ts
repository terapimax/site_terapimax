export type Settings = {
  store_name: string;
  tagline: string;
  topbar_text: string;
  whatsapp: string;
  email: string;
  instagram: string;
  hours: string;
  /** Frete grátis a partir deste subtotal (0 = desligado). */
  free_shipping_min_cents: number;
  /** Frete fixo cobrado quando não há frete grátis. */
  flat_shipping_cents: number;
  pix_discount_percent: number;
  pix_free_shipping: boolean;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

export type ProductOption = { name: string; values: string[] };

export type Product = {
  id?: string;
  slug: string;
  name: string;
  sku: string | null;
  short_description: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  images: string[];
  categories: string[];
  options: ProductOption[];
  in_stock: boolean;
  stock?: number | null;
  is_bestseller: boolean;
  is_new: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  active: boolean;
};

export type Banner = {
  id?: string;
  title: string;
  image_url: string;
  mobile_image_url: string | null;
  link: string;
  sort_order: number;
  active: boolean;
};

export type Page = { slug: string; title: string; content: string; published: boolean };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  published: boolean;
  published_at: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderItem = {
  slug: string;
  name: string;
  image: string | null;
  price_cents: number;
  quantity: number;
  options: Record<string, string>;
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string; cpf: string };
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
  };
  items: OrderItem[];
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  payment_method: string | null;
  payment_id: string | null;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
};
