/* v-reveal: o elemento aparece quando entra na tela.

   Duas armadilhas de SSR resolvidas aqui:

   1. A classe .reveal vai escrita no template, não é adicionada pela
      diretiva. Se ela só aparecesse depois da hidratação, o HTML do
      servidor e o do cliente ficariam diferentes e o Vue acusaria mismatch.
   2. A diretiva precisa existir também no servidor, mesmo sem fazer nada:
      sem `getSSRProps` o renderizador quebra ao encontrar v-reveal.

   O observer é único para a página e só nasce no cliente — criar um por
   elemento custaria caro com ~500 produtos no catálogo. */
let observer = null

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
  }

  return observer
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted: (el) => getObserver().observe(el),
    unmounted: (el) => getObserver().unobserve(el),
  })
})
