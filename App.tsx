import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import useHostnameCheck from './hooks/useHostnameCheck';
import Navigation from './navigation';
import { InitialRoute } from './types';

export default function App() {
  const areResourcesLoaded = useCachedResources();
  const colorScheme = useColorScheme();
  const {checkedHostname, hasHostname} = useHostnameCheck();

  if (areResourcesLoaded && checkedHostname) {
    const initialRoute = InitialRoute.noHostname;
    // const initialRoute = hasHostname ? InitialRoute.hostname : InitialRoute.noHostname;
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} initialRoute={initialRoute}/>
        <StatusBar />
      </SafeAreaProvider>
    );
  } else {
    return null;
  }
}
