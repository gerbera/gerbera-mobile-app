import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import NotFoundScreen from '../screens/NotFoundScreen';
import InputHostnameScreen from '../screens/InputHostnameScreen';
import { InitialRoute, RootStackParamList } from '../types';
import DrawerNavigator from './DrawerNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import { navTheme } from '../hooks/combineThemes';

// TODO: here we need to use a hook to try and retrieve the asyncstorage entry
// for the gerbera hostname. if we don't get it, show them a screen where
// users can input this data

// TODO: also we need a settings screen

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme, initialRoute }: { colorScheme: ColorSchemeName, initialRoute: InitialRoute }) {
  const theme = navTheme(colorScheme);
  return (
    <NavigationContainer
      // linking={LinkingConfiguration}
      theme={theme}
    >
      <DrawerNavigator initialRoute={initialRoute} />
      {/* <RootNavigator initialRoute={initialRoute} /> */}
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator({ initialRoute }: { initialRoute: InitialRoute }) {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName={initialRoute}>
      <Stack.Screen name="Root" component={DrawerNavigator} />
      <Stack.Screen name="InputHostname" component={InputHostnameScreen}/>
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
