import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { RaftingMap } from "@/components/RaftingMap";
import { SearchSidebar } from "@/components/SearchSidebar";
import { ReviewModal } from "@/components/ReviewModal";
import { destinationsService, Destination } from "@/lib/supabase/destinations";
import { citiesService, City } from "@/lib/supabase/cities";
import { reviewsService, Review } from "@/lib/supabase/reviews";

export interface RaftingProvider extends Destination {
  cities: City;
  rating: number;
  reviews: Review[];
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<RaftingProvider | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<RaftingProvider[]>([]);
  const [allProviders, setAllProviders] = useState<RaftingProvider[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard - RaftingPro";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const destinations = await destinationsService.getAll();
      console.log('Raw destinations data:', destinations);
      
      // Transform destinations to match RaftingProvider interface
      const providers = await Promise.all(destinations.map(async dest => {
        console.log('Processing destination:', dest);
        // Get reviews for this destination
        const reviews = await reviewsService.getByDestinationId(dest.id);
        // Calculate average rating
        const rating = reviews.length > 0 
          ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
          : 0;

        return {
          ...dest,
          rating,
          reviews
        };
      }));
      
      console.log('Transformed providers:', providers);
      setAllProviders(providers);
      setFilteredProviders(providers);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (selectedProvider && user) {
      try {
        const newReview = await reviewsService.create({
          destination_id: selectedProvider.id,
          user_id: user.id,
          user_name: user.email?.split('@')[0] || "Anonymous",
          rating,
          comment
        });

        // Update the provider's reviews and rating
        const updatedProvider = {
          ...selectedProvider,
          reviews: [newReview, ...selectedProvider.reviews],
          rating: (selectedProvider.rating * selectedProvider.reviews.length + rating) / (selectedProvider.reviews.length + 1)
        };

        // Update the providers lists
        setAllProviders(prev => 
          prev.map(p => p.id === selectedProvider.id ? updatedProvider : p)
        );
        setFilteredProviders(prev => 
          prev.map(p => p.id === selectedProvider.id ? updatedProvider : p)
        );

        setShowReviewModal(false);
      } catch (error) {
        console.error('Error submitting review:', error);
      }
    }
  };

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SearchSidebar 
          providers={allProviders}
          onFilter={setFilteredProviders}
        />
        <main className="flex-1 h-full">
          <RaftingMap 
            providers={filteredProviders}
            onProviderSelect={setSelectedProvider}
            onReviewClick={() => setShowReviewModal(true)}
          />
        </main>
      </div>
      
      {selectedProvider && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          provider={selectedProvider}
          onSubmitReview={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;
