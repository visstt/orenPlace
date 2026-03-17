export interface User {
  id: string;
  name: string;
  surname?: string;
  email: string;
  phone?: string;
  city?: string;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  eventsCount?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  address: string;
  isPopular: boolean;
  images: string[];
  categoryId: string;
  category: Category;
  _count?: {
    favorites: number;
  };
}

export interface Ticket {
  id: string;
  qrCode: string;
  purchaseDate: string;
  userId: string;
  eventId: string;
  event: Event;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EventQueryParams {
  search?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'price' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  EventDetail: { eventId: string };
  PurchaseTicket: { eventId: string };
  EditProfile: undefined;
  CategoryEvents: { categoryId: string; categoryName: string };
  About: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Categories: undefined;
  MyEvents: undefined;
  Favorites: undefined;
  Profile: undefined;
};
