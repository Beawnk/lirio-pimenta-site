<template>
  <div>
    <span id="top" />

    <HeroSection />
    <CategoryBar />
    <TrustStrip />
    <CategoryGrid />

    <!-- Novidades e catálogo entram na etapa do catálogo: as duas seções
         usam o mesmo ProductCard, então saem juntas. -->
    <section id="novidades" class="section section--soft" />

    <DiscoverSection />

    <section id="catalogo" class="section" />

    <GiftsSection />
    <HistorySection />
    <StoreSection />
    <InstagramGrid />
    <WhatsAppBand />
  </div>
</template>
