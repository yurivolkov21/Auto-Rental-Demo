interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: {
        name: string;
        profile_photo?: string;
    };
}

interface CarReviewsProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

/**
 * Car Reviews Section
 * Display customer reviews with ratings
 * Clean, readable design with star ratings
 */
export function CarReviews({ reviews, averageRating, totalReviews }: CarReviewsProps) {
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (reviews.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
                <p className="text-gray-500">No reviews yet. Be the first to review this car!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                    </span>
                    <div className="flex flex-col">
                        {renderStars(Math.round(averageRating))}
                        <span className="text-sm text-gray-500">{totalReviews} reviews</span>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                            {/* User Avatar */}
                            <div className="flex-shrink-0">
                                {review.user.profile_photo ? (
                                    <img
                                        src={review.user.profile_photo}
                                        alt={review.user.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                        {review.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Review Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-gray-900">
                                        {review.user.name}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(review.created_at)}
                                    </span>
                                </div>
                                <div className="mb-2">{renderStars(review.rating)}</div>
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
