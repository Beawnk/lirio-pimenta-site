import { useFavoritesStore } from '~/stores/favorites'

/* Lê os favoritos salvos assim que o app sobe no navegador.
   Só no cliente — no servidor não existe localStorage. */
export default defineNuxtPlugin(() => {
  useFavoritesStore().hydrate()
})
