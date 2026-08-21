<script setup>
import { buildLocalBusinessSchema } from '~/composables/useLocalBusiness'
import { SITE_URL } from '~/data/store-info'

/* SEO local: os mesmos dados de endereço/telefone/horário que já aparecem
   na seção "Onde estamos", só que estruturados para o Google entender sem
   precisar interpretar o HTML. */
useHead({
  // Sem domínio final ainda (ver SITE_URL) — nada de canonical apontando
  // para um subdomínio temporário que vai sumir na virada.
  link: SITE_URL ? [{ rel: 'canonical', href: SITE_URL }] : [],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(buildLocalBusinessSchema()),
    },
  ],
})
</script>

<template>
  <div>
    <span id="top" />

    <HeroCarousel />
    <CategoryBar />
    <TrustStrip />
    <CategoryGrid />

    <NewArrivals />
    <DiscoverSection />
    <CatalogSection />

    <GiftsSection />
    <HistorySection />
    <StoreSection />
    <InstagramGrid />
    <WhatsAppBand />
  </div>
</template>
