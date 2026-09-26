import { supabase } from './client';
import { Database } from './types';

export type City = Database['public']['Tables']['cities']['Row'];

export const citiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async create(name: string, routeCoordinates?: { lat: number; lng: number }[]) {
    const { data, error } = await supabase
      .from('cities')
      .insert([{ 
        name,
        route_coordinates: routeCoordinates || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, name: string, routeCoordinates?: { lat: number; lng: number }[]) {
    const { data, error } = await supabase
      .from('cities')
      .update({ 
        name,
        route_coordinates: routeCoordinates || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 