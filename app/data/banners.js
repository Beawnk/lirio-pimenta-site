/* Slides do carrossel do topo.

   O primeiro é a própria loja — é o hero que já existia. Os outros são os
   serviços, que por regra NÃO entram no carrinho: cada um leva direto para
   o WhatsApp com uma mensagem própria, porque conserto e personalização se
   orçam conversando.

   `image` é a chave lógica de <ProductImage>. Enquanto o Lírio não mandar
   uma foto por serviço, os slides reaproveitam fotos reais da loja.

   Ações possíveis:
   - anchor:   rola para uma seção do site
   - whatsapp: abre a conversa com a mensagem pronta
   - category: filtra o catálogo por uma categoria */
export const BANNERS = [
  {
    id: 'loja',
    label: 'A loja',
    image: 'fachada',
    eyebrow: 'Mais de 40 anos ao lado de Viamão',
    title: 'Há mais de 40 anos ao lado de Viamão.',
    text: 'Uma loja de variedades, presentes e descobertas para todos os momentos. Tudo que você procura, em um só lugar.',
    instagram: true,
    actions: [
      { kind: 'anchor', href: '#catalogo', label: 'Explorar produtos', style: 'gold' },
      {
        kind: 'whatsapp',
        label: 'Falar pelo WhatsApp',
        message: 'Olá! Vim pelo site da Lírio Pimenta.',
        style: 'wa',
      },
    ],
  },
  {
    id: 'canecas',
    label: 'Canecas',
    image: 'pessoas',
    eyebrow: 'Feito para você',
    title: 'Canecas personalizadas.',
    text: 'Foto, nome, frase ou a arte que você quiser. Presente de aniversário, lembrança de festa ou brinde para a equipe.',
    actions: [
      {
        kind: 'whatsapp',
        label: 'Pedir orçamento',
        message: 'Olá! Quero fazer uma caneca personalizada. Pode me passar o orçamento?',
        style: 'gold',
      },
    ],
  },
  {
    id: 'canetas',
    label: 'Canetas',
    image: 'interior2',
    eyebrow: 'Feito para você',
    title: 'Canetas personalizadas.',
    text: 'Nome, logo ou mensagem gravados. Ótimas para brinde de empresa, lembrancinha de formatura e casamento.',
    actions: [
      {
        kind: 'whatsapp',
        label: 'Pedir orçamento',
        message: 'Olá! Quero encomendar canetas personalizadas. Pode me passar o orçamento?',
        style: 'gold',
      },
    ],
  },
  {
    id: 'relogios',
    label: 'Relógios',
    image: 'interior',
    eyebrow: 'Serviço da loja',
    title: 'Conserto de relógio.',
    text: 'Troca de pilha, ajuste de pulseira e reparo. Traga o seu na loja e a gente avalia na hora.',
    actions: [
      {
        kind: 'whatsapp',
        label: 'Falar sobre o conserto',
        message: 'Olá! Preciso consertar um relógio. Vocês podem dar uma olhada?',
        style: 'gold',
      },
    ],
  },
  {
    id: 'tabacaria',
    label: 'Tabacaria',
    image: 'tabacaria',
    eyebrow: 'Sempre com reposição',
    title: 'Tabacaria completa.',
    text: 'Palha, fumo em ramo, sedas e acessórios. Chega reposição toda semana — se não estiver na prateleira, pergunte.',
    actions: [
      { kind: 'category', category: 'Tabacaria', label: 'Ver no catálogo', style: 'gold' },
      {
        kind: 'whatsapp',
        label: 'Perguntar o que chegou',
        message: 'Olá! Quero saber o que chegou na tabacaria.',
        style: 'wa',
      },
    ],
  },
  {
    id: 'agua',
    label: 'Água',
    image: 'agua',
    eyebrow: 'Direto na loja',
    title: 'Água mineral e galão.',
    text: 'Garrafões e água mineral, prontos para levar embora. Sem precisar rodar a cidade.',
    actions: [
      {
        kind: 'whatsapp',
        label: 'Perguntar disponibilidade',
        message: 'Olá! Vocês têm água mineral ou galão disponível agora?',
        style: 'gold',
      },
    ],
  },
]
