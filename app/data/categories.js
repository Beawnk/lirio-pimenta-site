/* `image` é a chave lógica de <ProductImage>, não um caminho de arquivo.
   `emoji` sai numa tarefa futura, quando entrarem os ícones SVG. */
export const CATEGORIES = [
  { name: 'Presentes', emoji: '🎁', image: 'presente', desc: 'Para surpreender alguém especial.' },
  { name: 'Brinquedos', emoji: '🧸', image: 'interior', desc: 'Diversão para diferentes idades.' },
  { name: 'Livraria', emoji: '📚', image: 'interior', desc: 'Leitura, estudo e papelaria.' },
  { name: 'Tabacaria', emoji: '🚬', image: 'tabacaria', desc: 'Produtos e acessórios de tabacaria.' },
  { name: 'Semijoias', emoji: '💎', image: 'presente', desc: 'Detalhes para presentear ou usar.' },
  { name: 'Utilidades', emoji: '🏠', image: 'pilhas', desc: 'Coisas úteis para o dia a dia.' },
  { name: 'Bolsas e Mochilas', emoji: '🎒', image: 'fachada2', desc: 'Escola, trabalho e passeio.' },
  { name: 'Esportes', emoji: '⚽', image: 'fachada', desc: 'Bolas e artigos esportivos.' },
]

/* Atalhos da seção de presentes: cada um cai numa categoria do catálogo. */
export const GIFT_CHIPS = [
  { label: 'Para crianças', emoji: '🧒', category: 'Brinquedos' },
  { label: 'Para ela', emoji: '💐', category: 'Semijoias' },
  { label: 'Para ele', emoji: '🧢', category: 'Presentes' },
  { label: 'Para amigos', emoji: '🤝', category: 'Presentes' },
  { label: 'Datas especiais', emoji: '🎉', category: 'Presentes' },
  { label: 'Lembranças', emoji: '💝', category: 'Presentes' },
  { label: 'Presentes rápidos', emoji: '⚡', category: 'Presentes' },
]

export const findCategory = (name) => CATEGORIES.find((c) => c.name === name)
