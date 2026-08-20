<script setup>
import { INSTAGRAM } from '~/data/store-info'
import { useWhatsApp } from '~/composables/useWhatsApp'

const { greetingLink } = useWhatsApp()
</script>

<template>
  <section class="hero" aria-label="Boas-vindas">
    <ProductImage image-key="fachada" label="Fachada da loja" glyph="🏪" />
    <div class="hero-overlay" />

    <div class="container hero-inner">
      <span class="tag40">✦ Mais de 40 anos ao lado de Viamão</span>
      <h1>Há mais de 40 anos ao lado de Viamão.</h1>
      <p class="hero-sub">
        Uma loja de variedades, presentes e descobertas para todos os momentos. Tudo que você
        procura, em um só lugar.
      </p>

      <div class="hero-cta">
        <a href="#catalogo" class="btn btn-gold">
          Explorar produtos
          <IconArrowRight class="btn-ic" />
        </a>
        <a :href="greetingLink()" target="_blank" rel="noopener" class="btn btn-wa">
          <IconWhatsApp class="btn-ic" />
          Falar pelo WhatsApp
        </a>
      </div>

      <a :href="INSTAGRAM" target="_blank" rel="noopener" class="hero-ig">
        <IconInstagram class="btn-ic" />
        Ver novidades no Instagram →
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  min-height: min(88vh, 720px);
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  :deep(.ph) {
    position: absolute;
    inset: 0;
    height: 100%;
  }

  :deep(.ph img) {
    object-position: center 34%;
  }

  /* Sobre a foto já existe o texto do hero — o rótulo do placeholder vai discreto */
  :deep(.ph.svgph .ph-inner) {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 18px;
    opacity: 0.42;
  }

  :deep(.ph.svgph .ph-glyph) {
    display: none;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(10, 60, 92, 0.28) 0%,
    rgba(10, 60, 92, 0.12) 40%,
    rgba(8, 30, 46, 0.82) 100%
  );
}

.hero-inner {
  position: relative;
  z-index: 3;
  width: 100%;
  padding-bottom: var(--sp-9);
  color: #fff;
}

.tag40 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 197, 66, 0.95);
  color: #4a3600;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  padding: 8px 15px;
  border-radius: var(--r-pill);
  margin-bottom: var(--sp-4);
}

h1 {
  font-size: clamp(2.1rem, 5.6vw, 4rem);
  font-weight: 800;
  color: #fff;
  max-width: 15ch;
  text-shadow: 0 2px 30px rgba(0, 20, 35, 0.4);
}

.hero-sub {
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 46ch;
  margin-top: var(--sp-4);
  color: #e7f1f8;
  font-weight: 400;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: var(--sp-6);
}

.hero-ig {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: var(--sp-5);
  color: #eaf4fb;
  font-size: 0.92rem;
  font-weight: 500;
  opacity: 0.95;

  &:hover {
    color: var(--gold-500);
  }
}

.btn-ic {
  width: 18px;
  height: 18px;
}

@media (max-width: 640px) {
  .hero {
    min-height: 76vh;
  }

  .hero-cta {
    flex-direction: column;
    align-items: stretch;

    .btn {
      width: 100%;
    }
  }
}
</style>
