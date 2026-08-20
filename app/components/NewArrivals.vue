<script setup>
import { useCatalogStore } from '~/stores/catalog'

const catalog = useCatalogStore()
</script>

<template>
  <section id="novidades" class="section section--soft">
    <div class="container">
      <div v-reveal class="ig-head reveal">
        <div class="sec-head">
          <span class="eyebrow">Chegou novidade</span>
          <h2 class="sec-title">Chegou novidade na Lírio Pimenta</h2>
          <p class="sec-sub">
            A loja está sempre recebendo produtos novos. Veja algumas das novidades e acompanhe as
            reposições pelas nossas redes.
          </p>
        </div>
        <a href="#catalogo" class="btn btn-ghost">Ver catálogo completo</a>
      </div>

      <ProductGrid :products="catalog.newArrivals" :columns="4" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.ig-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: var(--sp-6);

  .sec-head {
    margin-bottom: 0;
  }
}
</style>
