<template>
  <section id="historia" class="section">
    <div class="container">
      <div class="gift-wrap">
        <div class="gift-media">
          <ProductImage image-key="interior" label="Interior da loja" glyph="🛍️" />
        </div>
        <div>
          <span class="eyebrow">Nossa história</span>
          <h2 class="sec-title">Mais de 40 anos fazendo parte da história de Viamão.</h2>
          <p class="sec-sub">
            A Lírio Pimenta construiu sua história lado a lado com a comunidade de Viamão. Uma loja
            tradicional, conhecida pela variedade, pelo atendimento e por aquele tipo de descoberta
            que só uma loja de verdade proporciona.
          </p>
          <div class="gift-chips">
            <span class="gift-chip">🏪 Loja física no Centro</span>
            <span class="gift-chip">💬 Atendimento próximo</span>
            <span class="gift-chip">🧭 Referência local</span>
          </div>
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

/* Aqui os chips são só rótulos, não têm ação */
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
