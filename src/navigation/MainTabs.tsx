import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { KHH_COLORS } from '@/theme/colors';
import { HomeScreen } from '@/screens/HomeScreen';
import { AppointmentsScreen } from '@/screens/AppointmentsScreen';
import { AppointmentDetailScreen } from '@/screens/AppointmentDetailScreen';
import { VitalsScreen } from '@/screens/VitalsScreen';
import { HealthEducationScreen } from '@/screens/HealthEducationScreen';
import { ContactScreen } from '@/screens/ContactScreen';

export type MainTabParamList = {
  Home: undefined;
  Appointments: undefined;
  Vitals: undefined;
  HealthEducation: undefined;
  Contact: undefined;
};

export type AppointmentsStackParamList = {
  AppointmentsList: undefined;
  AppointmentDetail: { appointmentId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const AppointmentsStack = createNativeStackNavigator<AppointmentsStackParamList>();

function AppointmentsStackNavigator() {
  return (
    <AppointmentsStack.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentsStack.Screen name="AppointmentsList" component={AppointmentsScreen} />
      <AppointmentsStack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ headerShown: true, title: 'รายละเอียดนัดหมาย' }}
      />
    </AppointmentsStack.Navigator>
  );
}

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Appointments: 'calendar-outline',
  Vitals: 'pulse-outline',
  HealthEducation: 'book-outline',
  Contact: 'call-outline',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Home: 'หน้าหลัก',
  Appointments: 'นัดหมาย',
  Vitals: 'ผลตรวจ',
  HealthEducation: 'ความรู้',
  Contact: 'ติดต่อ',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: KHH_COLORS.PRIMARY_TEAL,
        tabBarInactiveTintColor: KHH_COLORS.TEXT_SECONDARY,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} size={size} color={color} />
        ),
        tabBarLabel: LABELS[route.name as keyof MainTabParamList],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsStackNavigator} />
      <Tab.Screen name="Vitals" component={VitalsScreen} />
      <Tab.Screen name="HealthEducation" component={HealthEducationScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
    </Tab.Navigator>
  );
}
