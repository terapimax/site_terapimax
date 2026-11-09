-- Esquema do banco da loja Terapimax (Supabase / Postgres).
-- Rode uma vez no SQL Editor do Supabase.

create extension if not exists pgcrypto;

-- Quem pode entrar no /admin. Adicione o e-mail do dono aqui depois de criar o usuário em Authentication.
create table if not exists admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  description text not null default '',
  image_url text,
  sort_order int not null default 0
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sku text,
  short_description text not null default '',
  description text not null default '',
  price_cents int not null check (price_cents >= 0),
  compare_at_cents int check (compare_at_cents is null or compare_at_cents >= 0),
  images text[] not null default '{}',
  categories text[] not null default '{}',
  options jsonb not null default '[]'::jsonb,
  in_stock boolean not null default true,
  stock int,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_categories_idx on products using gin (categories);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  image_url text not null,
  mobile_image_url text,
  link text not null default '/',
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists pages (
  slug text primary key,
  title text not null,
  content text not null default '',
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  slug text primary key,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  published boolean not null default false,
  published_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity,
  status text not null default 'pending'
    check (status in ('pending','paid','preparing','shipped','delivered','cancelled','refunded')),
  customer jsonb not null,           -- nome, email, telefone, cpf
  address jsonb not null,            -- cep, rua, número, bairro, cidade, uf, complemento
  items jsonb not null,              -- [{slug, name, price_cents, quantity, options}]
  subtotal_cents int not null,
  shipping_cents int not null default 0,
  discount_cents int not null default 0,
  total_cents int not null,
  payment_method text,
  payment_id text,
  tracking_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Segurança: visitantes só leem o que está publicado; só admins escrevem.
-- Pedidos são criados pelo servidor com a service role (ignora RLS).
alter table admins enable row level security;
alter table settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table banners enable row level security;
alter table pages enable row level security;
alter table posts enable row level security;
alter table orders enable row level security;

create policy "admins read self" on admins for select using (is_admin());

create policy "public read settings" on settings for select using (true);
create policy "admin write settings" on settings for all using (is_admin()) with check (is_admin());

create policy "public read categories" on categories for select using (true);
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());

create policy "public read products" on products for select using (active or is_admin());
create policy "admin write products" on products for all using (is_admin()) with check (is_admin());

create policy "public read banners" on banners for select using (active or is_admin());
create policy "admin write banners" on banners for all using (is_admin()) with check (is_admin());

create policy "public read pages" on pages for select using (published or is_admin());
create policy "admin write pages" on pages for all using (is_admin()) with check (is_admin());

create policy "public read posts" on posts for select using (published or is_admin());
create policy "admin write posts" on posts for all using (is_admin()) with check (is_admin());

create policy "admin read orders" on orders for select using (is_admin());
create policy "admin update orders" on orders for update using (is_admin()) with check (is_admin());

-- Imagens: bucket público "media"; só admins enviam.
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;
create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "admin upload media" on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "admin update media" on storage.objects for update using (bucket_id = 'media' and is_admin());
create policy "admin delete media" on storage.objects for delete using (bucket_id = 'media' and is_admin());
