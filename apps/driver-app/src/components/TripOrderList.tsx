import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Order } from '../types/Trip';
import { useTripStore } from '../store/useTripStore';
import { TripOrderCard } from './TripOrderCard';

export const TripOrderList: React.FC = () => {
  const { activeTrip } = useTripStore();

  if (!activeTrip) return null;

  const renderItem = ({ item, index }: { item: Order, index: number }) => {
    return <TripOrderCard order={item} index={index} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={activeTrip.orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  }
});
