import * as React from 'react';

import { Text } from 'react-native-paper';

export function MonoText(props: React.ComponentProps<typeof Text>) {
  return <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />;
}
