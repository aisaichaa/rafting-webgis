import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { destinationsService, Destination } from "@/lib/supabase/destinations";
import { citiesService, City } from "@/lib/supabase/cities";
import { reviewsService, Review } from "@/lib/supabase/reviews";

interface RaftingPlace extends Destination {
  cities: City;
  rating: number;
  reviews: Review[];
}

const Landing = () => {
  const { user, signOut } = useAuth();
  const [topRaftingPlaces, setTopRaftingPlaces] = useState<RaftingPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => {
    document.title = "RaftingPro - Your Gateway to Adventure";
  }, []);

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const destinations = await destinationsService.getAll();
      
      // Transform destinations to match RaftingPlace interface
      const places = await Promise.all(destinations.map(async dest => {
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

      // Sort by rating and take top 3
      const topPlaces = places.sort((a, b) => b.rating - a.rating).slice(0, 3);
      setTopRaftingPlaces(topPlaces);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-teal-600">
                RaftingPro
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" className="text-teal-600 hover:text-teal-700">
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-teal-600 hover:text-teal-700">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Adventure Awaits on the
            <span className="text-teal-600 block">Rapids</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the most thrilling rafting experiences across Indonesia. 
            From gentle family rides to extreme white-water adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6">
                Start Your Adventure
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Maps</h3>
              <p className="text-gray-600">Explore rafting locations with detailed interactive maps and route information.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Reviews</h3>
              <p className="text-gray-600">Read authentic reviews from fellow adventurers and share your experiences.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Photo Gallery</h3>
              <p className="text-gray-600">View stunning photos and videos from each rafting destination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rafting Places */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Top Rated Adventures</h2>
            <p className="text-xl text-gray-600">Discover the most popular rafting destinations</p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading destinations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topRaftingPlaces.map((place) => (
                <Card key={place.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative">
                    <img 
                      src={place.image_url || '/images/default-destination.jpg'} 
                      alt={place.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-white text-teal-600">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {place.rating.toFixed(1)}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{place.cities.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {place.facilities.map((facility) => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-teal-600">
                        Rp {place.price_per_person.toLocaleString()}
                      </span>
                      <Link to={`/provider/${place.id}`}>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-teal-400 mb-4">RaftingPro</h3>
          <p className="text-gray-400 mb-6">Your gateway to unforgettable rafting adventures</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
