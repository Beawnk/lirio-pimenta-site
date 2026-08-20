<script setup>
import { useUiStore } from '~/stores/ui'

/* Casca do carrinho: só o drawer e o estado vazio.
   Itens, quantidade e o envio para o WhatsApp entram na etapa do carrinho,
   junto com o store Pinia — aqui é apenas para o botão do header não ficar morto. */
const ui = useUiStore()
</script>

<template>
  <aside class="drawer" :class="{ show: ui.isOpen('cart') }" aria-label="Carrinho">
    <div class="drawer-head">
      <h3>Seu carrinho</h3>
      <button class="close-x" aria-label="Fechar" @click="ui.close()">✕</button>
    </div>
    <div class="drawer-body">
      <div class="cart-empty">
        <div class="big">🛒</div>
        <h3>Seu carrinho está vazio</h3>
        <p>Explore o catálogo e adicione produtos.</p>
        <a href="#catalogo" class="btn btn-primary btn-sm" @click="ui.close()">Ver produtos</a>
      </div>
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

.cart-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-500);

  .big {
    font-size: 2.6rem;
  }

  p {
    margin-top: 6px;
  }

  .btn {
    margin-top: 16px;
  }
}
</style>
