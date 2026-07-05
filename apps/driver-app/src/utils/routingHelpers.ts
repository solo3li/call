import { Order, GeoPoint } from '../types/Trip';

// Haversine formula to calculate straight-line distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function calculateETA(orders: Order[], currentDriverLocation?: GeoPoint): number {
  const pendingOrders = orders.filter(o => o.status !== 'COMPLETED');
  
  if (pendingOrders.length === 0) return 0;
  
  // Assume a generic average city speed of 30 km/h
  const AVERAGE_SPEED_KMH = 30;
  
  let totalDistance = 0;
  
  // For simplicity in this heuristic, we'll just sum the distances between pending orders in order,
  // starting from the first pending order. In a real app, this would use a routing engine from driver's location.
  
  // If we had driver location, we'd start from there. Otherwise, we start from the first order.
  let startLat = currentDriverLocation?.latitude ?? pendingOrders[0].coordinates.latitude;
  let startLon = currentDriverLocation?.longitude ?? pendingOrders[0].coordinates.longitude;
  
  for (const order of pendingOrders) {
    const d = calculateDistance(startLat, startLon, order.coordinates.latitude, order.coordinates.longitude);
    totalDistance += d;
    startLat = order.coordinates.latitude;
    startLon = order.coordinates.longitude;
  }
  
  // Time in hours = distance / speed
  // Time in minutes = time * 60
  // Add 5 minutes per drop-off as buffer
  const drivingMinutes = (totalDistance / AVERAGE_SPEED_KMH) * 60;
  const dropOffBuffer = pendingOrders.length * 5;
  
  return Math.ceil(drivingMinutes + dropOffBuffer);
}
