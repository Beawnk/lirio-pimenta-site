<script setup>
import { computed, ref, watch } from 'vue'
import { findCategory } from '~/data/categories'
import { ADDRESS } from '~/data/store-info'
import { useCartStore } from '~/stores/cart'
import { useCatalogStore } from '~/stores/catalog'
import { useFavoritesStore } from '~/stores/favorites'
import { useToastStore } from '~/stores/toast'
import { useUiStore } from '~/stores/ui'
import { useWhatsApp } from '~/composables/useWhatsApp'

const cart = useCartStore()
const catalog = useCatalogStore()
const favorites = useFavoritesStore()
const toast = useToastStore()
const ui = useUiStore()
const { consultLink } = useWhatsApp()

const product = computed(() => catalog.selectedProduct)
const icon = computed(() => (product.value && findCategory(product.value.category)?.icon) || 'package')

/* A quantidade volta para 1 a cada produto aberto */
const qty = ref(1)
watch(product, () => {
  qty.value = 1
})

function addToCart() {
  cart.add(product.value.id, qty.value)
  toast.show(`${product.value.name} adicionado ao carrinho`)
  ui.close()
}
</script>

<template>
  <div
    class="modal"
    :class="{ show: ui.isOpen('product') }"
    role="dialog"
    aria-modal="true"
    aria-label="Detalhes do produto"
    @click.self="ui.close()"
  >
    <div v-if="product" class="modal-card">
      <div class="modal-scroll">
        <div class="pd-grid">
          <div class="pd-media">
            <ProductImage
              :image-key="product.image"
              :label="product.category"
              :icon="icon"
            />
          </div>

          <div class="pd-info">
            <button class="close-x pd-close" aria-label="Fechar" @click="ui.close()"><IconX /></button>

            <span class="card-cat">
              {{ product.category }}<template v-if="product.isNew"> · <IconSparkle class="ic-new" /> Novidade</template>
            </span>
            <h2>{{ product.name }}</h2>
            <p class="pd-desc">{{ product.desc }}</p>

            <div class="pd-meta">
              <div class="m">
                <span>Categoria</span>
                <b>{{ product.category }}</b>
              </div>
              <div class="m">
                <span>Disponibilidade</span>
                <b :class="product.available ? 'ok' : 'consulta'">
                  {{ product.available ? 'Disponível na loja' : 'Sob consulta' }}
                </b>
              </div>
              <div class="m">
                <span>Retirada</span>
                <b>Na loja — {{ ADDRESS.district }}, {{ ADDRESS.city }}</b>
              </div>
            </div>

            <div class="pd-price">Consultar preço</div>
            <small>Confirme o valor na loja ou pelo WhatsApp.</small>

            <div class="pd-actions">
              <div v-if="product.available" class="pd-qtyrow">
                <span>Quantidade</span>
                <div class="qty">
                  <button aria-label="Diminuir" @click="qty = Math.max(1, qty - 1)"><IconMinus /></button>
                  <span>{{ qty }}</span>
                  <button aria-label="Aumentar" @click="qty = qty + 1"><IconPlus /></button>
                </div>
              </div>
              <button
                v-if="product.available"
                class="btn btn-primary btn-block"
                @click="addToCart()"
              >
                Adicionar ao carrinho
              </button>
              <a
                :href="consultLink(product.name)"
                target="_blank"
                rel="noopener"
                class="btn btn-wa btn-block"
              >
                <IconWhatsApp class="ic" />
                Consultar no WhatsApp
              </a>
              <button
                class="btn btn-ghost btn-block"
                @click="favorites.toggle(product.id)"
              >
                <IconHeart :filled="favorites.has(product.id)" class="ic" />
                {{ favorites.has(product.id) ? 'Salvo nos favoritos' : 'Salvar nos favoritos' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;

  &.show {
    opacity: 1;
    visibility: visible;

    .modal-card {
      transform: none;
    }
  }
}

.modal-card {
  background: #fff;
  border-radius: var(--r-xl);
  width: min(940px, 100%);
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--sh-3);
  transform: translateY(16px) scale(0.98);
  transition: transform 0.32s var(--ease);
}

.modal-scroll {
  overflow-y: auto;
}

.pd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.pd-media {
  position: relative;
  min-height: 420px;
  background: var(--bg-soft);

  :deep(.ph) {
    position: absolute;
    inset: 0;
  }
}

.pd-info {
  padding: clamp(24px, 3vw, 40px);
  display: flex;
  flex-direction: column;
  position: relative;

  h2 {
    font-size: clamp(1.4rem, 2.4vw, 1.9rem);
    font-weight: 800;
    margin-top: 8px;
  }

  small {
    color: var(--ink-500);
  }
}

.pd-close {
  position: absolute;
  top: 16px;
  right: 16px;
}

.card-cat {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--blue-700);
  font-weight: 600;
  font-family: var(--font-display);

  .ic-new {
    width: 11px;
    height: 11px;
    vertical-align: -1px;
  }
}

.pd-desc {
  color: var(--ink-500);
  margin-top: 14px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.pd-meta {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 20px 0;
  padding: 16px 0;
  border-block: 1px solid var(--line);

  .m {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;

    span:first-child {
      color: var(--ink-500);
    }

    b {
      font-family: var(--font-display);
    }

    .ok {
      color: var(--ok);
    }

    .consulta {
      color: var(--red-500);
    }
  }
}

/* Não é preço: é o convite para a conversa */
.pd-price {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--gold-600);
  margin: 6px 0 4px;
}

.pd-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;

  .ic {
    width: 18px;
    height: 18px;
  }
}

.pd-qtyrow {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;

  > span {
    color: var(--ink-500);
    font-size: 0.9rem;
  }
}

.qty {
  display: inline-flex;
  align-items: center;
  border: 1.6px solid var(--line);
  border-radius: var(--r-pill);

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

@media (max-width: 900px) {
  .pd-grid {
    grid-template-columns: 1fr;
  }

  .pd-media {
    min-height: 300px;
  }
}
</style>
