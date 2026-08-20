<script setup>
/* O primeiro item se repete no fim: a animação dá a volta e emenda sem salto. */
const WORDS = [
  'uma pilha…',
  'um brinquedo…',
  'um presente…',
  'uma mochila…',
  'uma semijoia…',
  'um acessório…',
  'uma pilha…',
]
</script>

<template>
  <section class="section discover">
    <div v-reveal class="container reveal">
      <span class="eyebrow">A cara da Lírio Pimenta</span>
      <h2>
        Você entra procurando<br >
        <span class="rotator">
          <span v-for="(word, i) in WORDS" :key="i">{{ word }}</span>
        </span>
      </h2>
      <div class="end">…e encontra muito mais.</div>
      <p>
        Do presente ao dia a dia: tem Lírio Pimenta. É esse tipo de descoberta que só uma loja de
        verdade proporciona.
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.discover {
  background: linear-gradient(135deg, var(--blue-900), var(--blue-700));
  color: #fff;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.09;
    background-image: radial-gradient(#fff 1px, transparent 1.4px);
    background-size: 22px 22px;
  }

  .container {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .eyebrow {
    color: var(--gold-500);
  }

  h2 {
    color: #fff;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 800;
    margin-top: 12px;
  }

  p {
    color: #cfe4f2;
    max-width: 44ch;
    margin: 18px auto 0;
  }
}

.rotator {
  height: 1.4em;
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom;
  position: relative;
  min-width: 6ch;

  span {
    display: block;
    color: var(--gold-500);
    font-weight: 800;
    animation: roll 9s infinite;
  }
}

@keyframes roll {
  0%,
  14% {
    transform: translateY(0);
  }

  16%,
  30% {
    transform: translateY(-100%);
  }

  32%,
  46% {
    transform: translateY(-200%);
  }

  48%,
  62% {
    transform: translateY(-300%);
  }

  64%,
  78% {
    transform: translateY(-400%);
  }

  80%,
  94% {
    transform: translateY(-500%);
  }

  96%,
  100% {
    transform: translateY(-600%);
  }
}

.end {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  color: #fff;
  margin-top: 6px;
}
</style>
