export interface ServiceProvider {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  idCardNumber?: string;
  profilePicture?: string;
  idCardPicture?: string;
  type: 'barber' | 'hairdresser' | 'makeup_artist' | 'nail_technician' | 'esthetician';
  experience: number;
  rating: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  shopId?: string;
}

export interface Shop {
  id: string;
  name: string;
  category?: string; // e.g., onglerie, manicure, coiffure
  tags?: string[]; // multi-choice tags representing services offered
  profileImage?: string; // main image URL
  images?: string[]; // gallery image URLs
  address: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  isActive: boolean;
  ownerId: string;
  openingHours?: Array<{
    day: string; // e.g., Monday
    open: string; // e.g., 09:00
    close: string; // e.g., 18:00
  }>;
  createdAt: Date;
  updatedAt: Date;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  providerId: string;
  shopId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  providerId: string;
  shopId: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalProviders: number;
  totalShops: number;
  totalServices: number;
  totalBookings: number;
  activeProviders: number;
  monthlyRevenue: number;
  topServices: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  recentBookings: Booking[];
}
