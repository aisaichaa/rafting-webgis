import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { RaftingProvider } from "@/pages/Dashboard";

interface SearchSidebarProps {
  providers: RaftingProvider[];
  onFilter: (filtered: RaftingProvider[]) => void;
}

export const SearchSidebar = ({ providers, onFilter }: SearchSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  // Function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Get unique facilities and cities (case-insensitive) and sort alphabetically
  const allFacilities = [...new Set(providers.flatMap(p => p.facilities.map(f => f.toLowerCase())))].sort((a, b) => a.localeCompare(b));
  const allCities = [...new Set(providers.map(p => p.cities.name.toLowerCase()))].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    filterProviders();
  }, [searchTerm, priceRange, selectedFacilities, selectedCities]);

  const filterProviders = () => {
    let filtered = providers;

    // Search by name or facilities (case-insensitive)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(searchLower) ||
        provider.facilities.some(facility => 
          facility.toLowerCase().includes(searchLower)
        )
      );
    }

    // Filter by price range
    filtered = filtered.filter(provider => 
      provider.price_per_person >= priceRange[0] && provider.price_per_person <= priceRange[1]
    );

    // Filter by facilities (case-insensitive)
    if (selectedFacilities.length > 0) {
      filtered = filtered.filter(provider => 
        selectedFacilities.some(facility => 
          provider.facilities.some(f => f.toLowerCase() === facility.toLowerCase())
        )
      );
    }

    // Filter by cities (case-insensitive)
    if (selectedCities.length > 0) {
      filtered = filtered.filter(provider => 
        selectedCities.includes(provider.cities.name.toLowerCase())
      );
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 500000]);
    setSelectedFacilities([]);
    setSelectedCities([]);
  };

  const toggleFacility = (facility: string) => {
    const facilityLower = facility.toLowerCase();
    setSelectedFacilities(prev => 
      prev.some(f => f.toLowerCase() === facilityLower)
        ? prev.filter(f => f.toLowerCase() !== facilityLower)
        : [...prev, facility]
    );
  };

  const toggleCity = (city: string) => {
    const cityLower = city.toLowerCase();
    setSelectedCities(prev => 
      prev.some(c => c.toLowerCase() === cityLower)
        ? prev.filter(c => c.toLowerCase() !== cityLower)
        : [...prev, city]
    );
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 rounded-full p-3 shadow-lg"
        >
          <Filter className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-0 left-0 h-full bg-white shadow-lg z-40 w-80 transform transition-transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Search */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or facilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Price Range */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Price Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500000}
                    min={0}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rp {priceRange[0].toLocaleString()}</span>
                    <span>Rp {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allFacilities.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox
                        id={facility}
                        checked={selectedFacilities.includes(facility)}
                        onCheckedChange={() => toggleFacility(facility)}
                      />
                      <Label htmlFor={facility} className="text-sm font-normal">
                        {capitalizeFirstLetter(facility)}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allCities.map((city) => (
                    <div key={city} className="flex items-center space-x-2">
                      <Checkbox
                        id={city}
                        checked={selectedCities.includes(city)}
                        onCheckedChange={() => toggleCity(city)}
                      />
                      <Label htmlFor={city} className="text-sm font-normal">
                        {capitalizeFirstLetter(city)}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
