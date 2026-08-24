<script setup>
import { ADDRESS, MAPS_URL, PHONE, PHONE_LABEL, WHATSAPP_LABEL } from '~/data/store-info'
import { useWhatsApp } from '~/composables/useWhatsApp'

const { waLink } = useWhatsApp()
</script>

<template>
  <section id="loja" class="section store">
    <div class="container">
      <div v-reveal class="sec-head center reveal">
        <span class="eyebrow">Venha conhecer a loja</span>
        <h2 class="sec-title">Passe na loja. Descubra o que chegou.</h2>
      </div>

      <div class="store-wrap">
        <div class="store-media">
          <ProductImage image-key="fachada2" label="Fachada — Lírio Pimenta" icon="store" />
        </div>

        <div class="store-info">
          <h2>Lírio Pimenta</h2>

          <div class="info-row">
            <span class="ic"><IconPin /></span>
            <div>
              <b>Endereço</b>
              <span>{{ ADDRESS.full }}</span>
            </div>
          </div>

          <div class="info-row">
            <span class="ic"><IconPhone /></span>
            <div>
              <b>Telefones</b>
              <span>
                <a :href="`tel:${PHONE}`">{{ PHONE_LABEL }}</a> ·
                <a :href="waLink()" target="_blank" rel="noopener">{{ WHATSAPP_LABEL }}</a>
              </span>
            </div>
          </div>

          <StoreHours />

          <div class="store-cta">
            <a :href="MAPS_URL" target="_blank" rel="noopener" class="btn btn-primary">
              <IconPin class="btn-ic" />
              Como chegar
            </a>
            <a :href="waLink()" target="_blank" rel="noopener" class="btn btn-ghost">
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.store {
  background: var(--bg-soft);
}

.store-wrap {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: var(--sh-3);
  background: #fff;
}

.store-media {
  position: relative;
  min-height: 380px;

  :deep(.ph) {
    position: absolute;
    inset: 0;
  }

  :deep(.ph.svgph .ph-inner) {
    opacity: 0.6;
  }
}

.store-info {
  padding: clamp(28px, 4vw, 48px);
  display: flex;
  flex-direction: column;
  justify-content: center;

  h2 {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 800;
  }
}

.info-row {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid var(--line);

  .ic {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 11px;
    background: var(--blue-100);
    display: grid;
    place-items: center;
    color: var(--blue-700);

    svg {
      width: 20px;
      height: 20px;
    }
  }

  b {
    font-family: var(--font-display);
    font-size: 0.95rem;
    display: block;
  }

  span {
    font-size: 0.88rem;
    color: var(--ink-500);
  }

  a {
    color: var(--blue-700);
    font-weight: 500;
  }
}

.store-cta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn-ic {
  width: 18px;
  height: 18px;
}

@media (max-width: 900px) {
  .store-wrap {
    grid-template-columns: 1fr;
  }

  .store-media {
    min-height: 260px;

    /* Corte padrão (centro) mostra parede e pouco da fachada de verdade;
       aqui desce o enquadramento pra pegar a placa inteira e a vitrine. */
    :deep(.ph img) {
      object-position: center 80%;
    }
  }
}
</style>
