import type { InferSelectModel } from 'drizzle-orm'
import { cartItems, products, reviews } from '../models/schema'

export type ProductEntity = InferSelectModel<typeof products>
export type ReviewEntity = InferSelectModel<typeof reviews>
export type CartItemEntity = InferSelectModel<typeof cartItems>

export function serializeProduct(product: ProductEntity) {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? '',
    shortDescription: product.shortDescription ?? '',
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    category: product.category,
    images: product.images ?? [],
    rating: product.rating ? Number(product.rating) : 0,
    reviewCount: product.reviewCount ?? 0,
    inStock: Boolean(product.inStock),
    tags: product.tags ?? [],
    createdAt: product.createdAt ?? '',
    updatedAt: product.updatedAt ?? '',
  }
}

export function serializeReview(review: ReviewEntity) {
  return {
    id: review.id,
    productId: review.productId,
    author: review.author,
    rating: review.rating ?? 0,
    title: review.title,
    content: review.content,
    verified: Boolean(review.verified),
    helpful: review.helpful ?? 0,
    images: review.images ?? [],
    createdAt: review.createdAt ?? '',
  }
}

export function serializeCartItem(item: CartItemEntity, product?: ProductEntity) {
  return {
    id: item.id,
    userId: item.userId,
    productId: item.productId,
    quantity: item.quantity ?? 1,
    addedAt: item.addedAt ?? '',
    product: product ? serializeProduct(product) : undefined,
  }
}
