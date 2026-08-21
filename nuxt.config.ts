// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxt/test-utils/module'],
  css: ['~/assets/scss/main.scss'],
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Lírio Pimenta | Variedades, Presentes e Muito Mais em Viamão',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0f5c8c' },
        /* Domínio temporário do Cloudflare Pages (workers.dev) — se ficar
           indexado, vira uma URL órfã competindo com o .com.br depois.
           REMOVER quando o domínio final subir (ver SITE_URL em
           app/data/store-info.js e a dívida "Virada de domínio" no
           TASKS.md / CLAUDE.md do projeto). */
        { name: 'robots', content: 'noindex, nofollow' },
        {
          name: 'description',
          content:
            'Lírio Pimenta, há mais de 40 anos em Viamão. Presentes, brinquedos, livraria, tabacaria, utilidades, semijoias e muito mais. Rua Ramiro Barcelos, 84 — Centro.',
        },
        { property: 'og:type', content: 'business.business' },
        { property: 'og:site_name', content: 'Lírio Pimenta' },
        { property: 'og:locale', content: 'pt_BR' },
        {
          property: 'og:title',
          content: 'Lírio Pimenta | Tudo que você procura, em um só lugar',
        },
        {
          property: 'og:description',
          content:
            'Há mais de 40 anos ao lado do povo de Viamão. Uma loja de variedades, presentes e descobertas.',
        },
        { property: 'business:contact_data:street_address', content: 'Rua Ramiro Barcelos, 84' },
        { property: 'business:contact_data:locality', content: 'Viamão' },
        { property: 'business:contact_data:region', content: 'RS' },
        { property: 'business:contact_data:country_name', content: 'Brasil' },
        { property: 'business:contact_data:phone_number', content: '+555130463033' },
      ],
      link: [
        /* SVG para quem suporta (nítido em qualquer tamanho) e .ico como
           reserva. O ícone é a pimenta do logo: a 16px o escudo inteiro,
           com "Lírio Pimenta" escrito, viraria um borrão. */
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
