<script setup>
import { useToastStore } from '~/stores/toast'

const toast = useToastStore()
</script>

<template>
  <div class="toast-wrap">
    <TransitionGroup name="toast">
      <div v-for="message in toast.messages" :key="message.id" class="toast">
        <span class="tic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        {{ message.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.toast-wrap {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  pointer-events: none;
}

.toast {
  background: var(--ink-900);
  color: #fff;
  padding: 13px 20px;
  border-radius: var(--r-pill);
  font-size: 0.9rem;
  font-family: var(--font-display);
  font-weight: 500;
  box-shadow: var(--sh-3);
  display: flex;
  align-items: center;
  gap: 10px;

  .tic {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--ok);
    display: grid;
    place-items: center;
    flex-shrink: 0;

    svg {
      width: 14px;
      height: 14px;
      color: #fff;
    }
  }
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: 0.3s var(--ease);
}

@media (max-width: 640px) {
  .toast-wrap {
    bottom: 76px;
  }
}
</style>
