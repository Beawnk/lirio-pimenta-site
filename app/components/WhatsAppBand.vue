<script setup>
import { useWhatsApp } from '~/composables/useWhatsApp'

const { waLink } = useWhatsApp()

/* Atalhos: cada um abre a conversa com a pergunta já escrita.
   É o que substitui o "fale conosco" genérico — o cliente não precisa
   pensar em como começar. */
const QUICK = [
  { label: 'Consultar produto', message: 'Olá! Quero consultar um produto.' },
  { label: 'Reservar produto', message: 'Olá! Quero reservar um produto.' },
  { label: 'Saber preço', message: 'Olá! Gostaria de saber o preço de um produto.' },
  { label: 'Perguntar disponibilidade', message: 'Olá! Esse produto está disponível?' },
  { label: 'Tirar dúvidas', message: 'Olá! Tenho uma dúvida.' },
]
</script>

<template>
  <section class="section">
    <div class="container">
      <div v-reveal class="wa-band reveal">
        <h2>Quer saber se chegou? Pergunte pra gente.</h2>
        <p>
          Fale com a Lírio Pimenta pelo WhatsApp: consulte um produto, reserve, pergunte o preço ou
          tire dúvidas. Atendimento humano e rápido.
        </p>
        <div class="wa-quick">
          <a
            v-for="item in QUICK"
            :key="item.label"
            :href="waLink(item.message)"
            target="_blank"
            rel="noopener"
          >
            {{ item.label }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.wa-band {
  background: linear-gradient(135deg, #0b8a3d, var(--wa));
  color: #fff;
  border-radius: var(--r-xl);
  padding: clamp(30px, 5vw, 54px);
  text-align: center;
  box-shadow: var(--sh-3);
  position: relative;
  overflow: hidden;

  h2 {
    color: #fff;
    font-size: clamp(1.7rem, 3.4vw, 2.4rem);
    font-weight: 800;
  }

  p {
    color: #e6fff0;
    max-width: 48ch;
    margin: 14px auto 0;
  }
}

.wa-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 26px;

  a {
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
    border: 1.6px solid rgba(255, 255, 255, 0.32);
    padding: 11px 18px;
    border-radius: var(--r-pill);
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 0.9rem;
    transition: 0.2s;

    &:hover {
      background: #fff;
      color: #0b8a3d;
    }
  }
}
</style>
