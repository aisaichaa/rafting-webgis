import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Phone, Globe, ArrowLeft } from "lucide-react";
import { RaftingProvider } from "./Dashboard";
import { destinationsService } from "@/lib/supabase/destinations";
import { reviewsService, Review } from "@/lib/supabase/reviews";
import { useAuth } from "@/contexts/AuthContext";

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState<RaftingProvider | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProvider();
    }
  }, [id]);

  useEffect(() => {
    if (provider) {
      document.title = `${provider.name} - RaftingPro`;
    } else {
      document.title = "Provider Details - RaftingPro";
    }
  }, [provider]);

  const loadProvider = async () => {
    try {
      setIsLoading(true);
      const destination = await destinationsService.getById(id!);
      if (destination) {
        // Get reviews for this destination
        const reviews = await reviewsService.getByDestinationId(destination.id);
        // Calculate average rating
        const rating = reviews.length > 0 
          ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
          : 0;

        // Transform destination to match RaftingProvider interface
        const provider: RaftingProvider = {
          ...destination,
          rating,
          reviews
        };
        setProvider(provider);
      }
    } catch (error) {
      console.error('Error loading provider:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (rating > 0 && comment.trim() && provider) {
      try {
        const newReview = await reviewsService.create({
          destination_id: provider.id,
          user_id: user.id,
          user_name: user.email?.split('@')[0] || "Anonymous",
          rating,
          comment
        });

        // Update the provider's reviews and rating
        const updatedReviews = [newReview, ...provider.reviews];
        const newRating = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) / updatedReviews.length;

        setProvider({
          ...provider,
          reviews: updatedReviews,
          rating: newRating
        });

        // Reset form
        setRating(0);
        setComment("");
      } catch (error) {
        console.error('Error submitting review:', error);
      }
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
            className={`h-6 w-6 ${interactive ? 'cursor-pointer' : ''} transition-colors ${
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading provider details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img 
            src={provider.image_url || '/images/default-destination.jpg'} 
            alt={provider.name}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-600">{provider.cities.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(provider.rating)}
                  <span className="text-sm text-gray-600">({provider.rating})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-600">
                  Rp {provider.price_per_person.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per person</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {provider.facilities.map((facility) => (
                  <Badge key={facility} variant="secondary">
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="flex space-x-6">
                {provider.contact && (
                  <a 
                    href={`tel:${provider.contact}`}
                    className="flex items-center space-x-2 text-teal-600 hover:text-teal-700"
                  >
                    <Phone className="h-5 w-5" />
                    <span>{provider.contact}</span>
                  </a>
                )}
                {provider.website && (
                  <a 
                    href={`http://${provider.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-teal-600 hover:text-teal-700"
                  >
                    <Globe className="h-5 w-5" />
                    <span>{provider.website}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Leave Review Section */}
            <div className="border-t pt-8 mb-8">
              <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  {renderStars(rating, true)}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="min-h-[100px]"
                  />
                </div>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || !comment.trim()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Submit Review
                </Button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold mb-4">Reviews ({provider.reviews.length})</h3>
              {provider.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-6">
                  {provider.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.user_name}</span>
                          <span className="text-gray-500 text-sm">{formatDate(review.created_at)}</span>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;
