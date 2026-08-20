import { defineStore } from 'pinia'
import { ref } from 'vue'

/* Avisos curtos no rodapé ("Produto adicionado ao carrinho").
   Cada um sai sozinho depois de 2,6s — mesmo tempo da demo. */
export const useToastStore = defineStore('toast', () => {
  const messages = ref([])
  let nextId = 1

  function show(text) {
    const id = nextId++
    messages.value = [...messages.value, { id, text }]

    setTimeout(() => {
      messages.value = messages.value.filter((m) => m.id !== id)
    }, 2600)
  }

  return { messages, show }
})
