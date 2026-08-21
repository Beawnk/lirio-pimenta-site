<script setup>
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="overlay" :class="{ show: ui.openPanel !== null }" @click="ui.close()" />
</template>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 25, 38, 0.55);
  z-index: 80;
  opacity: 0;
  visibility: hidden;
  /* Lista explícita: `transition: 0.3s` anima toda propriedade que mudar.
     Numa camada de tela cheia isso significava animar o desfoque quadro a
     quadro por 300ms toda vez que um painel abria. */
  transition: opacity 0.3s, visibility 0.3s;

  &.show {
    opacity: 1;
    visibility: visible;
  }
}
</style>
