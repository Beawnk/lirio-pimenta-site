<script setup>
import { INSTAGRAM } from '~/data/store-info'
import { useCatalogStore } from '~/stores/catalog'
import { useUiStore } from '~/stores/ui'
import { useWhatsApp } from '~/composables/useWhatsApp'

const ui = useUiStore()
const catalog = useCatalogStore()
const { waLink } = useWhatsApp()

/* No celular a busca do header some (some ícone a menos por barra); o
   caminho até ela passa a ser este menu. Fecha, rola e já foca o campo. */
function searchAndClose() {
  ui.close()
  catalog.focusSearch()
}

const LINKS = [
  { href: '#categorias', label: 'Categorias' },
  { href: '#novidades', label: 'Novidades' },
  { href: '#catalogo', label: 'Catálogo' },
  { href: '#presentes', label: 'Presentes' },
  { href: '#historia', label: 'Sobre a loja' },
  { href: '#loja', label: 'Onde estamos' },
]
</script>

<template>
  <aside class="mmenu" :class="{ show: ui.isOpen('menu') }" aria-label="Menu">
    <div class="mmenu-head">
      <a href="#top" class="brand" @click="ui.close()">
        <span class="brand-mark"><img src="/img/logo.png" alt="Lírio Pimenta" ></span>
        <b>Lírio Pimenta</b>
      </a>
      <button class="close-x" aria-label="Fechar" @click="ui.close()"><IconX /></button>
    </div>

    <button type="button" class="search-item" @click="searchAndClose()">
      <IconSearch />
      Buscar no catálogo
    </button>

    <a v-for="link in LINKS" :key="link.href" :href="link.href" @click="ui.close()">
      {{ link.label }}
    </a>
    <a :href="INSTAGRAM" target="_blank" rel="noopener">Instagram</a>
    <a :href="waLink()" target="_blank" rel="noopener" class="wa">WhatsApp</a>
  </aside>
</template>

<style lang="scss" scoped>
.mmenu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: min(320px, 86vw);
  background: #fff;
  z-index: 90;
  transform: translateX(-100%);
  transition: transform 0.34s var(--ease);
  box-shadow: var(--sh-3);
  display: flex;
  flex-direction: column;

  &.show {
    transform: translateX(0);
  }

  > a,
  > .search-item {
    padding: 15px 22px;
    border-bottom: 1px solid var(--line);
    font-family: var(--font-display);
    font-weight: 500;
    color: var(--ink-900);
    display: flex;
    align-items: center;
    gap: 12px;

    &:hover {
      background: var(--bg-soft);
      color: var(--blue-700);
    }
  }

  .search-item {
    width: 100%;
    text-align: left;
    background: none;
    border-left: none;
    border-right: none;
    border-top: none;

    svg {
      width: 19px;
      height: 19px;
      color: var(--ink-500);
      /* A caixa do ícone já fica centralizada com a do texto, mas o texto
         reserva espaço para acento/descendente abaixo da linha de base —
         isso puxa o centro óptico do texto ~1px para baixo do centro do
         ícone. Sem o nudge, o ícone lê como "mais alto" que a palavra. */
      position: relative;
      top: -1px;
    }
  }

  .wa {
    color: var(--wa);
  }
}

.mmenu-head {
  padding: 20px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0;
  border: none;

  b {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.05rem;
  }
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  overflow: hidden;
  background: #fff;
  box-shadow: var(--sh-1);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
