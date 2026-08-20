<script setup>
/* `columns` é o número de colunas no desktop: 3 no catálogo, 4 nas
   novidades. Passar por prop em vez de estilizar a raiz do componente de
   fora evita depender da ordem em que os estilos entram na página. */
defineProps({
  products: { type: Array, required: true },
  columns: { type: Number, default: 3 },
})
</script>

<template>
  <div class="prod-grid" :class="`cols-${columns}`">
    <ProductCard v-for="product in products" :key="product.id" :product="product" />
    <slot v-if="!products.length" name="empty" />
  </div>
</template>

<style lang="scss" scoped>
.prod-grid {
  display: grid;
  gap: 18px;

  &.cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  &.cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1024px) {
  .prod-grid.cols-3,
  .prod-grid.cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .prod-grid {
    gap: 12px;
  }
}
</style>
