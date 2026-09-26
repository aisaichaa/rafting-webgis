import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, MapPin, Phone, Globe, Image as ImageIcon } from 'lucide-react';
import { destinationsService, Destination } from '@/lib/supabase/destinations';
import { citiesService, City } from '@/lib/supabase/cities';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';

const DEFAULT_IMAGE = '/images/default-destination.jpg';

export const DestinationsManager = () => {
  const [destinations, setDestinations] = useState<(Destination & { cities: City })[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [price, setPrice] = useState('');
  const [facilities, setFacilities] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [cityId, setCityId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [destinationsData, citiesData] = await Promise.all([
        destinationsService.getAll(),
        citiesService.getAll()
      ]);
      setDestinations(destinationsData);
      setCities(citiesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!latitude.trim()) {
      newErrors.latitude = 'Latitude is required';
    } else {
      const lat = Number(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
    }

    if (!longitude.trim()) {
      newErrors.longitude = 'Longitude is required';
    } else {
      const lng = Number(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = Number(price.replace(/[^0-9]/g, ''));
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    if (!facilities.trim()) {
      newErrors.facilities = 'Facilities are required';
    }

    if (!cityId) {
      newErrors.cityId = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `destinations/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const newDestination = await destinationsService.create({
        name: name.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        price_per_person: Number(price.replace(/[^0-9]/g, '')),
        facilities: facilities.split(',').map(f => f.trim()),
        contact: contact.trim() || null,
        website: website.trim() || null,
        image_url: imageUrl,
        city_id: cityId
      });

      setDestinations([...destinations, newDestination]);
      resetForm();
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Destination added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add destination",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDestination || !validateForm()) return;
    
    setIsLoading(true);
    try {
      let imageUrl = selectedDestination.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const updatedDestination = await destinationsService.update(selectedDestination.id, {
        name: name.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        price_per_person: Number(price.replace(/[^0-9]/g, '')),
        facilities: facilities.split(',').map(f => f.trim()),
        contact: contact.trim() || null,
        website: website.trim() || null,
        image_url: imageUrl,
        city_id: cityId
      });

      setDestinations(destinations.map(d => 
        d.id === updatedDestination.id ? { ...updatedDestination, cities: d.cities } : d
      ));
      resetForm();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Destination updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update destination",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    
    setIsLoading(true);
    try {
      await destinationsService.delete(id);
      setDestinations(destinations.filter(d => d.id !== id));
      toast({
        title: "Success",
        description: "Destination deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLatitude('');
    setLongitude('');
    setPrice('');
    setFacilities('');
    setContact('');
    setWebsite('');
    setCityId('');
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const openEditDialog = (destination: Destination) => {
    setSelectedDestination(destination);
    setName(destination.name);
    setLatitude(destination.latitude.toString());
    setLongitude(destination.longitude.toString());
    setPrice(destination.price_per_person.toString());
    setFacilities(destination.facilities.join(', '));
    setContact(destination.contact || '');
    setWebsite(destination.website || '');
    setCityId(destination.city_id);
    setImagePreview(destination.image_url);
    setErrors({});
    setIsEditDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Destinations</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Destination
        </Button>
      </div>

      <div className="grid gap-4">
        {destinations.map((destination) => (
          <Card key={destination.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={destination.image_url || DEFAULT_IMAGE}
                    alt={destination.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{destination.name}</h3>
                      <p className="text-sm text-gray-500">
                        {destination.cities.name}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {destination.latitude}, {destination.longitude}
                        </p>
                        <p className="text-sm font-medium">
                          {formatPrice(destination.price_per_person)}
                        </p>
                        {destination.contact && (
                          <p className="text-sm flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {destination.contact}
                          </p>
                        )}
                        {destination.website && (
                          <p className="text-sm flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            <a 
                              href={destination.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {destination.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(destination)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(destination.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Facilities:</span>{' '}
                      {destination.facilities.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? 'Add New Destination' : 'Edit Destination'}
            </DialogTitle>
            <DialogDescription>
              {isAddDialogOpen 
                ? 'Enter the destination details'
                : 'Update the destination details'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional. Leave empty to use default image.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Destination name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude</label>
                <Input
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={errors.latitude ? 'border-red-500' : ''}
                />
                {errors.latitude && (
                  <p className="text-sm text-red-500">{errors.latitude}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude</label>
                <Input
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={errors.longitude ? 'border-red-500' : ''}
                />
                {errors.longitude && (
                  <p className="text-sm text-red-500">{errors.longitude}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price per Person</label>
              <Input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Facilities</label>
              <Textarea
                placeholder="Enter facilities separated by commas"
                value={facilities}
                onChange={(e) => setFacilities(e.target.value)}
                className={errors.facilities ? 'border-red-500' : ''}
              />
              {errors.facilities && (
                <p className="text-sm text-red-500">{errors.facilities}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact (Optional)</label>
              <Input
                placeholder="Contact information"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website (Optional)</label>
              <Input
                placeholder="Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select
                value={cityId}
                onValueChange={setCityId}
              >
                <SelectTrigger className={errors.cityId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cityId && (
                <p className="text-sm text-red-500">{errors.cityId}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={isAddDialogOpen ? handleAdd : handleEdit}
                disabled={isLoading}
              >
                {isLoading 
                  ? (isAddDialogOpen ? "Adding..." : "Saving...")
                  : (isAddDialogOpen ? "Add Destination" : "Save Changes")
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
