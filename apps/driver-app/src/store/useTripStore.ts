import { create } from 'zustand';
import { Trip, OrderStatus } from '../types/Trip';

interface TripStore {
  activeTrip: Trip | null;
  setActiveTrip: (trip: Trip) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setEstimatedTime: (minutes: number) => void;
}

// Initial mock data
const mockTrip: Trip = {
  id: 'trip-123',
  status: 'IN_PROGRESS',
  estimatedTimeMinutes: 45,
  orders: [
    {
      id: 'order-1',
      tripId: 'trip-123',
      customerName: 'Ahmed Ali',
      address: {
        street: '123 Main St',
        city: 'Cairo',
        buildingDetails: 'Apt 4B, Floor 4',
      },
      status: 'PENDING',
      coordinates: { latitude: 30.0444, longitude: 31.2357 }, // Cairo
    },
    {
      id: 'order-2',
      tripId: 'trip-123',
      customerName: 'Sara Youssef',
      address: {
        street: '45 Nile Corniche',
        city: 'Giza',
      },
      status: 'PENDING',
      coordinates: { latitude: 30.0131, longitude: 31.2089 }, // Giza
    },
    {
      id: 'order-3',
      tripId: 'trip-123',
      customerName: 'Omar Khaled',
      address: {
        street: '90th Street',
        city: 'New Cairo',
        buildingDetails: 'Villa 12',
      },
      status: 'COMPLETED',
      coordinates: { latitude: 30.0276, longitude: 31.4728 }, // New Cairo
    },
  ],
};

export const useTripStore = create<TripStore>((set) => ({
  activeTrip: mockTrip,
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  updateOrderStatus: (orderId, status) =>
    set((state) => {
      if (!state.activeTrip) return state;
      const updatedOrders = state.activeTrip.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      
      // Update trip status if all orders are completed
      const allCompleted = updatedOrders.every(o => o.status === 'COMPLETED');
      
      return {
        activeTrip: {
          ...state.activeTrip,
          status: allCompleted ? 'COMPLETED' : state.activeTrip.status,
          orders: updatedOrders,
        },
      };
    }),
  setEstimatedTime: (minutes) =>
    set((state) => {
      if (!state.activeTrip) return state;
      return {
        activeTrip: {
          ...state.activeTrip,
          estimatedTimeMinutes: minutes,
        },
      };
    }),
}));
