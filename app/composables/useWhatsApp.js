import { WHATSAPP } from '~/data/store-info'

/* Todo caminho que sai do site termina aqui: o site não vende, ele leva o
   cliente para a conversa com a mensagem já escrita. */
export function useWhatsApp() {
  const waLink = (message = '') =>
    `https://wa.me/${WHATSAPP}` + (message ? `?text=${encodeURIComponent(message)}` : '')

  /* Mensagem padrão de quem chegou pelo site, sem produto específico. */
  const greetingLink = () => waLink('Olá! Vim pelo site da Lírio Pimenta.')

  /* Produto sob consulta: o cliente pergunta preço e disponibilidade. */
  const consultLink = (productName) =>
    waLink(
      `Olá! Vi "${productName}" no site da Lírio Pimenta e gostaria de saber o preço e a disponibilidade.`,
    )

  return { waLink, greetingLink, consultLink }
}
