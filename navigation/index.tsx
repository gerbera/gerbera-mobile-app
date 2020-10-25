import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';

import { InitialRoute } from '../types';
import DrawerNavigator from './DrawerNavigator';
import { navTheme } from '../hooks/combineThemes';

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme, initialRoute }: { colorScheme: ColorSchemeName, initialRoute: InitialRoute }) {
  const theme = navTheme(colorScheme);
  return (
    <NavigationContainer theme={theme}>
      <DrawerNavigator initialRoute={initialRoute} />
    </NavigationContainer>
  );
}
