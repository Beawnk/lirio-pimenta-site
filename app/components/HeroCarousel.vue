<script setup>
import { computed, ref } from 'vue'
import { BANNERS } from '~/data/banners'
import { INSTAGRAM } from '~/data/store-info'
import { useCatalogStore } from '~/stores/catalog'
import { useWhatsApp } from '~/composables/useWhatsApp'

/* O carrossel do topo: o primeiro slide é a apresentação da loja, os
   outros são os serviços. Troca só no clique — nada se mexe sozinho, para
   ninguém perder o slide que estava lendo.

   Todos os slides ficam no HTML (não é v-if): o texto de cada serviço
   precisa existir para o Google e para leitor de tela; quem sai da tela vai
   com `translateX`, não desaparece. */
const catalog = useCatalogStore()
const { waLink } = useWhatsApp()

const current = ref(0)
const total = BANNERS.length

const go = (index) => {
  current.value = (index + total) % total
}
const next = () => go(current.value + 1)
const prev = () => go(current.value - 1)

const trackStyle = computed(() => ({ transform: `translateX(-${current.value * 100}%)` }))

/* Arrastar com o dedo. No celular as setas ficavam por cima do texto do
   slide, então lá elas somem e o gesto vira o controle principal — com as
   abas nomeadas embaixo para quem preferir tocar.

   Só conta como troca de slide se o movimento for claramente horizontal:
   senão, rolar a página para baixo mudaria o slide sem querer. */
const SWIPE_MIN = 45
let startX = null
let startY = null

function onPointerDown(event) {
  startX = event.clientX
  startY = event.clientY
}

function onPointerUp(event) {
  if (startX === null) return

  const dx = event.clientX - startX
  const dy = event.clientY - startY
  startX = null

  if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return

  if (dx < 0) next()
  else prev()
}

const actionHref = (action) => {
  if (action.kind === 'whatsapp') return waLink(action.message)
  if (action.kind === 'anchor') return action.href
  return undefined
}
</script>

<template>
  <section
    class="hero-carousel"
    aria-roledescription="carrossel"
    aria-label="Destaques da Lírio Pimenta"
    @keydown.left="prev()"
    @keydown.right="next()"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="startX = null"
  >
    <div class="track" :style="trackStyle">
      <article
        v-for="(banner, index) in BANNERS"
        :key="banner.id"
        class="slide"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${index + 1} de ${total}: ${banner.label}`"
        :aria-hidden="index !== current"
        :inert="index !== current || undefined"
      >
        <ProductImage :image-key="banner.image" :label="banner.title" icon="store" />
        <div class="overlay" />

        <div class="container inner">
          <span class="eyebrow-tag">{{ banner.eyebrow }}</span>
          <h1 v-if="index === 0">{{ banner.title }}</h1>
          <h2 v-else>{{ banner.title }}</h2>
          <p class="sub">{{ banner.text }}</p>

          <div class="actions">
            <template v-for="action in banner.actions" :key="action.label">
              <button
                v-if="action.kind === 'category'"
                class="btn"
                :class="action.style === 'wa' ? 'btn-wa' : 'btn-gold'"
                @click="catalog.selectCategory(action.category)"
              >
                {{ action.label }}
                <IconArrowRight class="ic" />
              </button>
              <a
                v-else
                :href="actionHref(action)"
                :target="action.kind === 'whatsapp' ? '_blank' : undefined"
                :rel="action.kind === 'whatsapp' ? 'noopener' : undefined"
                class="btn"
                :class="action.style === 'wa' ? 'btn-wa' : 'btn-gold'"
              >
                <IconWhatsApp v-if="action.kind === 'whatsapp'" class="ic" />
                {{ action.label }}
                <IconArrowRight v-if="action.kind === 'anchor'" class="ic" />
              </a>
            </template>
          </div>

          <a
            v-if="banner.instagram"
            :href="INSTAGRAM"
            target="_blank"
            rel="noopener"
            class="hero-ig"
          >
            <IconInstagram class="ic" />
            Ver novidades no Instagram
            <IconArrowRight class="ic" />
          </a>
        </div>
      </article>
    </div>

    <!-- Setas e abas no mesmo grupo, centralizados: nas laterais a seta
         cobria o título, e no canto direito ela caía embaixo do botão
         flutuante do WhatsApp. As abas levam o nome do serviço porque, sem
         isso, quem não clicar nunca descobre que existe conserto de relógio
         ou caneca personalizada.

         O nome da classe é slide-tab, e não dot: .dot já existe global, é a
         bolinha de "aberto agora" do horário, e os 8px dela esmagavam o
         chip inteiro. -->
    <div class="controls">
      <button class="arrow prev" aria-label="Destaque anterior" @click="prev()"><IconChevronLeft /></button>

      <div class="slide-tabs">
        <button
          v-for="(banner, index) in BANNERS"
          :key="banner.id"
          class="slide-tab"
          :class="{ active: index === current }"
          :aria-current="index === current"
          :aria-label="`Ver destaque: ${banner.label}`"
          @click="go(index)"
        >
          {{ banner.label }}
        </button>
      </div>

      <button class="arrow next" aria-label="Próximo destaque" @click="next()"><IconChevronRight /></button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero-carousel {
  position: relative;
  overflow: hidden;
  min-height: min(88vh, 720px);
  display: flex;
}

.track {
  display: flex;
  width: 100%;
  transition: transform 0.55s var(--ease);
}

.slide {
  position: relative;
  flex: 0 0 100%;
  display: flex;
  align-items: flex-end;
  min-height: min(88vh, 720px);

  :deep(.ph) {
    position: absolute;
    inset: 0;
    height: 100%;
  }

  :deep(.ph img) {
    object-position: center 34%;
  }

  /* Sobre a foto já vem o texto do slide — o rótulo do placeholder some */
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

.overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  /* Duas camadas: um tom azul da marca sobre a foto inteira, e por cima um
     scrim escuro que nasce no fim do texto e escurece até a base — cobre
     toda a faixa onde há título/legenda, em vez de afinar bem onde o h1
     começa (o problema anterior). O alfa mínimo do scrim é ~0.55: abaixo
     disso, texto branco sobre o pixel mais claro possível da foto não bate
     4.5:1 de contraste. */
  background:
    linear-gradient(180deg, rgba(10, 60, 92, 0.32) 0%, rgba(10, 60, 92, 0.18) 100%),
    linear-gradient(
      to top,
      rgba(6, 22, 34, 0.86) 0%,
      rgba(6, 22, 34, 0.6) 45%,
      rgba(6, 22, 34, 0) 100%
    );
}

.inner {
  position: relative;
  z-index: 3;
  width: 100%;
  padding-bottom: calc(var(--sp-9) + 34px);
  color: #fff;
}

.eyebrow-tag {
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

h1,
h2 {
  font-size: clamp(2.1rem, 5.6vw, 4rem);
  font-weight: 800;
  color: #fff;
  max-width: 15ch;
  text-shadow: 0 2px 30px rgba(0, 20, 35, 0.4);
}

.sub {
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 46ch;
  margin-top: var(--sp-4);
  color: #e7f1f8;
}

.actions {
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

  &:hover {
    color: var(--gold-500);
  }
}

.ic {
  width: 18px;
  height: 18px;
}

.controls {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: var(--sp-5);
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
  /* Sem o max-content, a caixa absoluta encolhe e espreme os chips */
  width: max-content;
  max-width: calc(100% - 32px);
}

.arrow {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--ink-900);

  svg {
    width: 20px;
    height: 20px;
  }
  display: grid;
  place-items: center;
  box-shadow: var(--sh-2);
  transition: 0.2s var(--ease);

  &:hover {
    background: #fff;
    transform: scale(1.06);
  }
}

.slide-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.slide-tab {
  flex-shrink: 0;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.78rem;
  color: #eaf4fb;
  background: rgba(8, 30, 46, 0.45);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  padding: 7px 14px;
  border-radius: var(--r-pill);
  transition: background-color 0.2s var(--ease), border-color 0.2s var(--ease);

  &:hover {
    border-color: var(--gold-500);
  }

  &.active {
    background: var(--gold-500);
    border-color: var(--gold-500);
    color: var(--ink-900);
  }
}

@media (max-width: 900px) {
  .arrow {
    width: 40px;
    height: 40px;

    svg {
      width: 17px;
      height: 17px;
    }
  }
}

/* No celular não sobra canto livre: a seta some e o controle passa a ser o
   gesto de arrastar, mais as abas nomeadas. */
@media (max-width: 640px) {
  .arrow {
    display: none;
  }
}

@media (max-width: 640px) {
  .hero-carousel,
  .slide {
    min-height: 84vh;
  }

  /* Só o slide da loja (sempre o primeiro, ver banners.js) — os outros usam
     fotos de interior/produto onde o enquadramento padrão já funciona. */
  .slide:first-child :deep(.ph img) {
    object-position: 62% 12%;
  }

  .inner {
    padding-bottom: calc(var(--sp-8) + 58px);
  }

  .actions {
    flex-direction: column;
    align-items: stretch;

    .btn {
      width: 100%;
    }
  }

  .controls {
    width: 100%;
    max-width: 100%;
  }

  .slide-tabs {
    /* No celular a fila de nomes rola de lado em vez de quebrar linha */
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding-inline: 16px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

}
</style>
