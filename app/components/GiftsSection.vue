<script setup>
import { GIFT_CHIPS } from '~/data/categories'
import { useCatalogStore } from '~/stores/catalog'

const catalog = useCatalogStore()
</script>

<template>
  <section id="presentes" class="section section--tint">
    <div class="container">
      <div class="gift-wrap">
        <div>
          <span class="eyebrow">Encontrou o presente?</span>
          <h2 class="sec-title">Aquele presente que combina com cada pessoa.</h2>
          <p class="sec-sub">
            Tem aniversário, lembrança, amigo secreto ou simplesmente vontade de presentear? Explore
            nossas opções e encontre o presente certo.
          </p>

          <div class="gift-chips">
            <button
              v-for="chip in GIFT_CHIPS"
              :key="chip.label"
              type="button"
              class="gift-chip"
              @click="catalog.selectCategory(chip.category)"
            >
              {{ chip.emoji }} {{ chip.label }}
            </button>
          </div>

          <button type="button" class="btn btn-primary ver" @click="catalog.selectCategory('Presentes')">
            Ver presentes
            <IconArrowRight class="btn-ic" />
          </button>
        </div>

        <div class="gift-media">
          <ProductImage image-key="presente" label="Presentes" glyph="🎁" tint />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.gift-wrap {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 36px;
  align-items: center;
}

.sec-title {
  margin-top: 10px;
}

.gift-media {
  border-radius: var(--r-xl);
  overflow: hidden;
  aspect-ratio: 4 / 3;
  box-shadow: var(--sh-3);
}

.gift-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.gift-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 17px;
  border-radius: var(--r-pill);
  background: #fff;
  border: 1.6px solid var(--line);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9rem;
  transition: 0.2s;
  cursor: pointer;

  &:hover {
    border-color: var(--gold-500);
    background: var(--gold-100);
    transform: translateY(-2px);
  }
}

.ver {
  margin-top: 24px;
}

.btn-ic {
  width: 18px;
  height: 18px;
}

@media (max-width: 900px) {
  .gift-wrap {
    grid-template-columns: 1fr;
  }

  .gift-media {
    order: -1;
  }
}
</style>
