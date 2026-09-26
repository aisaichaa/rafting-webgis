export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          route_coordinates: { lat: number; lng: number }[] | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          route_coordinates?: { lat: number; lng: number }[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          route_coordinates?: { lat: number; lng: number }[] | null;
        };
      };
      destinations: {
        Row: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          price_per_person: number;
          facilities: string[];
          contact: string | null;
          website: string | null;
          image_url: string | null;
          city_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          price_per_person: number;
          facilities: string[];
          contact?: string | null;
          website?: string | null;
          image_url?: string | null;
          city_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
          price_per_person?: number;
          facilities?: string[];
          contact?: string | null;
          website?: string | null;
          image_url?: string | null;
          city_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          destination_id: string;
          user_id: string;
          user_name: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          destination_id: string;
          user_id: string;
          user_name: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          destination_id?: string;
          user_id?: string;
          user_name?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 