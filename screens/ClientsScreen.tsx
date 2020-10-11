import * as React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';

import { Text, View, BorderedView } from '../components/Themed';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useState } from 'react';
import main from '../styles/main';
import JSONRequest from '../utils/JSONRequest';
import { GetOptions } from '../constants/Options';

const wht = "rgba(255,255,255,0.8)";
const blk = "rgba(0,0,0,0.8)";

interface InfoRowProps {
  elem: string;
  value: string;
};

// TODO: Make it look nicer
function InfoRow(props: InfoRowProps) {
  return (
    <BorderedView style={main.infoRow}>
      <Text lightColor={blk} darkColor={wht}>
        {props.elem}
      </Text>
      <View style={main.rowSpacer}></View>
      <Text lightColor={blk} darkColor={wht}>
        {props.value}
      </Text>
    </BorderedView>
  );
}

export default function ClientsScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
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
      const res = await JSONRequest(`${hostname}/content/interface?req_type=clients&sid=${sid}`, {
        "credentials": "include",
        ...GetOptions
      });
      if (res.data) {
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
              {Object.keys(item).map(k => (
                <InfoRow key={`${idx}${k}`} elem={k} value={item[k]}/>
              ))}
            </BorderedView>
          ))
        }
      </View>
    </ScrollView>
  )
};