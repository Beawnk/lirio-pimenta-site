<script setup>
import { ADDRESS } from '~/data/store-info'
</script>

<template>
  <section class="trust">
    <div class="container">
      <div class="trust-grid">
        <div class="trust-item">
          <span class="ic"><IconShield /></span>
          <div><b>Tradição de 40 anos</b><span>Parte da história de Viamão.</span></div>
        </div>
        <div class="trust-item">
          <span class="ic"><IconVariety /></span>
          <div><b>Variedade de verdade</b><span>Presentes, brinquedos e muito mais.</span></div>
        </div>
        <div class="trust-item">
          <span class="ic"><IconWhatsApp /></span>
          <div><b>Atendimento humano</b><span>Fale direto pelo WhatsApp.</span></div>
        </div>
        <div class="trust-item">
          <span class="ic"><IconPin /></span>
          <div><b>No Centro de Viamão</b><span>{{ ADDRESS.street }}.</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.trust {
  background: var(--bg-tint);
  border-block: 1px solid var(--line);
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-4);
  padding: var(--sp-6) 0;
}

.trust-item {
  display: flex;
  gap: 13px;
  align-items: flex-start;

  .ic {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 12px;
    background: #fff;
    display: grid;
    place-items: center;
    color: var(--blue-700);
    box-shadow: var(--sh-1);

    svg {
      width: 22px;
      height: 22px;
    }
  }

  b {
    font-family: var(--font-display);
    font-size: 0.98rem;
    display: block;
  }

  span {
    font-size: 0.85rem;
    color: var(--ink-500);
  }
}

@media (max-width: 1024px) {
  .trust-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .trust-grid {
    grid-template-columns: 1fr;
  }
}
</style>
