import { Star, ThumbsUp } from 'lucide-react'
import type { Review } from '@types'
import { formatDate } from '@lib/utils'

interface ReviewCardProps {
  review: Review
  onHelpful?: (reviewId: string) => void
}

export function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  return (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-secondary">{review.author}</p>
          <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
        </div>
        {review.verified && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            ✓ Compra Verificada
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < review.rating ? 'fill-primary text-primary' : 'text-gray-300'}
          />
        ))}
      </div>

      <h4 className="font-semibold text-sm mb-2">{review.title}</h4>
      <p className="text-sm text-gray-700 mb-4">{review.content}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Review"
              className="w-16 h-16 rounded object-cover"
            />
          ))}
        </div>
      )}

      <button
        onClick={() => onHelpful?.(review.id)}
        className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary transition-colors"
      >
        <ThumbsUp size={14} />
        Útil ({review.helpful})
      </button>
    </div>
  )
}
