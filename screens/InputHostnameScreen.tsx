import { View } from 'react-native';
import { Headline, TextInput } from 'react-native-paper';
import { Button } from '../components/Themed';
import { GetOptions, SecureStoreOptions } from '../constants/Options';
import Ids from '../constants/Ids';
import main from '../styles/main';

import { StackHeaderLeftButtonProps } from "@react-navigation/stack";
import { GetSidResponse } from "../types";
import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import JSONRequest from '../utils/JSONRequest';
import { HelperText } from 'react-native-paper';
import { AndroidImportance, AndroidNotificationVisibility, NotificationChannel, NotificationChannelInput } from 'expo-notifications';
import useColorScheme from '../hooks/useColorScheme';
import { combineThemes } from '../hooks/combineThemes';
import { useNavigation } from '@react-navigation/native';
import MenuIcon from '../components/MenuIcon';

export default function InputHostnameScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [hostname, setHostname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notfound, setNotfound] = useState(false);
  const colorScheme = useColorScheme();
  const theme = combineThemes(colorScheme);

  // adds the hamburger menu icon to the header
  useEffect(() => {
    navigation.setOptions({
      showHeader: true,
      headerLeft: (props: StackHeaderLeftButtonProps) => (<MenuIcon/>)
    });
  });  

  async function setNotificationChannel() {
    const loadingChannel: NotificationChannel | null = await Notifications.getNotificationChannelAsync(Ids.loadingChannelId);

    // if we didn't find a notification channel set how we like it, then we create one
    if (loadingChannel == null) {
      const channelOptions: NotificationChannelInput = {
        name: Ids.loadingChannelId,
        importance: AndroidImportance.HIGH,
        lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
        sound: 'default',
        vibrationPattern: [250],
        lightColor: theme.colors.primary,
        enableVibrate: true
      };
      await Notifications.setNotificationChannelAsync(Ids.loadingChannelId, channelOptions);
    }
  }

  async function submitForm() {
    setIsLoading(true);

    await setNotificationChannel();

    const res: GetSidResponse = await JSONRequest(`${hostname}/content/interface?req_type=auth&action=get_sid`, GetOptions);
    
    if (res.data && res.data.logged_in && res.data.sid) {
      SecureStore.setItemAsync('sid', res.data.sid, SecureStoreOptions);
      SecureStore.setItemAsync('hostname', hostname, SecureStoreOptions);
      if (username != '')
        SecureStore.setItemAsync('username', username, SecureStoreOptions);
      if (password != '')
        SecureStore.setItemAsync('password', password, SecureStoreOptions);
      
      navigation.navigate('Root');
    }

    if (res.error)
      setNotfound(true);

    // TODO: Add error handling for hostname found but username/password wrong

    setIsLoading(false);
  }

  return (
    <View style={main.centered}>

      <View style={[main.inputWrapper, main.marginBottom]}>
        <Headline>Enter your Gerbera connection details</Headline>
      </View>
      
      <View style={main.inputWrapper}>
        <TextInput
          mode='outlined'
          label="hostname (required)"
          placeholder="http://10.0.0.51:49152"
          value={hostname}
          onChangeText={hostname => {
            if (notfound)
              setNotfound(false);
            setHostname(hostname);
          }}
          style={main.fullWidth}
        />
        <HelperText type='error' visible={notfound}>
          hostname is invalid
        </HelperText>
      </View>

      <View style={main.inputSpacer}></View>

      <View style={main.inputWrapper}>
        <TextInput
          mode='outlined'
          label="username"
          placeholder="admin"
          value={username}
          onChangeText={username => setUsername(username)}
          style={main.fullWidth}
          autoCompleteType='username'
        />
        <HelperText type='error' visible={false}>
          username is invalid
        </HelperText>
      </View>

      <View style={main.inputSpacer}></View>

      <View style={main.inputWrapper}>
        <TextInput
          mode='outlined'
          label="password"
          placeholder="hunter2"
          value={password}
          onChangeText={password => setPassword(password)}
          style={main.fullWidth}
          autoCompleteType='password'
          secureTextEntry={true}
        />
        <HelperText type='error' visible={false}>
          password is invalid
        </HelperText>
      </View>

      <View style={main.inputSpacer}></View>

      <Button mode='contained' onPress={submitForm} loading={isLoading}>
          {isLoading ? "Loading" : "Connect To Server"}
      </Button>
    </View>
  );
}