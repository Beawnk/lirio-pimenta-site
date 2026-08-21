<script setup>
import { findCategory } from '~/data/categories'
import { useCartStore } from '~/stores/cart'

const props = defineProps({
  line: { type: Object, required: true },
})

const cart = useCartStore()
const icon = findCategory(props.line.product.category)?.icon || 'package'
</script>

<template>
  <div class="cart-item">
    <div class="thumb">
      <ProductImage
        :image-key="line.product.image"
        :label="line.product.category"
        :icon="icon"
      />
    </div>

    <div class="ci-info">
      <div class="ci-name">{{ line.product.name }}</div>
      <div class="ci-price">
        {{ line.product.available ? 'Consultar preço' : 'Sob consulta na loja' }}
      </div>

      <div class="qty">
        <button aria-label="Diminuir" @click="cart.setQty(line.id, line.qty - 1)"><IconMinus /></button>
        <span>{{ line.qty }}</span>
        <button aria-label="Aumentar" @click="cart.setQty(line.id, line.qty + 1)"><IconPlus /></button>
      </div>

      <button class="ci-remove" @click="cart.remove(line.id)"><IconX /> Remover</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cart-item {
  display: flex;
  gap: 13px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.thumb {
  width: 66px;
  height: 66px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-soft);
}

.ci-info {
  flex: 1;
  min-width: 0;
}

.ci-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.92rem;
  line-height: 1.25;
}

.ci-price {
  font-size: 0.84rem;
  color: var(--ink-500);
  margin-top: 2px;
}

.qty {
  display: inline-flex;
  align-items: center;
  border: 1.6px solid var(--line);
  border-radius: var(--r-pill);
  margin-top: 8px;

  button {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    color: var(--ink-700);

    svg {
      width: 14px;
      height: 14px;
    }

    font-weight: 600;

    &:hover {
      color: var(--blue-700);
    }
  }

  span {
    min-width: 30px;
    text-align: center;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 0.9rem;
  }
}

.ci-remove {
  color: var(--ink-300);
  font-size: 0.78rem;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 12px;
    height: 12px;
  }

  &:hover {
    color: var(--red-500);
  }
}
</style>
