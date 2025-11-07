import type { WorkerBindings } from '../types/bindings'
import { getDb, dbSchema } from '../lib/db'
import { eq } from 'drizzle-orm'

interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  description?: string
  displayOrder?: number
}

interface Product {
  id: string
  name: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  category: string
  images: string[]
  inStock: boolean
  tags: string[]
}

const CATEGORIES: Category[] = [
  // Main categories
  { id: 'cat-topos', name: 'Topos de Bolo', slug: 'topos-de-bolo', description: 'Topos personalizados para bolos', displayOrder: 1 },
  { id: 'cat-bolos', name: 'Bolos Personalizados', slug: 'bolos-personalizados', description: 'Bolos decorados e personalizados', displayOrder: 2 },
  { id: 'cat-acessorios', name: 'Acessórios de Bolo', slug: 'acessorios-bolo', description: 'Acessórios e decorações para bolos', displayOrder: 3 },
  { id: 'cat-temas', name: 'Temas para Festas', slug: 'temas-festas', description: 'Decorações por temas populares', displayOrder: 4 },
  { id: 'cat-ocasioes', name: 'Por Ocasião', slug: 'por-ocasiao', description: 'Produtos por tipo de evento', displayOrder: 5 },

  // Subcategories - Topos
  { id: 'cat-topos-classicos', name: 'Topos Clássicos', slug: 'topos-classicos', parentId: 'cat-topos' },
  { id: 'cat-topos-tematicos', name: 'Topos Temáticos', slug: 'topos-tematicos', parentId: 'cat-topos' },
  { id: 'cat-topos-personalizados', name: 'Topos Personalizados', slug: 'topos-personalizados', parentId: 'cat-topos' },

  // Subcategories - Temas
  { id: 'cat-tema-frozen', name: 'Festa Frozen', slug: 'festa-frozen', parentId: 'cat-temas' },
  { id: 'cat-tema-barbie', name: 'Festa Barbie', slug: 'festa-barbie', parentId: 'cat-temas' },
  { id: 'cat-tema-pokemon', name: 'Festa Pokémon', slug: 'festa-pokemon', parentId: 'cat-temas' },
  { id: 'cat-tema-harry-potter', name: 'Festa Harry Potter', slug: 'festa-harry-potter', parentId: 'cat-temas' },
  { id: 'cat-tema-minions', name: 'Festa Minions', slug: 'festa-minions', parentId: 'cat-temas' },
  { id: 'cat-tema-lol', name: 'Festa LOL', slug: 'festa-lol', parentId: 'cat-temas' },
  { id: 'cat-tema-unicornio', name: 'Festa Unicórnio', slug: 'festa-unicornio', parentId: 'cat-temas' },
  { id: 'cat-tema-princesas', name: 'Festa Princesas', slug: 'festa-princesas', parentId: 'cat-temas' },
  { id: 'cat-tema-dinossauros', name: 'Festa Dinossauros', slug: 'festa-dinossauros', parentId: 'cat-temas' },
  { id: 'cat-tema-space', name: 'Festa Espaço', slug: 'festa-espaco', parentId: 'cat-temas' },

  // Subcategories - Ocasiões
  { id: 'cat-ocasiao-aniversario', name: 'Aniversário', slug: 'ocasiao-aniversario', parentId: 'cat-ocasioes' },
  { id: 'cat-ocasiao-casamento', name: 'Casamento', slug: 'ocasiao-casamento', parentId: 'cat-ocasioes' },
  { id: 'cat-ocasiao-batizado', name: 'Batizado', slug: 'ocasiao-batizado', parentId: 'cat-ocasioes' },
  { id: 'cat-ocasiao-natal', name: 'Natal', slug: 'ocasiao-natal', parentId: 'cat-ocasioes' },
  { id: 'cat-ocasiao-halloween', name: 'Halloween', slug: 'ocasiao-halloween', parentId: 'cat-ocasioes' },
  { id: 'cat-ocasiao-ano-novo', name: 'Ano Novo', slug: 'ocasiao-ano-novo', parentId: 'cat-ocasioes' },
  { id: 'cat-ocasiao-pascoa', name: 'Páscoa', slug: 'ocasiao-pascoa', parentId: 'cat-ocasioes' },

  // Acessórios
  { id: 'cat-acess-bonecos', name: 'Bonecos para Bolo', slug: 'bonecos-bolo', parentId: 'cat-acessorios' },
  { id: 'cat-acess-velas', name: 'Velas e Números', slug: 'velas-numeros', parentId: 'cat-acessorios' },
  { id: 'cat-acess-bases', name: 'Bases e Suportes', slug: 'bases-suportes', parentId: 'cat-acessorios' },
  { id: 'cat-acess-decoracao', name: 'Decoração Bolo', slug: 'decoracao-bolo', parentId: 'cat-acessorios' },
]

const PRODUCTS: Product[] = [
  // Topos Clássicos
  {
    id: 'prod-topo-dourado',
    name: 'Topo Dourado Premium',
    description: 'Topo acrílico dourado com acabamento premium, ideal para bolos de aniversário elegantes.',
    shortDescription: 'Topo dourado premium',
    price: 12.99,
    originalPrice: 16.99,
    category: 'topos-classicos',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'dourado', 'classico', 'premium'],
  },
  {
    id: 'prod-topo-prata',
    name: 'Topo Prata Premium',
    description: 'Topo acrílico prata com acabamento premium, perfeito para celebrações elegantes.',
    shortDescription: 'Topo prata premium',
    price: 12.99,
    originalPrice: 16.99,
    category: 'topos-classicos',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'prata', 'classico', 'premium'],
  },
  {
    id: 'prod-topo-rosa',
    name: 'Topo Rosa Pastel',
    description: 'Topo acrílico rosa pastel, ideal para bolos femininos e festas temáticas.',
    shortDescription: 'Topo rosa pastel',
    price: 11.99,
    category: 'topos-classicos',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'rosa', 'pastel'],
  },

  // Topos Temáticos
  {
    id: 'prod-topo-frozen',
    name: 'Topo Frozen - Elsa e Anna',
    description: 'Topo temático Frozen com personagens Elsa e Anna. Perfeito para festas de princesas.',
    shortDescription: 'Topo Frozen temático',
    price: 14.99,
    category: 'topos-tematicos',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'frozen', 'tematico', 'princesa'],
  },
  {
    id: 'prod-topo-barbie',
    name: 'Topo Barbie - Dream House',
    description: 'Topo temático Barbie com a casa dos sonhos. Ideal para meninas que amam Barbie.',
    shortDescription: 'Topo Barbie Dream House',
    price: 14.99,
    category: 'topos-tematicos',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'barbie', 'tematico'],
  },
  {
    id: 'prod-topo-pokemon',
    name: 'Topo Pokémon - Pikachu',
    description: 'Topo temático com Pikachu, o icónico personagem Pokémon. Para fãs de todas as idades.',
    shortDescription: 'Topo Pokémon Pikachu',
    price: 13.99,
    category: 'topos-tematicos',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'pokemon', 'tematico', 'pikachu'],
  },

  // Topos Personalizados
  {
    id: 'prod-topo-personalizado-nome',
    name: 'Topo Personalizado com Nome',
    description: 'Topo 100% personalizado com nome da criança e idade. Entrega sob encomenda.',
    shortDescription: 'Topo personalizado com nome',
    price: 18.99,
    originalPrice: 24.99,
    category: 'topos-personalizados',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'personalizado', 'nome', 'custom'],
  },
  {
    id: 'prod-topo-personalizado-foto',
    name: 'Topo Personalizado com Foto',
    description: 'Topo personalizado com a foto da criança. Design único e especial.',
    shortDescription: 'Topo com foto personalizada',
    price: 22.99,
    originalPrice: 29.99,
    category: 'topos-personalizados',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['topo', 'personalizado', 'foto', 'custom'],
  },

  // Bolos Personalizados
  {
    id: 'prod-bolo-chocolate',
    name: 'Bolo de Chocolate Personalizado',
    description: 'Delicioso bolo de chocolate com cobertura de ganache. Design personalizado.',
    shortDescription: 'Bolo chocolate com design custom',
    price: 35.99,
    originalPrice: 45.99,
    category: 'bolos-personalizados',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['bolo', 'chocolate', 'personalizado', 'aniversario'],
  },
  {
    id: 'prod-bolo-morango',
    name: 'Bolo de Morango Temático',
    description: 'Bolo fresco de morango com cobertura de chantilly. Com decoração temática.',
    shortDescription: 'Bolo morango com tema',
    price: 38.99,
    originalPrice: 48.99,
    category: 'bolos-personalizados',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['bolo', 'morango', 'tematico', 'aniversario'],
  },
  {
    id: 'prod-bolo-casamento',
    name: 'Bolo de Casamento Elegante',
    description: 'Bolo em camadas com cobertura de pasta de açúcar e decoração elegante.',
    shortDescription: 'Bolo de casamento elegante',
    price: 89.99,
    originalPrice: 119.99,
    category: 'bolos-personalizados',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['bolo', 'casamento', 'elegante', 'ocasiao'],
  },

  // Acessórios
  {
    id: 'prod-acess-velas-numeros',
    name: 'Velas Números 0-9',
    description: 'Conjunto de velas de números de 0 a 9. Ideal para completar a idade no bolo.',
    shortDescription: 'Velas números 0-9',
    price: 5.99,
    category: 'velas-numeros',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['velas', 'numeros', 'acessorio', 'bolo'],
  },
  {
    id: 'prod-acess-base-dourada',
    name: 'Base Dourada para Bolo',
    description: 'Base de papel dourado para bolo. Diversas tamanhos disponíveis.',
    shortDescription: 'Base dourada para bolo',
    price: 3.99,
    category: 'bases-suportes',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['base', 'dourada', 'acessorio', 'suporte'],
  },
  {
    id: 'prod-acess-bonecos-animais',
    name: 'Bonecos Animais para Bolo',
    description: 'Conjunto de 4 bonecos de animais em plástico. Perfeito para bolos infantis.',
    shortDescription: 'Bonecos animais pack 4',
    price: 8.99,
    category: 'bonecos-bolo',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60',
    ],
    inStock: true,
    tags: ['bonecos', 'animais', 'acessorio', 'bolo'],
  },
]

export async function seedPartyland(env: WorkerBindings) {
  const db = getDb(env)
  const { categories, products } = dbSchema
  const now = new Date().toISOString()

  console.log('🌱 Iniciando seed Partyland categories and products...')

  try {
    // Insert categories
    for (const category of CATEGORIES) {
      const exists = await db.query.categories
        .findFirst({ where: eq(categories.slug, category.slug) })
        .catch(() => null)

      if (!exists) {
        await db.insert(categories).values({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          parentId: category.parentId,
          displayOrder: category.displayOrder || 0,
        })
        console.log(`✓ Categoria criada: ${category.name}`)
      }
    }

    // Insert products
    for (const product of PRODUCTS) {
      const exists = await db.query.products
        .findFirst({ where: eq(products.id, product.id) })
        .catch(() => null)

      if (!exists) {
        await db.insert(products).values({
          id: product.id,
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          images: product.images,
          inStock: product.inStock,
          tags: product.tags,
          createdAt: now,
          updatedAt: now,
        })
        console.log(`✓ Produto criado: ${product.name}`)
      }
    }

    console.log('✅ Seed Partyland concluído com sucesso!')
    return { success: true, categoriesAdded: CATEGORIES.length, productsAdded: PRODUCTS.length }
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error)
    throw error
  }
}
