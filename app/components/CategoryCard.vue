<script setup>
defineProps({
  category: { type: Object, required: true },
})
</script>

<template>
  <button v-reveal type="button" class="cat-card reveal">
    <ProductImage :image-key="category.image" :label="category.name" :icon="category.icon" />
    <span class="cat-icon"><AppIcon :name="category.icon" /></span>
    <span class="cat-body">
      <h3>{{ category.name }}</h3>
      <p>{{ category.desc }}</p>
      <span class="cat-link">Explorar <IconArrowRight /></span>
    </span>
  </button>
</template>

<style lang="scss" scoped>
.cat-card {
  position: relative;
  border-radius: var(--r-lg);
  overflow: hidden;
  aspect-ratio: 1 / 1.08;
  box-shadow: var(--sh-1);
  transition: 0.3s var(--ease);
  cursor: pointer;
  display: block;
  width: 100%;
  padding: 0;
  text-align: left;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--sh-3);
  }

  :deep(.ph) {
    position: absolute;
    inset: 0;
  }

  &:hover :deep(.ph img) {
    transform: scale(1.07);
  }

  /* Sobre a foto vem o gradiente com o nome da categoria */
  :deep(.ph.svgph .ph-inner) {
    opacity: 0.5;
  }

  :deep(.ph.svgph .ph-note) {
    display: none;
  }
}

.cat-body {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 18px;
  background: linear-gradient(180deg, transparent 30%, rgba(8, 30, 46, 0.86) 100%);
  color: #fff;

  h3 {
    color: #fff;
    font-size: 1.15rem;
    font-weight: 700;
  }

  p {
    font-size: 0.82rem;
    color: #dce7f0;
    margin-top: 3px;
  }
}

.cat-icon {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 3;
  color: var(--blue-700);
  background: rgba(255, 255, 255, 0.92);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  box-shadow: var(--sh-1);

  svg {
    width: 22px;
    height: 22px;
  }
}

.cat-link {
  margin-top: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--gold-500);
  display: inline-flex;
  align-items: center;
  gap: 5px;

  svg {
    width: 14px;
    height: 14px;
    stroke-width: 2.4;
  }
}

@media (max-width: 640px) {
  .cat-icon {
    width: 38px;
    height: 38px;

    svg {
      width: 19px;
      height: 19px;
    }
  }
}
</style>
