import { computed, onMounted, onUnmounted, ref } from 'vue'
import { HOURS } from '~/data/store-info'

const toMinutes = (time) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

/* "Aberto agora" depende do relógio de quem visita, então NÃO pode ser
   calculado no servidor: o HTML renderizado lá diria uma coisa e o cliente
   outra, e o Vue reclamaria da diferença na hidratação.

   Por isso `now` começa null — nesse estado a interface mostra "Verificando…",
   igual à demo — e só é preenchido depois que o componente monta no navegador. */
export function useStoreHours() {
  const now = ref(null)
  let timer = null

  onMounted(() => {
    now.value = new Date()
    timer = setInterval(() => {
      now.value = new Date()
    }, 60_000)
  })

  onUnmounted(() => clearInterval(timer))

  const todayIndex = computed(() => (now.value ? now.value.getDay() : -1))

  const isOpen = computed(() => {
    if (!now.value) return null

    const today = HOURS[todayIndex.value]
    if (!today.open) return false

    const current = now.value.getHours() * 60 + now.value.getMinutes()
    return current >= toMinutes(today.open) && current < toMinutes(today.close)
  })

  const days = computed(() =>
    HOURS.map((entry, index) => ({
      day: entry.day,
      label: entry.open ? `${entry.open} — ${entry.close}` : 'Fechado',
      isToday: index === todayIndex.value,
    })),
  )

  const statusLabel = computed(() => {
    if (isOpen.value === null) return 'Verificando…'
    return isOpen.value ? 'Aberto agora' : 'Fechado agora'
  })

  return { days, isOpen, statusLabel }
}
