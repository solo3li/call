export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  buildingDetails?: string;
}

export type OrderStatus = 'PENDING' | 'PICKED_UP' | 'COMPLETED' | 'FAILED';

export interface Order {
  id: string;
  tripId: string;
  customerName: string;
  address: Address;
  status: OrderStatus;
  coordinates: GeoPoint;
}

export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Trip {
  id: string;
  status: TripStatus;
  orders: Order[];
  estimatedTimeMinutes: number;
  mapsUrl?: string;
}
