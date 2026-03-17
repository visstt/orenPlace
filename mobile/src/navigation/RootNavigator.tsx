import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import PurchaseTicketScreen from '../screens/PurchaseTicketScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CategoryEventsScreen from '../screens/CategoryEventsScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerTransparent: true,
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen
            name="PurchaseTicket"
            component={PurchaseTicketScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerShown: true,
              headerTitle: 'Редактирование профиля',
              headerTintColor: COLORS.primary,
            }}
          />
          <Stack.Screen
            name="CategoryEvents"
            component={CategoryEventsScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerTintColor: COLORS.primary,
            }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
