import { supabase } from './client';
import { Database } from './types';

export type Review = Database['public']['Tables']['reviews']['Row'];

class ReviewsService {
  async getByDestinationId(destinationId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    return data || [];
  }

  async create(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    return data;
  }

  async update(id: string, review: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update(review)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      throw error;
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  async getAverageRating(destinationId: string): Promise<number> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('destination_id', destinationId);

    if (error) {
      console.error('Error fetching average rating:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / data.length;
  }
}

export const reviewsService = new ReviewsService(); 