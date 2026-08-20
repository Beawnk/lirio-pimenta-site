<script setup>
import { useWhatsApp } from '~/composables/useWhatsApp'

defineProps({
  glyph: { type: String, default: '🔍' },
  title: { type: String, default: 'Nada encontrado' },
  message: { type: String, default: 'Tente outra busca ou fale com a gente pelo WhatsApp.' },
})

const { greetingLink } = useWhatsApp()
</script>

<template>
  <div class="empty">
    <div class="big">{{ glyph }}</div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <a :href="greetingLink()" target="_blank" rel="noopener" class="btn btn-wa btn-sm">
      Perguntar no WhatsApp
    </a>
  </div>
</template>

<style lang="scss" scoped>
.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--sp-8) 20px;
  color: var(--ink-500);

  .big {
    font-size: 2.4rem;
    margin-bottom: 10px;
  }

  .btn {
    margin-top: 14px;
  }
}
</style>
