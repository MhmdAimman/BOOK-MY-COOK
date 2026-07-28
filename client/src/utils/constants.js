export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  CUSTOMER: 'customer',
  CHEF: 'chef',
  CATERER: 'caterer',
  DECORATOR: 'decorator',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  customer: 'Customer',
  chef: 'Chef',
  caterer: 'Caterer',
  decorator: 'Decorator',
  admin: 'Admin',
};

export const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Housewarming',
  'Birthday',
  'Corporate Event',
  'Temple Festival',
  'Puberty Ceremony',
  'Other',
];

export const CUISINE_TYPES = [
  'Chettinad',
  'Kongu',
  'Tamil Brahmin',
  'Madurai',
  'Nanjil',
  'Multi-cuisine',
  'North Indian',
  'Chinese',
  'Continental',
];

export const SERVICE_TYPES = {
  chef: 'Chef Services',
  caterer: 'Catering Services',
  decorator: 'Decoration Services',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};
