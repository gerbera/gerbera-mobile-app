import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import useHostnameCheck from './hooks/useHostnameCheck';
import Navigation from './navigation';
import { Provider as PaperProvider } from 'react-native-paper';
import { InitialRoute } from './types';
import { combineThemes } from './hooks/combineThemes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const areResourcesLoaded = useCachedResources();
  const colorScheme = useColorScheme();
  const theme = combineThemes(colorScheme);
  const {checkedHostname, hasHostname} = useHostnameCheck();

  if (areResourcesLoaded) {
    const initialRoute = hasHostname ? InitialRoute.hostname : InitialRoute.noHostname;
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <Navigation colorScheme={colorScheme} initialRoute={initialRoute}/>
        </PaperProvider>
        <StatusBar />
      </SafeAreaProvider>
    );
  } else {
    return null;
  }
}
