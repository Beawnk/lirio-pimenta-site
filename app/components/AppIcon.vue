<script setup>
import { computed } from 'vue'

import IconBaby from './IconBaby.vue'
import IconBackpack from './IconBackpack.vue'
import IconBag from './IconBag.vue'
import IconBall from './IconBall.vue'
import IconBattery from './IconBattery.vue'
import IconBlocks from './IconBlocks.vue'
import IconBook from './IconBook.vue'
import IconCamera from './IconCamera.vue'
import IconFlame from './IconFlame.vue'
import IconFlower from './IconFlower.vue'
import IconGem from './IconGem.vue'
import IconGift from './IconGift.vue'
import IconHandshake from './IconHandshake.vue'
import IconHome from './IconHome.vue'
import IconPackage from './IconPackage.vue'
import IconParty from './IconParty.vue'
import IconShirt from './IconShirt.vue'
import IconStore from './IconStore.vue'
import IconTag from './IconTag.vue'
import IconUsers from './IconUsers.vue'
import IconZap from './IconZap.vue'

/* Resolve a chave de texto que vem de `app/data/` no componente de ícone.

   Existe para que os dados continuem sem saber que Vue existe: `categories.js`
   guarda `icon: 'gift'`, não um componente. Use este componente só quando o
   ícone vier de dado — quando ele é fixo no template, escreva <IconGift /> direto. */

const ICONS = {
  baby: IconBaby,
  backpack: IconBackpack,
  bag: IconBag,
  ball: IconBall,
  battery: IconBattery,
  blocks: IconBlocks,
  book: IconBook,
  camera: IconCamera,
  flame: IconFlame,
  flower: IconFlower,
  gem: IconGem,
  gift: IconGift,
  handshake: IconHandshake,
  home: IconHome,
  package: IconPackage,
  party: IconParty,
  shirt: IconShirt,
  store: IconStore,
  tag: IconTag,
  users: IconUsers,
  zap: IconZap,
}

const props = defineProps({
  name: { type: String, default: '' },
})

/* Chave desconhecida cai na caixa genérica em vez de não renderizar nada. */
const icon = computed(() => ICONS[props.name] || IconPackage)
</script>

<template>
  <component :is="icon" />
</template>
