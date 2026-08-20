<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useUiStore } from '~/stores/ui'
import { useWhatsApp } from '~/composables/useWhatsApp'

const ui = useUiStore()
const { waLink } = useWhatsApp()

const scrolled = ref(false)
const onScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const NAV = [
  { href: '#categorias', label: 'Categorias' },
  { href: '#novidades', label: 'Novidades' },
  { href: '#catalogo', label: 'Catálogo' },
  { href: '#presentes', label: 'Presentes' },
  { href: '#historia', label: 'Sobre' },
  { href: '#instagram', label: 'Instagram' },
]
</script>

<template>
  <header class="header" :class="{ scrolled }">
    <div class="container header-inner">
      <a href="#top" class="brand" aria-label="Lírio Pimenta — início">
        <span class="brand-mark has-logo">
          <img src="/img/logo.webp" alt="Lírio Pimenta" >
        </span>
        <span class="brand-text">
          <b>Lírio Pimenta</b>
          <span>Vem ver · Viamão/RS</span>
        </span>
      </a>

      <nav class="nav" aria-label="Navegação principal">
        <a v-for="item in NAV" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <div class="header-actions">
        <a href="#catalogo" class="icon-btn search-btn" aria-label="Buscar produtos">
          <IconSearch />
        </a>
        <a
          :href="waLink()"
          target="_blank"
          rel="noopener"
          class="icon-btn wa-btn"
          aria-label="WhatsApp"
        >
          <IconWhatsApp />
        </a>
        <button class="icon-btn" aria-label="Abrir carrinho" @click="ui.open('cart')">
          <IconCart />
          <!-- O contador liga no store do carrinho na etapa do carrinho -->
          <span class="cart-count">0</span>
        </button>
        <button class="icon-btn hamburger" aria-label="Abrir menu" @click="ui.open('menu')">
          <IconMenu />
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 60;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: saturate(1.4) blur(14px);
  border-bottom: 1px solid transparent;
  transition: 0.3s var(--ease);

  &.scrolled {
    box-shadow: var(--sh-2);
    border-bottom-color: var(--line);
    background: rgba(255, 255, 255, 0.96);
  }
}

.header-inner {
  display: flex;
  align-items: center;
  gap: var(--sp-5);
  height: var(--header-h);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  flex-shrink: 0;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--blue-700);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--gold-500);
  font-size: 1.15rem;
  box-shadow: var(--sh-1);
  position: relative;

  &.has-logo {
    background: #fff;
    padding: 0;
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.brand-text {
  line-height: 1;

  b {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.12rem;
    color: var(--ink-900);
    display: block;
  }

  span {
    font-size: 0.66rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--blue-700);
    font-weight: 600;
  }
}

.nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;

  a {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 0.92rem;
    color: var(--ink-700);
    padding: 9px 13px;
    border-radius: var(--r-sm);
    transition: 0.18s;

    &:hover {
      background: var(--bg-soft);
      color: var(--blue-700);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wa-btn {
  color: var(--wa);
}

.cart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  background: var(--red-500);
  color: #fff;
  border-radius: var(--r-pill);
  font-size: 0.68rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  border: 2px solid #fff;
  transform: scale(0);
  transition: 0.25s var(--ease);

  &.show {
    transform: scale(1);
  }
}

.hamburger {
  display: none;
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }

  .hamburger {
    display: grid;
  }
}

@media (max-width: 640px) {
  .header-inner {
    gap: 10px;
  }

  .header-actions {
    gap: 6px;
  }

  .search-btn {
    display: none;
  }

  .brand-text span {
    display: none;
  }
}
</style>
