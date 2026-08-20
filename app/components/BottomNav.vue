<script setup>
import { useUiStore } from '~/stores/ui'
import { useWhatsApp } from '~/composables/useWhatsApp'

const ui = useUiStore()
const { waLink } = useWhatsApp()
</script>

<template>
  <nav class="bottomnav" aria-label="Navegação rápida">
    <a href="#top"><IconHome />Início</a>
    <a href="#catalogo"><IconSearch />Buscar</a>
    <button type="button" @click="ui.open('cart')">
      <IconCart />Carrinho
    </button>
    <a :href="waLink()" target="_blank" rel="noopener" class="wa">
      <IconWhatsApp />WhatsApp
    </a>
  </nav>
</template>

<style lang="scss" scoped>
/* Só existe no mobile — no desktop o header dá conta */
.bottomnav {
  display: none;
}

@media (max-width: 640px) {
  .bottomnav {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 65;
    background: #fff;
    border-top: 1px solid var(--line);
    box-shadow: 0 -2px 14px rgba(16, 40, 60, 0.08);

    a,
    button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 9px 0;
      color: var(--ink-500);
      font-size: 0.66rem;
      font-family: var(--font-display);
      font-weight: 500;
      position: relative;

      &:active {
        color: var(--blue-700);
      }
    }

    .wa {
      color: var(--wa);
    }

    svg {
      width: 22px;
      height: 22px;
    }
  }
}
</style>
