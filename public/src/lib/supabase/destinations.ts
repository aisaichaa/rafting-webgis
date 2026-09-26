import { supabase } from './client';
import { Database } from './types';

export type Destination = Database['public']['Tables']['destinations']['Row'];

export const destinationsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, cities(*)')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, cities(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByCity(cityId: string) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*, cities(*)')
      .eq('city_id', cityId)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async create(destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('destinations')
      .insert(destination)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, destination: Partial<Omit<Destination, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('destinations')
      .update(destination)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 