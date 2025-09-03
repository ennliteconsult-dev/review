import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Review } from '@/types';

interface ReviewCardProps {
    review: Review;
}

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
        ))}
    </div>
);

export const ReviewCard = ({ review }: ReviewCardProps) => {
    const authorInitial = review.author.name ? review.author.name.charAt(0).toUpperCase() : '?';
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${review.author.name}`} />
                        <AvatarFallback>{authorInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">{review.author.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <StarRating rating={review.rating} />
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{review.comment}</p>
            </CardContent>
        </Card>
    );
};