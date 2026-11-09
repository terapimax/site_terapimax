# Terapimax: loja nova (sem WordPress)

Loja virtual da Terapimax feita em **Next.js** com **Supabase** (banco, login e imagens) e
**Mercado Pago** (Pix e cartão), pensada para rodar na **Vercel**.

- Vitrine responsiva: home com banners, categorias, busca, página de produto com variações,
  carrinho, checkout com CEP automático, acompanhamento de pedido, páginas institucionais e blog.
- Painel em `/admin`: pedidos (status e código de rastreio), produtos, categorias, banners,
  páginas, blog e configurações (frete, desconto no Pix, WhatsApp, faixa do topo).
- Os endereços dos produtos (`/produto/...`) e categorias (`/categoria/...`) são os mesmos do
  WordPress, e páginas que mudaram de nome redirecionam (veja `next.config.ts`), então o Google
  e links antigos continuam funcionando.

## Colocar no ar (uma vez)

1. **Supabase**: crie um projeto em supabase.com (região São Paulo). No *SQL Editor*, rode
   `supabase/schema.sql`. Em *Authentication → Users*, crie o seu usuário (e-mail e senha).
2. **Importar produtos e fotos** do site atual (no seu computador, com Node 22+):
   ```bash
   npm install
   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
     node scripts/import-to-supabase.mjs --admin seu@email.com.br
   ```
   O `--admin` libera esse e-mail no painel. Para liberar outra pessoa depois:
   `insert into admins (email) values ('pessoa@email.com');` no SQL Editor.
3. **Vercel**: importe este repositório, cole as variáveis do `.env.example` em
   *Settings → Environment Variables* e faça o deploy.
4. **Mercado Pago**: em *Suas integrações*, crie uma aplicação, copie o *Access Token* de
   produção para `MP_ACCESS_TOKEN` e cadastre o webhook
   `https://www.terapimax.com.br/api/mercadopago/webhook` (evento *Pagamentos*). A assinatura
   secreta vai em `MP_WEBHOOK_SECRET`.
5. **Domínio**: depois de testar no endereço `.vercel.app`, adicione `www.terapimax.com.br` e
   `terapimax.com.br` na Vercel (*Settings → Domains*) e troque o DNS como ela indicar.
   Para o blog, adicione também `blog.terapimax.com.br` e redirecione para `/blog`.

Sem as variáveis do Supabase o site abre em **modo demonstração**, lendo `data/seed.json`
(sem checkout e sem painel). Útil para ver o visual.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha
npm run dev                   # http://localhost:3000
```

`data/seed.json` é gerado do export do WooCommerce por `scripts/build-seed.py`.

## Como funciona o pagamento

O checkout cria o pedido no banco (preços sempre recalculados no servidor) e leva o cliente ao
Mercado Pago. Quando o pagamento é aprovado, o Mercado Pago avisa o webhook, que confere o
pagamento direto na API dele e marca o pedido como **Pago**. A partir daí você muda o status
no painel (Em separação → Enviado com código de rastreio → Entregue).

## Frete

Por enquanto o frete é configurado no painel: valor fixo, frete grátis acima de um valor e/ou
frete grátis no Pix. Cálculo por CEP (Melhor Envio / Correios) é o próximo passo.
