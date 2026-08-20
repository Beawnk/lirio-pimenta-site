import { defineStore } from 'pinia'
import { ref } from 'vue'

/* Só um painel fica aberto por vez (menu, carrinho, filtros, produto…),
   que é o comportamento do closeAll() da demo. Guardar o nome do painel
   aberto num único ref evita quatro booleanos que podem se contradizer. */
export const useUiStore = defineStore('ui', () => {
  const openPanel = ref(null)

  const isOpen = (name) => openPanel.value === name

  function lockScroll(locked) {
    if (import.meta.client) {
      document.body.style.overflow = locked ? 'hidden' : ''
    }
  }

  function open(name) {
    openPanel.value = name
    lockScroll(true)
  }

  function close() {
    openPanel.value = null
    lockScroll(false)
  }

  function toggle(name) {
    isOpen(name) ? close() : open(name)
  }

  return { openPanel, isOpen, open, close, toggle }
})
