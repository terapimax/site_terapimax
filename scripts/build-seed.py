"""Converte o export do WooCommerce (JSON da Store API / WP REST) em data/seed.json.

Uso: python3 -I scripts/build-seed.py <pasta-do-export> data/seed.json
A pasta precisa ter products.json, categories.json e pages_full.json.
"""
import html
import json
import re
import sys
from pathlib import Path

src = Path(sys.argv[1])
out = Path(sys.argv[2])

products = json.loads((src / "products.json").read_text())
categories = json.loads((src / "categories.json").read_text())
pages = json.loads((src / "pages_full.json").read_text())

# Categorias usadas só pelo tema antigo, sem sentido na loja nova.
SKIP_CATS = {"pagina-inicial", "sem-categoria", "acessorios-vendidos"}
# Categorias que viram selos/coleções na home em vez de departamentos.
COLLECTIONS = {"mais-vendidos": "bestseller", "novidades": "new"}


def clean_text(s: str) -> str:
    return html.unescape(re.sub(r"\s+", " ", s or "")).strip()


def clean_html(s: str) -> str:
    s = html.unescape(s or "")
    # Remove atributos de layout do Elementor; o sanitize no site faz o resto.
    s = re.sub(r'\s(class|style|id|data-[\w-]+)="[^"]*"', "", s)
    s = re.sub(r"<(div|span|section)>\s*", "", s)
    s = re.sub(r"\s*</(div|span|section)>", "", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    return s.strip()


cats_out = []
for i, c in enumerate(categories):
    if c["slug"] in SKIP_CATS or c["slug"] in COLLECTIONS:
        continue
    cats_out.append({
        "slug": c["slug"],
        "name": clean_text(c["name"]),
        "description": clean_text(c.get("description", "")),
        "image_url": (c.get("image") or {}).get("src"),
        "sort_order": i,
    })
cat_slugs = {c["slug"] for c in cats_out}

prods_out = []
for p in products:
    slugs = [c["slug"] for c in p["categories"]]
    price = int(p["prices"]["price"])
    regular = int(p["prices"]["regular_price"] or price)
    options = [
        {"name": a["name"], "values": [t["name"] for t in a["terms"]]}
        for a in p.get("attributes", [])
        if a.get("has_variations")
    ]
    prods_out.append({
        "slug": p["slug"],
        "name": clean_text(p["name"]),
        "sku": p.get("sku") or None,
        "short_description": clean_html(p.get("short_description", "")),
        "description": clean_html(p.get("description", "")),
        "price_cents": price,
        "compare_at_cents": regular if regular > price else None,
        "images": [img["src"] for img in p.get("images", [])],
        # No WooCommerce os suplementos ficaram sem categoria; agrupa em "suplementos".
        "categories": [s for s in slugs if s in cat_slugs] or ["suplementos"],
        "options": options,
        "in_stock": bool(p.get("is_in_stock", True)),
        "is_bestseller": "mais-vendidos" in slugs,
        "is_new": "novidades" in slugs,
        "is_featured": "pagina-inicial" in slugs,
        "rating": float(p.get("average_rating") or 0),
        "review_count": int(p.get("review_count") or 0),
        "active": True,
    })

KEEP_PAGES = {
    "sobre-nos": "sobre-nos",
    "contato": "contato",
    "pagina-perguntas-frequentes-faq": "perguntas-frequentes",
    "politica-de-privacidade": "politica-de-privacidade",
    "politica-de-reembolso": "politica-de-reembolso",
    "pagina-politicas-de-troca-e-devolucao": "trocas-e-devolucoes",
    "politicas-de-frete": "politica-de-frete",
    "termos-de-servico": "termos-de-servico",
    "politica-de-cookies": "politica-de-cookies",
    "aviso-legal": "aviso-legal",
}
pages_out = []
for pg in pages:
    if pg["slug"] in KEEP_PAGES:
        pages_out.append({
            "slug": KEEP_PAGES[pg["slug"]],
            "title": clean_text(pg["title"]["rendered"]),
            "content": clean_html(pg["content"]["rendered"]),
            "published": True,
        })

WP = "https://terapimax.com.br/wp-content/uploads/2021/10/"
seed = {
    "settings": {
        "store_name": "Terapimax",
        "tagline": "Cuide do seu corpo, você mora nele.",
        "topbar_text": "PAGUE NO PIX E GANHE FRETE GRÁTIS",
        "whatsapp": "5511916109651",
        "email": "suporte@terapimax.com.br",
        "instagram": "https://www.instagram.com/terapimax_/",
        "hours": "Seg. a Sex. das 09:00 às 18:00",
        "free_shipping_min_cents": 0,
        "flat_shipping_cents": 0,
        "pix_discount_percent": 0,
        "pix_free_shipping": True,
    },
    "banners": [
        {"title": "Almofada Massageadora", "image_url": WP + "386728_1157672299.jpg",
         "mobile_image_url": WP + "386728_9461774162.jpg", "link": "/produto/almofada-3d-shiatsu-terapimax", "sort_order": 0, "active": True},
        {"title": "Massageador para os pés", "image_url": WP + "386728_9762611721.jpg",
         "mobile_image_url": WP + "386728_6721926157.jpg", "link": "/categoria/massageadores", "sort_order": 1, "active": True},
    ],
    "categories": cats_out,
    "products": prods_out,
    "pages": pages_out,
    "posts": json.loads((out.parent / "blog-posts.json").read_text()) if (out.parent / "blog-posts.json").exists() else [],
}
out.write_text(json.dumps(seed, ensure_ascii=False, indent=1))
print(f"{len(cats_out)} categorias, {len(prods_out)} produtos, {len(pages_out)} páginas -> {out}")
