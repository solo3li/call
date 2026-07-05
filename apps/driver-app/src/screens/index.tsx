import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens when implemented
// import RoutingScreen from './RoutingScreen';
// import EarningsDashboard from './EarningsDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Routing">
        {/*
        <Stack.Screen name="Routing" component={RoutingScreen} />
        <Stack.Screen name="Earnings" component={EarningsDashboard} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
