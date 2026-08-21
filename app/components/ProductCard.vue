<script setup>
import { findCategory } from '~/data/categories'
import { useCartStore } from '~/stores/cart'
import { useCatalogStore } from '~/stores/catalog'
import { useFavoritesStore } from '~/stores/favorites'
import { useToastStore } from '~/stores/toast'
import { useWhatsApp } from '~/composables/useWhatsApp'

const props = defineProps({
  product: { type: Object, required: true },
})

const cart = useCartStore()
const catalog = useCatalogStore()
const favorites = useFavoritesStore()
const toast = useToastStore()
const { consultLink } = useWhatsApp()

const icon = findCategory(props.product.category)?.icon || 'package'

/* Produto sob consulta não entra no carrinho: não dá para prometer o que
   pode não existir na prateleira. Esse vai direto para a conversa. */
function addToCart() {
  cart.add(props.product.id)
  toast.show(`${props.product.name} adicionado ao carrinho`)
}
</script>

<template>
  <article v-reveal class="card reveal">
    <div class="card-media" role="button" tabindex="0" @click="catalog.openProduct(product.id)" @keydown.enter="catalog.openProduct(product.id)">
      <ProductImage :image-key="product.image" :label="product.category" :icon="icon" />

      <div class="card-badges">
        <span v-if="product.isNew" class="badge badge-new">✦ Novidade</span>
        <span v-if="!product.available" class="badge badge-soft">Sob consulta</span>
      </div>

      <button
        class="fav"
        :class="{ active: favorites.has(product.id) }"
        :aria-label="`Favoritar ${product.name}`"
        :aria-pressed="favorites.has(product.id)"
        @click.stop="favorites.toggle(product.id)"
      >
        <IconHeart :filled="favorites.has(product.id)" />
      </button>
    </div>

    <div class="card-body">
      <span class="card-cat">{{ product.category }}</span>
      <h3 class="card-name">
        <button type="button" @click="catalog.openProduct(product.id)">{{ product.name }}</button>
      </h3>
      <p class="card-desc">{{ product.desc }}</p>

      <div class="card-foot">
        <!-- Preço nunca aparece: quem decide o valor é a conversa no WhatsApp -->
        <span class="price-consult">Consultar preço</span>
        <button
          v-if="product.available"
          class="add-btn"
          :aria-label="`Adicionar ${product.name} ao carrinho`"
          @click.stop="addToCart()"
        >
          <IconPlus />
        </button>
        <a
          v-else
          :href="consultLink(product.name)"
          target="_blank"
          rel="noopener"
          class="add-btn wa"
          :aria-label="`Consultar ${product.name} no WhatsApp`"
          @click.stop
        >
          <IconWhatsApp />
        </a>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: 0.26s var(--ease);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--sh-3);
    border-color: transparent;
  }
}

.card-media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-soft);
  cursor: pointer;

  .card:hover & :deep(.ph img) {
    transform: scale(1.06);
  }

  :deep(.ph) {
    position: absolute;
    inset: 0;
  }
}

.card-badges {
  position: absolute;
  top: 11px;
  left: 11px;
  z-index: 3;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.fav {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  color: var(--ink-500);
  box-shadow: var(--sh-1);
  transition: 0.18s;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: var(--red-500);
    transform: scale(1.08);
  }

  &.active {
    color: var(--red-500);
  }
}

.card-body {
  padding: 15px 15px 17px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-cat {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--blue-700);
  font-weight: 600;
  font-family: var(--font-display);
}

.card-name {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 5px;
  line-height: 1.3;

  button {
    text-align: left;
    font: inherit;
    color: inherit;
    padding: 0;
  }
}

.card-desc {
  font-size: 0.84rem;
  color: var(--ink-500);
  margin-top: 7px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
}

.price-consult {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--gold-600);
}

.add-btn {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--blue-700);
  color: #fff;
  display: grid;
  place-items: center;
  transition: 0.2s;
  box-shadow: var(--sh-1);

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: var(--blue-900);
    transform: translateY(-2px);
  }

  &.wa {
    background: var(--wa);
    color: #08361b;

    &:hover {
      background: #1fbe5a;
    }
  }
}

@media (max-width: 640px) {
  .card-name {
    font-size: 0.92rem;
  }

  .card-desc {
    display: none;
  }
}
</style>
