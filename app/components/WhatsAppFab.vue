<script setup>
import { useWhatsApp } from '~/composables/useWhatsApp'

const { greetingLink } = useWhatsApp()
</script>

<template>
  <a
    :href="greetingLink()"
    target="_blank"
    rel="noopener"
    class="fab-wa pulse"
    aria-label="Fale conosco no WhatsApp"
  >
    <IconWhatsApp />
    <span class="fab-text">Fale conosco</span>
  </a>
</template>

<style lang="scss" scoped>
.fab-wa {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--wa);
  color: #fff;
  border-radius: var(--r-pill);
  box-shadow: 0 10px 30px rgba(11, 138, 61, 0.42);
  padding: 14px;
  transition: 0.28s var(--ease);
  overflow: hidden;

  svg {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  &:hover {
    padding-right: 20px;

    .fab-text {
      max-width: 180px;
      opacity: 1;
      margin-left: 10px;
    }
  }

  &.pulse::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--r-pill);
    border: 2px solid var(--wa);
    animation: fabpulse 2s infinite;
  }
}

.fab-text {
  max-width: 0;
  opacity: 0;
  white-space: nowrap;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.92rem;
  transition: 0.3s var(--ease);
}

@media (max-width: 640px) {
  .fab-wa {
    bottom: 76px;
  }

  .fab-text {
    display: none;
  }
}
</style>
