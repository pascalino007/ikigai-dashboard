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
  country: string;
  city: string;
  area: string; // district/neighborhood
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

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  subcategory: string; // subcategory of the main category
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

export interface Slider {
  id: string;
  title: string;
  description: string;
  image: string;
  linkUrl?: string;
  isActive: boolean;
  isCurrent: boolean; // for the 3 current slides
  order: number; // for ordering the current slides
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shopId: string;
  shopName: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'provider' | 'customer';
  profilePicture?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  serviceId: string;
  serviceName: string;
  shopId: string;
  shopName: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  isActive: boolean;
  maxUses?: number; // optional limit on how many times this offer can be used
  usedCount: number; // how many times this offer has been used
  image?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin or shop owner ID
}

export interface ShopService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  subcategory?: string;
  shopId: string;
  shopName: string;
  providerId?: string; // optional if service is provided by specific provider
  providerName?: string;
  isActive: boolean;
  image?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  specialization: string; // e.g., 'Hair Stylist', 'Nail Technician', 'Massage Therapist'
  experience: number; // years of experience
  hourlyRate: number;
  shopId: string;
  shopName: string;
  isActive: boolean;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentBookingId?: string; // if busy, which booking they're working on
  rating: number;
  totalBookings: number;
  totalEarnings: number;
  workingHours: {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "18:00"
    days: string[]; // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerPerformance {
  workerId: string;
  workerName: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalHoursWorked: number;
  bookingsCompleted: number;
  bookingsCancelled: number;
  customerSatisfaction: number; // percentage
  servicesPerformed: Array<{
    serviceName: string;
    count: number;
    revenue: number;
  }>;
}

export interface ShopPerformance {
  shopId: string;
  shopName: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  totalRevenue: number;
  totalBookings: number;
  averageRating: number;
  totalWorkers: number;
  activeWorkers: number;
  workerPerformance: Array<{
    workerId: string;
    workerName: string;
    bookings: number;
    revenue: number;
    rating: number;
  }>;
  topServices: Array<{
    serviceName: string;
    bookings: number;
    revenue: number;
  }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerSatisfaction: number;
  };
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
