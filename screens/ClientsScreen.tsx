import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { Avatar, Subheading, Text, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';

import { BorderedView } from '../components/Themed';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useState } from 'react';
import main from '../styles/main';
import JSONRequest from '../utils/JSONRequest';
import { AuthedGetOptions } from '../constants/Options';
import { GerberaClient, GetClientsResponse, isInvalidSidResponse } from '../types';

interface InfoRowProps {
  elem: string;
  value: string;
};

// TODO: Make it look nicer
function InfoRow(props: InfoRowProps) {
  return (
    <BorderedView style={main.infoRow}>
      <Text>
        {props.elem}
      </Text>
      <View style={main.rowSpacer}></View>
      <Text>
        {props.value}
      </Text>
    </BorderedView>
  );
}

// whent trying to index into an object with specified keys, with a string
// of undetermined value, we need to verify that the string of undetermined value
// is one of the keys to the object with specified keys. This function ensures that
// and allows TypeScript (and us) to be sure that we won't do an invalid index into an object
// and return null / undefined instead of a string / number
function isValidKey(key: string, obj: GerberaClient): key is keyof (GerberaClient) {
  return key in obj;
}

function clientInfoExtractor(userAgent: string, profile: string): string {
  let result = "Unknown";
  if (profile.includes('UPnP')) result = 'UPnP';
  if (userAgent.includes('Android')) result = 'Android';
  if (userAgent.includes('Windows')) result = 'Windows';
  if (userAgent.includes('BRAVIA')) result = 'Sony Bravia TV';
  if (profile.includes('TV')) result = 'TV';
  if (profile.includes('Samsung') && profile.includes('TV')) result = 'Samsung TV';
  return result;
}

export default function ClientsScreen() {
  const navigation = useNavigation();
  const noItems: GerberaClient[] = [];
  const [items, setItems] = useState(noItems);
  const [shouldRefresh, setShouldRefresh] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: (props: StackHeaderLeftButtonProps) => (<MenuIcon/>)
    });
  });

  useEffect(() => {
    async function fetchData() {
      const hostname = await SecureStore.getItemAsync('hostname');
      const sid = await SecureStore.getItemAsync('sid');
      const res: GetClientsResponse = await JSONRequest(`${hostname}/content/interface?req_type=clients&sid=${sid}`, AuthedGetOptions);
      if (res.data && !isInvalidSidResponse(res.data)) {
        setItems(res.data.clients.client);
      }
    }
    fetchData();
  }, []);

  return (
    <ScrollView>
      <View style={main.flexstart}>
        {items.length > 0
          && items.map((item, idx) => (
            <BorderedView key={idx} style={main.thinBorder}>
              <Avatar.Text size={32} label={clientInfoExtractor(item.userAgent, item.name)[0]} />
              <Title>{clientInfoExtractor(item.userAgent, item.name)}</Title>
              {Object.keys(item).map(k => {
                if (isValidKey(k,item)) { // see isValidKey definition above for why we need this typeguard
                  return (
                    <InfoRow key={`${idx}${k}`} elem={k} value={item[k]}/>
                  );  
                }
              })}
            </BorderedView>
          ))
        }
        {items.length <= 0
          && <Subheading style={{marginTop: 50}}>No Clients found</Subheading>
        }
      </View>
    </ScrollView>
  )
};