<script setup>
import { computed } from 'vue'

/* Substitui o phInner/phClass/IMAGES da demo.

   Componentes passam a chave lógica ('fachada', 'pilhas'…), nunca o caminho.
   Quando a chave não existe no mapa, entra o placeholder da marca — é o que
   vai acontecer com a maior parte dos ~500 produtos até o Lírio subir as fotos. */

const IMAGES = {
  fachada: '/img/fachada.jfif',
  fachada2: '/img/fachada2.jfif',
  interior: '/img/interior.webp',
  interior2: '/img/interior2.jfif',
  pilhas: '/img/pilhas.webp',
  tabacaria: '/img/tabacaria.webp',
  presente: '/img/presente.webp',
  pessoas: '/img/pessoas.webp',
  logo: '/img/logo.png',
}

const props = defineProps({
  imageKey: { type: String, default: '' },
  label: { type: String, default: 'Lírio Pimenta' },
  icon: { type: String, default: 'camera' },
  tint: { type: Boolean, default: false },
})

const src = computed(() => IMAGES[props.imageKey] || '')
</script>

<template>
  <div class="ph" :class="{ svgph: !src, tint: !src && tint }">
    <img v-if="src" :src="src" :alt="`${label} — Lírio Pimenta`" loading="lazy" >
    <div v-else class="ph-inner">
      <AppIcon :name="icon" class="ph-glyph" />
      <div class="ph-label">{{ label }}</div>
      <div class="ph-note">Foto real da loja</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ph {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s var(--ease);
  }
}

.ph.svgph {
  background: radial-gradient(120% 120% at 20% 10%, #2a86bd 0%, var(--blue-700) 42%, var(--blue-900) 100%);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.14;
    background-image: radial-gradient(#fff 1px, transparent 1.4px);
    background-size: 16px 16px;
  }
}

.ph.tint {
  background: radial-gradient(120% 120% at 80% 0%, #fbe08a 0%, var(--gold-500) 45%, var(--gold-600) 100%);

  .ph-inner {
    color: #5c4207;
  }
}

.ph-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #eaf4fb;
  padding: 18px;
}

.ph-glyph {
  width: 34px;
  height: 34px;
  opacity: 0.9;
  margin: 0 auto 8px;
}

.ph-label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.ph-note {
  font-size: 0.7rem;
  opacity: 0.72;
  margin-top: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
