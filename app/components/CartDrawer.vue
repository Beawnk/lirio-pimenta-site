<script setup>
import { useCartStore } from '~/stores/cart'
import { useToastStore } from '~/stores/toast'
import { useUiStore } from '~/stores/ui'

const cart = useCartStore()
const ui = useUiStore()
const toast = useToastStore()

function clear() {
  cart.clear()
  toast.show('Carrinho esvaziado')
}
</script>

<template>
  <aside class="drawer" :class="{ show: ui.isOpen('cart') }" aria-label="Carrinho">
    <div class="drawer-head">
      <h3>Seu carrinho</h3>
      <button class="close-x" aria-label="Fechar" @click="ui.close()"><IconX /></button>
    </div>

    <div class="drawer-body">
      <div v-if="cart.isEmpty" class="cart-empty">
        <IconCart class="big" />
        <h3>Seu carrinho está vazio</h3>
        <p>Explore o catálogo e adicione produtos.</p>
        <a href="#catalogo" class="btn btn-primary btn-sm" @click="ui.close()">Ver produtos</a>
      </div>

      <CartItem v-for="line in cart.lines" v-else :key="line.id" :line="line" />
    </div>

    <div v-if="!cart.isEmpty" class="drawer-foot">
      <!-- Sem subtotal e sem total: o site não mostra preço.
           O que fecha o pedido é a conversa no WhatsApp. -->
      <div class="summ-row">
        <span>{{ cart.count }} {{ cart.count === 1 ? 'item' : 'itens' }}</span>
        <b>Valor a combinar</b>
      </div>

      <button class="btn btn-primary btn-block enviar" @click="ui.open('checkout')">
        Enviar pedido no WhatsApp
      </button>
      <button class="btn btn-ghost btn-block btn-sm limpar" @click="clear()">
        Limpar carrinho
      </button>

      <p class="cart-note">
        Combine a retirada na Lírio Pimenta ou a entrega pelo WhatsApp. Nada é cobrado pelo site.
      </p>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: min(420px, 92vw);
  background: #fff;
  z-index: 90;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: 0.36s var(--ease);
  box-shadow: var(--sh-3);

  &.show {
    transform: translateX(0);
  }
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid var(--line);

  h3 {
    font-size: 1.2rem;
    font-weight: 700;
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 22px;
}

.drawer-foot {
  border-top: 1px solid var(--line);
  padding: 18px 22px;
  background: var(--bg-soft);
}

.cart-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-500);

  .big {
    width: 46px;
    height: 46px;
    margin: 0 auto;
    color: var(--ink-300);
  }

  p {
    margin-top: 6px;
  }

  .btn {
    margin-top: 16px;
  }
}

.summ-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.92rem;
  padding: 5px 0;
  color: var(--ink-700);

  b {
    font-family: var(--font-display);
  }
}

.enviar {
  margin-top: 14px;
}

.limpar {
  margin-top: 8px;
}

.cart-note {
  font-size: 0.76rem;
  color: var(--ink-500);
  text-align: center;
  margin-top: 10px;
}
</style>
