import { useFavoritesStore } from '~/stores/favorites'

/* Lê os favoritos salvos — só no cliente, o servidor não tem localStorage.

   Depois de `app:suspense:resolve` pelo mesmo motivo do carrinho: antes de
   a hidratação terminar, o coração preenchido existiria só no cliente e o
   Vue manteria a classe que veio do servidor. Veja cart.client.js. */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    useFavoritesStore().hydrate()
  })
})
