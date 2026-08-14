import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KHH_COLORS } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';
import { RoleSelectionScreen } from '@/screens/auth/RoleSelectionScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { PdpaPinScreen } from '@/screens/auth/PdpaPinScreen';
import { MainTabs } from '@/navigation/MainTabs';

export type AuthStackParamList = {
  RoleSelection: undefined;
  Register: { role: 'patient' | 'staff' };
  PdpaPin: { hn: string; name: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: true, title: '' }}
      />
      <AuthStack.Screen name="PdpaPin" component={PdpaPinScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { patient, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: KHH_COLORS.BACKGROUND }}>
        <ActivityIndicator size="large" color={KHH_COLORS.PRIMARY_TEAL} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {patient && patient.pdpaVerified !== false ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
