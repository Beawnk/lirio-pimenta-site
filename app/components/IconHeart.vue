<template>
  <svg viewBox="0 0 24 24" :fill="filled ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M12 21s-7-4.5-9.5-8.5C.5 9 2 5 5.5 5c2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3C18 5 19.5 9 17.5 12.5 15 16.5 12 21 12 21z" />
  </svg>
</template>

<script setup>
defineProps({
  filled: { type: Boolean, default: false },
})
</script>
