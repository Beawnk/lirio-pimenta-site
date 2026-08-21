import { ADDRESS, HOURS, INSTAGRAM, MAPS_URL, PHONE, SITE_URL } from '~/data/store-info'

/* schema.org usa o nome do dia em inglês. HOURS já tem o índice de
   getDay() implícito na ordem (0 = domingo), então só traduz o rótulo. */
const DAY_NAME_EN = {
  Domingo: 'Sunday',
  Segunda: 'Monday',
  Terça: 'Tuesday',
  Quarta: 'Wednesday',
  Quinta: 'Thursday',
  Sexta: 'Friday',
  Sábado: 'Saturday',
}

/* Agrupa dias seguidos com o mesmo horário num único bloco — HOURS pode
   mudar (um dia com horário diferente, uma folga extra) sem que este
   agrupamento precise ser reescrito à mão. */
function buildOpeningHours() {
  const groups = []

  for (const day of HOURS) {
    if (!day.open || !day.close) continue

    const last = groups[groups.length - 1]
    if (last && last.opens === day.open && last.closes === day.close) {
      last.dayOfWeek.push(DAY_NAME_EN[day.day])
    } else {
      groups.push({ opens: day.open, closes: day.close, dayOfWeek: [DAY_NAME_EN[day.day]] })
    }
  }

  return groups.map((group) => ({ '@type': 'OpeningHoursSpecification', ...group }))
}

/* Monta o LocalBusiness (Store) para injetar como application/ld+json.
   Função pura, sem Vue — só lê de ~/data/store-info, a mesma fonte que a
   interface usa, então nunca diverge do que aparece na página.

   Sem "geo": não temos as coordenadas e não vamos inventar. hasMap cobre
   parte do ganho enquanto isso não entra (junto do Google Business, no
   Someday do TASKS.md). */
export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Lírio Pimenta',
    description:
      'Loja de variedades há mais de 40 anos em Viamão/RS: presentes, brinquedos, livraria, tabacaria, utilidades e semijoias.',
    telephone: PHONE,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.city,
      addressRegion: ADDRESS.state,
      addressCountry: 'BR',
    },
    hasMap: MAPS_URL,
    openingHoursSpecification: buildOpeningHours(),
    sameAs: [INSTAGRAM],
    // Enquanto o domínio final não existe, não emite "url" — ver SITE_URL.
    ...(SITE_URL ? { url: SITE_URL } : {}),
  }
}
