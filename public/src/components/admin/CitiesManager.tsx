import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Map } from 'lucide-react';
import { citiesService, City } from '@/lib/supabase/cities';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export const CitiesManager = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [newCityName, setNewCityName] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState('');
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const data = await citiesService.getAll();
      setCities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive"
      });
    }
  };

  const validateCoordinates = (text: string): { isValid: boolean; error?: string } => {
    if (!text.trim()) return { isValid: true }; // Empty is valid (optional field)

    const lines = text.trim().split('\n');
    
    // Check if there are any lines
    if (lines.length === 0) {
      return { isValid: false, error: 'No coordinates provided' };
    }

    // Validate each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const parts = line.split('\t');
      
      // Check format
      if (parts.length !== 2) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Expected format "lat\\tlng", got "${line}"` 
        };
      }

      // Check if both parts are valid numbers
      const [lat, lng] = parts.map(Number);
      if (isNaN(lat) || isNaN(lng)) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Invalid numbers in "${line}"` 
        };
      }

      // Validate latitude range (-90 to 90)
      if (lat < -90 || lat > 90) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Latitude must be between -90 and 90, got ${lat}` 
        };
      }

      // Validate longitude range (-180 to 180)
      if (lng < -180 || lng > 180) {
        return { 
          isValid: false, 
          error: `Line ${i + 1}: Longitude must be between -180 and 180, got ${lng}` 
        };
      }
    }

    return { isValid: true };
  };

  const parseCoordinates = (text: string) => {
    const lines = text.trim().split('\n');
    return lines
      .filter(line => line.trim()) // Skip empty lines
      .map(line => {
        const [lat, lng] = line.split('\t').map(Number);
        return { lat, lng };
      });
  };

  const formatCoordinates = (coordinates: { lat: number; lng: number }[] | null) => {
    if (!coordinates) return '';
    return coordinates.map(coord => `${coord.lat}\t${coord.lng}`).join('\n');
  };

  const handleCoordinateChange = (value: string) => {
    setRouteCoordinates(value);
    const validation = validateCoordinates(value);
    setCoordinateError(validation.error || null);
  };

  const handleAdd = async () => {
    if (!newCityName.trim()) return;
    
    // Validate coordinates before proceeding
    const validation = validateCoordinates(routeCoordinates);
    if (!validation.isValid) {
      setCoordinateError(validation.error || null);
      return;
    }
    
    setIsLoading(true);
    try {
      const coordinates = routeCoordinates.trim() 
        ? parseCoordinates(routeCoordinates)
        : undefined;

      const newCity = await citiesService.create(newCityName.trim(), coordinates);
      setCities([...cities, newCity]);
      setNewCityName('');
      setRouteCoordinates('');
      setCoordinateError(null);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "City added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add city",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCity || !newCityName.trim()) return;
    
    // Validate coordinates before proceeding
    const validation = validateCoordinates(routeCoordinates);
    if (!validation.isValid) {
      setCoordinateError(validation.error || null);
      return;
    }
    
    setIsLoading(true);
    try {
      const coordinates = routeCoordinates.trim() 
        ? parseCoordinates(routeCoordinates)
        : undefined;

      const updatedCity = await citiesService.update(
        selectedCity.id,
        newCityName.trim(),
        coordinates
      );
      setCities(cities.map(city => city.id === updatedCity.id ? updatedCity : city));
      setNewCityName('');
      setRouteCoordinates('');
      setCoordinateError(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "City updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update city",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return;
    
    setIsLoading(true);
    try {
      await citiesService.delete(id);
      setCities(cities.filter(city => city.id !== id));
      toast({
        title: "Success",
        description: "City deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete city",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (city: City) => {
    setSelectedCity(city);
    setNewCityName(city.name);
    setRouteCoordinates(formatCoordinates(city.route_coordinates));
    setCoordinateError(null);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Cities</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add City
        </Button>
      </div>

      <div className="grid gap-4">
        {cities.map((city) => (
          <Card key={city.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{city.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(city.created_at).toLocaleDateString()}
                  </p>
                  {city.route_coordinates && (
                    <p className="text-sm text-gray-500 mt-1">
                      <Map className="w-4 h-4 inline mr-1" />
                      {city.route_coordinates.length} route points
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(city)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(city.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add City Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
            <DialogDescription>
              Enter the city name and optional route coordinates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="City name"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Route Coordinates (optional)</label>
              <Textarea
                placeholder="Enter coordinates in format:&#10;lat&#9;lng&#10;lat&#9;lng"
                value={routeCoordinates}
                onChange={(e) => handleCoordinateChange(e.target.value)}
                className={`h-32 font-mono ${coordinateError ? 'border-red-500' : ''}`}
              />
              {coordinateError && (
                <p className="text-sm text-red-500">{coordinateError}</p>
              )}
              <p className="text-sm text-gray-500">
                Enter coordinates separated by tabs and newlines
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setCoordinateError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={isLoading || !newCityName.trim() || !!coordinateError}
              >
                {isLoading ? "Adding..." : "Add City"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit City Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
            <DialogDescription>
              Update the city name and route coordinates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="City name"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Route Coordinates (optional)</label>
              <Textarea
                placeholder="Enter coordinates in format:&#10;lat&#9;lng&#10;lat&#9;lng"
                value={routeCoordinates}
                onChange={(e) => handleCoordinateChange(e.target.value)}
                className={`h-32 font-mono ${coordinateError ? 'border-red-500' : ''}`}
              />
              {coordinateError && (
                <p className="text-sm text-red-500">{coordinateError}</p>
              )}
              <p className="text-sm text-gray-500">
                Enter coordinates separated by tabs and newlines
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setCoordinateError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={isLoading || !newCityName.trim() || !!coordinateError}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
