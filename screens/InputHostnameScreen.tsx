import { View } from 'react-native';
import { Headline, TextInput } from 'react-native-paper';
import { Button } from '../components/Themed';
import { GetOptions, SecureStoreOptions } from '../constants/Options';
import main from '../styles/main';

import { StackScreenProps } from "@react-navigation/stack";
import { GetSidResponse, RootStackParamList } from "../types";
import React, { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import JSONRequest from '../utils/JSONRequest';
import { HelperText } from 'react-native-paper';

export default function InputHostnameScreen({ navigation }: StackScreenProps<RootStackParamList, 'InputHostname'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [hostname, setHostname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notfound, setNotfound] = useState(false);

  async function submitForm() {
    setIsLoading(true);

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