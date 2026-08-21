/* `image` é a chave lógica de <ProductImage>, não um caminho de arquivo.
   `icon` é a chave de <AppIcon>, não um componente — dados aqui não conhecem Vue. */
export const CATEGORIES = [
  { name: 'Presentes', icon: 'gift', image: 'presente', desc: 'Para surpreender alguém especial.' },
  { name: 'Brinquedos', icon: 'blocks', image: 'interior', desc: 'Diversão para diferentes idades.' },
  { name: 'Livraria', icon: 'book', image: 'interior', desc: 'Leitura, estudo e papelaria.' },
  { name: 'Tabacaria', icon: 'flame', image: 'tabacaria', desc: 'Produtos e acessórios de tabacaria.' },
  { name: 'Semijoias', icon: 'gem', image: 'presente', desc: 'Detalhes para presentear ou usar.' },
  { name: 'Utilidades', icon: 'home', image: 'pilhas', desc: 'Coisas úteis para o dia a dia.' },
  { name: 'Bolsas e Mochilas', icon: 'backpack', image: 'fachada2', desc: 'Escola, trabalho e passeio.' },
  { name: 'Esportes', icon: 'ball', image: 'fachada', desc: 'Bolas e artigos esportivos.' },
]

/* Atalhos da seção de presentes: cada um cai numa categoria do catálogo. */
export const GIFT_CHIPS = [
  { label: 'Para crianças', icon: 'baby', category: 'Brinquedos' },
  { label: 'Para ela', icon: 'flower', category: 'Semijoias' },
  { label: 'Para ele', icon: 'shirt', category: 'Presentes' },
  { label: 'Para amigos', icon: 'handshake', category: 'Presentes' },
  { label: 'Datas especiais', icon: 'party', category: 'Presentes' },
  { label: 'Lembranças', icon: 'tag', category: 'Presentes' },
  { label: 'Presentes rápidos', icon: 'zap', category: 'Presentes' },
]

export const findCategory = (name) => CATEGORIES.find((c) => c.name === name)
