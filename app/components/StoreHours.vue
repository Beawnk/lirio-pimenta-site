<script setup>
import { useStoreHours } from '~/composables/useStoreHours'

const { days, isOpen, statusLabel } = useStoreHours()
</script>

<template>
  <div class="hours">
    <div class="hours-status" :class="{ open: isOpen === true, closed: isOpen === false }">
      <span class="dot" />
      <span>{{ statusLabel }}</span>
    </div>
    <ul class="hours-list">
      <li v-for="entry in days" :key="entry.day" :class="{ today: entry.isToday }">
        <span>{{ entry.day }}</span>
        <span>{{ entry.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.hours {
  margin-top: 8px;
  padding-top: 18px;
}

.hours-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 8px 15px;
  border-radius: var(--r-pill);
  margin-bottom: 14px;
  background: var(--bg-soft);
  color: var(--ink-500);

  .dot {
    background: var(--ink-300);
    animation: hourspulse 1.8s infinite;
  }

  &.open {
    background: #e4f7ec;
    color: var(--ok);

    .dot {
      background: var(--ok);
    }
  }

  &.closed {
    background: #fdeaec;
    color: var(--red-500);

    .dot {
      background: var(--red-500);
    }
  }
}

@keyframes hourspulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.hours-list li {
  display: flex;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 0.9rem;

  &:last-child {
    border: none;
  }

  &.today {
    font-weight: 700;
    color: var(--blue-700);
  }

  span:first-child {
    color: var(--ink-700);
  }
}
</style>
