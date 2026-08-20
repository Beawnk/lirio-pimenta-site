<script setup>
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
</script>

<template>
  <aside class="drawer" :class="{ show: ui.isOpen('filters') }" aria-label="Filtros">
    <div class="drawer-head">
      <h3>Filtros</h3>
      <button class="close-x" aria-label="Fechar" @click="ui.close()">✕</button>
    </div>
    <div class="drawer-body">
      <CatalogFilters bare />
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: min(360px, 92vw);
  background: #fff;
  z-index: 90;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: 0.36s var(--ease);
  box-shadow: var(--sh-3);

  &.show {
    transform: translateX(0);
  }
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid var(--line);

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 22px;
}
</style>
