import { useCartStore } from '~/stores/cart'

/* Lê o carrinho salvo — só no cliente, o servidor não tem localStorage.

   O momento importa mais do que parece. Se o store for preenchido antes de
   a hidratação terminar, o primeiro render do navegador já sai com 3 itens
   enquanto o HTML do servidor tem 0. O Vue avisa do mismatch mas NÃO
   corrige `class` — e, como os renders seguintes calculam sempre a mesma
   classe, ele nunca mais escreve nela. Resultado: o contador do header
   mostrava "3" preso em `scale(0)`, invisível.

   `app:mounted` ainda é cedo demais (a raiz monta antes de a árvore do
   Suspense hidratar). `app:suspense:resolve` roda depois da hidratação
   inteira, então preencher o carrinho vira uma atualização comum. */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    useCartStore().hydrate()
  })
})
