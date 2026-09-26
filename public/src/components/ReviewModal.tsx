import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Globe, X } from "lucide-react";
import { RaftingProvider } from "@/pages/Dashboard";
import { Review } from "@/lib/supabase/reviews";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: RaftingProvider;
  onSubmitReview: (rating: number, comment: string) => void;
}

export const ReviewModal = ({ isOpen, onClose, provider, onSubmitReview }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating > 0 && comment.trim()) {
      onSubmitReview(rating, comment);
      setRating(0);
      setComment("");
    }
  };

  const renderStars = (currentRating: number, interactive = false) => {
    if (currentRating === 0 && !interactive) {
      return <span className="text-sm text-gray-500">No reviews yet</span>;
    }

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= (interactive ? (hoveredRating || rating) : currentRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[10000]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {provider.name}
          </DialogTitle>
          <DialogDescription>
            View details and leave a review for this rafting provider
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Info */}
          <div className="space-y-4">
            <img 
              src={provider.image_url || '/images/default-destination.jpg'} 
              alt={provider.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{provider.cities.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(provider.rating)}
                  <span className="text-sm text-gray-600">({provider.rating.toFixed(1)})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">
                  Rp {provider.price_per_person.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per person</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {provider.facilities.map((facility) => (
                <Badge key={facility} variant="secondary">
                  {facility}
                </Badge>
              ))}
            </div>

            <div className="flex space-x-4">
              {provider.contact && (
                <a 
                  href={`tel:${provider.contact}`}
                  className="flex items-center space-x-2 text-teal-600 hover:text-teal-700"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </a>
              )}
              {provider.website && (
                <a 
                  href={`http://${provider.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-teal-600 hover:text-teal-700"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Leave Review */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                {renderStars(rating, true)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <Textarea
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={rating === 0 || !comment.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Submit Review
              </Button>
            </div>
          </div>

          {/* Previous Reviews */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Reviews ({provider.reviews.length})</h3>
            {provider.reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {provider.reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.user_name}</span>
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
