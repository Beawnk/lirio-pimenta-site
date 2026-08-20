<script setup>
import { computed } from 'vue'
import { findCategory } from '~/data/categories'
import { ADDRESS } from '~/data/store-info'
import { useCatalogStore } from '~/stores/catalog'
import { useFavoritesStore } from '~/stores/favorites'
import { useUiStore } from '~/stores/ui'
import { useWhatsApp } from '~/composables/useWhatsApp'

const catalog = useCatalogStore()
const favorites = useFavoritesStore()
const ui = useUiStore()
const { consultLink } = useWhatsApp()

const product = computed(() => catalog.selectedProduct)
const emoji = computed(() => (product.value ? findCategory(product.value.category)?.emoji : '📦'))
</script>

<template>
  <div
    class="modal"
    :class="{ show: ui.isOpen('product') }"
    role="dialog"
    aria-modal="true"
    aria-label="Detalhes do produto"
  >
    <div v-if="product" class="modal-card">
      <div class="modal-scroll">
        <div class="pd-grid">
          <div class="pd-media">
            <ProductImage
              :image-key="product.image"
              :label="product.category"
              :glyph="emoji"
            />
          </div>

          <div class="pd-info">
            <button class="close-x pd-close" aria-label="Fechar" @click="ui.close()">✕</button>

            <span class="card-cat">
              {{ product.category }}<template v-if="product.isNew"> · ✦ Novidade</template>
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
  transition: 0.3s;

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
  transition: 0.32s var(--ease);
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

@media (max-width: 900px) {
  .pd-grid {
    grid-template-columns: 1fr;
  }

  .pd-media {
    min-height: 300px;
  }
}
</style>
