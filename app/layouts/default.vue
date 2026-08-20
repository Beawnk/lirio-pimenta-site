<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

/* Esc fecha o que estiver aberto — mesmo comportamento do closeAll() da demo */
const onKeydown = (e) => {
  if (e.key === 'Escape') ui.close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div>
    <a href="#conteudo" class="skip">Pular para o conteúdo</a>

    <AppHeader />

    <main id="conteudo">
      <slot />
    </main>

    <AppFooter />

    <WhatsAppFab />
    <BottomNav />

    <AppOverlay />
    <MobileMenu />
    <CartDrawer />
  </div>
</template>
