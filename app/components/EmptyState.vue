<script setup>
import { useWhatsApp } from '~/composables/useWhatsApp'

defineProps({
  icon: { type: String, default: 'search' },
  title: { type: String, default: 'Nada encontrado' },
  message: { type: String, default: 'Tente outra busca ou fale com a gente pelo WhatsApp.' },
})

const { greetingLink } = useWhatsApp()
</script>

<template>
  <div class="empty">
    <AppIcon :name="icon" class="big" />
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
    width: 42px;
    height: 42px;
    margin: 0 auto 10px;
    color: var(--ink-300);
  }

  .btn {
    margin-top: 14px;
  }
}
</style>
