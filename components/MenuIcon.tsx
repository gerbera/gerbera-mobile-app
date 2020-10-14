import * as React from 'react';
import { Feather, TouchableRipple } from './Themed';

import { onPressFunc } from '../types';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import main from '../styles/main';
import { TouchableNativeFeedback } from 'react-native';

export default function MenuIcon() {
  const navigation = useNavigation();

  const openDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  },[]);

  return (
    <TouchableRipple style={[ main.centered, main.fullHeight ]} onPress={openDrawer}>
      <Feather name="menu" size={24} style={{marginHorizontal: 25}}/>
    </TouchableRipple>
  );
};