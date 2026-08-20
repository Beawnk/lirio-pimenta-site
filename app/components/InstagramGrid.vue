<script setup>
import { INSTAGRAM } from '~/data/store-info'

/* Grade de destaques: por enquanto são fotos da própria loja, não o feed real.
   Integrar o Instagram de verdade não está no escopo da Fase A. */
const CELLS = [
  { image: 'fachada', glyph: '🏪' },
  { image: 'pilhas', glyph: '🔋' },
  { image: 'tabacaria', glyph: '🚬' },
  { image: 'presente', glyph: '🎁' },
  { image: 'interior', glyph: '🛍️' },
  { image: 'pessoas', glyph: '👋' },
  { image: 'fachada2', glyph: '🏬' },
  { image: 'interior2', glyph: '🧸' },
]
</script>

<template>
  <section id="instagram" class="section section--soft">
    <div class="container">
      <div v-reveal class="ig-head reveal">
        <div class="sec-head">
          <span class="eyebrow">Destaques da loja</span>
          <h2 class="sec-title">O que está chegando na Lírio Pimenta?</h2>
          <p class="sec-sub">
            Novidades, reposições, produtos e oportunidades aparecem primeiro nas nossas redes.
          </p>
        </div>
        <a :href="INSTAGRAM" target="_blank" rel="noopener" class="btn btn-primary">
          <IconInstagram class="btn-ic" />
          Seguir no Instagram
        </a>
      </div>

      <div class="ig-grid">
        <a
          v-for="(cell, i) in CELLS"
          :key="i"
          class="ig-cell"
          :href="INSTAGRAM"
          target="_blank"
          rel="noopener"
          aria-label="Ver no Instagram"
        >
          <ProductImage :image-key="cell.image" label="Destaque" :glyph="cell.glyph" />
          <span class="ig-ov"><IconInstagram /></span>
        </a>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.ig-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: var(--sp-6);

  .sec-head {
    margin-bottom: 0;
  }
}

.ig-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.ig-cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--r-md);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--sh-1);

  :deep(.ph) {
    position: absolute;
    inset: 0;
  }

  &:hover :deep(.ph img) {
    transform: scale(1.08);
  }

  /* Sem foto real, a célula fica só com o degradê da marca */
  :deep(.ph.svgph .ph-inner) {
    opacity: 0.5;
  }

  :deep(.ph.svgph .ph-note),
  :deep(.ph.svgph .ph-label) {
    display: none;
  }

  &:hover .ig-ov {
    background: rgba(10, 60, 92, 0.55);
    opacity: 1;
  }
}

.ig-ov {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  color: #fff;
  opacity: 0;
  transition: 0.25s;

  svg {
    width: 30px;
    height: 30px;
  }
}

.btn-ic {
  width: 18px;
  height: 18px;
}

@media (max-width: 1024px) {
  .ig-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .ig-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
