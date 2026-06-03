# youshimagine — Ahmet Emin Turgut

Tek sayfa ressam portfolyosu. Hero (3'lü crossfade) → Selected Works (masonry + lightbox + medyum/tema filtreleri) → About → Contact. TR/EN.

## Stack

AzuraGo standartı:

- **Next.js 16** + React 19 + TypeScript
- **Tailwind v4** (CSS-first config, `globals.css` üzerinden)
- **Resend** (iletişim formu bildirim mailleri)
- **Vercel** (deploy hedefi)

Bu site tek sayfa olduğu için Supabase admin paneli ve çok dilli CMS yok — içerik kodda statik (`src/lib/works.ts` + `src/lib/content.ts`).

## Geliştirme

```bash
cp .env.example .env.local
# .env.local → Resend key + INQUIRY_NOTIFY_TO doldur
npm install
npm run dev
```

http://localhost:3000

## Yapı

```
youshimagine-website/
├── config/customer.json     # marka renkleri, iletişim, deployment
├── public/portfolio/        # eserlerin PNG'leri (abs-*, drk-*, flo-*, mar-*, ott-*)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # font yüklemeleri + metadata
│   │   ├── page.tsx         # tek sayfa: Hero/Works/About/Contact
│   │   ├── globals.css      # design tokens + motion CSS
│   │   └── api/inquiry/     # Resend bildirim endpoint
│   ├── components/site/     # TopNav, Hero, WorksSection, About, Contact, Lightbox, Footer
│   └── lib/
│       ├── works.ts         # 31 eserin verisi (bilingual)
│       ├── content.ts       # UI string'leri (TR/EN)
│       └── motion.ts        # vanilla motion helpers (magnetic, reveal observer)
└── legacy/
    ├── prototype/           # Claude Design'dan gelen orijinal HTML+JSX prototip
    ├── raw/                 # eserlerin işlenmemiş ham screenshot'ları
    └── screenshots/         # check'ler ve hero variant'ları
```

## Yeni eser ekleme

1. PNG'yi `public/portfolio/<id>.png` olarak ekle (örn. `ott-08.png`)
2. `src/lib/works.ts`'e yeni entry — `id`, `title.tr/en`, `year`, `medium.tr/en`, `dimensions`, `theme`, `mediumKey`, `w`, `h` (gerçek piksel), `image`, `note.tr/en`, `ph` (fallback iki tonlu palet)

## Deploy

Vercel'e bağla, env değişkenlerini ekle (`RESEND_API_KEY`, `INQUIRY_NOTIFY_TO`, `RESEND_FROM`, `NEXT_PUBLIC_SITE_URL`). Custom domain → `youshimagine.com`.
