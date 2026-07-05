import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useTripStore } from '../store/useTripStore';

export const TripMapView: React.FC = () => {
  const { activeTrip } = useTripStore();

  const mapHtml = useMemo(() => {
    if (!activeTrip || activeTrip.orders.length === 0) return '';

    // Calculate center
    const lats = activeTrip.orders.map(o => o.coordinates.latitude);
    const lons = activeTrip.orders.map(o => o.coordinates.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;

    const markersJs = activeTrip.orders.map(o => {
      const isCompleted = o.status === 'COMPLETED';
      const color = isCompleted ? 'green' : 'blue';
      return `
        L.circleMarker([${o.coordinates.latitude}, ${o.coordinates.longitude}], {
          color: '${color}',
          fillColor: '${color}',
          fillOpacity: 1,
          radius: 8
        }).addTo(map).bindPopup('Order: ${o.id}<br>Status: ${o.status}');
      `;
    }).join('\n');

    // Return full HTML string using Leaflet CDN
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { padding: 0; margin: 0; }
          html, body, #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${centerLat}, ${centerLon}], 11);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          ${markersJs}
        </script>
      </body>
      </html>
    `;
  }, [activeTrip]);

  if (!activeTrip) {
    return (
      <View style={styles.center}>
        <Text>No active trip to map.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // @ts-ignore - iframe is valid in React Native Web
        <iframe 
          srcDoc={mapHtml} 
          style={{ width: '100%', height: '100%', border: 'none' }} 
          title="Trip Map"
        />
      ) : (
        <View style={styles.center}>
          <Text>Map not supported on this platform without native WebView.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  }
});
