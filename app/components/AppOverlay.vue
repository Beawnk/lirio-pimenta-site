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
  backdrop-filter: blur(3px);
  z-index: 80;
  opacity: 0;
  visibility: hidden;
  transition: 0.3s;

  &.show {
    opacity: 1;
    visibility: visible;
  }
}
</style>
