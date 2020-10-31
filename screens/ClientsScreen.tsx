import * as React from 'react';
import { View, FlatList, SectionList, SectionListData, Dimensions } from 'react-native';
import { Avatar, Button, Chip, Divider, Paragraph, Subheading, Text, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';

import { BorderedView, ClientMetadataTitle, RefreshControl } from '../components/Themed';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useLayoutEffect, useState } from 'react';
import main from '../styles/main';
import JSONRequest from '../utils/JSONRequest';
import { AuthedGetOptions } from '../constants/Options';
import sessionEffect from '../auth/sessionEffect';
import refreshSession from '../auth/refreshSession';
import { GerberaClient, GetClientsResponse, isInvalidSidResponse, SessionInfo } from '../types';
import { emptySession, notAuthed } from '../utils/Session';

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
  if (result === "Unknown" && (profile && profile != "Unknown" && profile != "None"))
    return profile;
  return result;
}

function cleanUpTitle(title: string): string {
  const chars = title.split('').map((ch, idx) => {
    if (idx == 0) {
      return ch.toUpperCase();
    } else if (/[A-Z]/.test(ch)) {
      return ` ${ch}`;
    } else {
      return ch;
    }
  });
  return chars.join('');
}

export default function ClientsScreen() {
  const navigation = useNavigation();

  // auth state vars
  const [{hostname, sid}, setSession] = useState(emptySession);

  // client info vars
  const noItems: GerberaClient[] = [];
  const [items, setItems] = useState(noItems);
  const noSections: SectionListData<GerberaClient>[] = [];
  const [sections, setSections] = useState(noSections);

  // refreshControl vars
  const [refreshing, setRefreshing] = useState(false);

  // constants for rendering items in the screen at bottom of this file
  const horizontalPadding = 40;
  const width = Dimensions.get('window').width - horizontalPadding;
  const colWidth = (width / 3) - 10;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: (props: StackHeaderLeftButtonProps) => (<MenuIcon/>)
    });
  });

  // ensures we are in a valid session
  useLayoutEffect(sessionEffect(setSession), []);

  // refreshes server id, could be abstracted away probably
  const refreshSesh = async () => {
    if (notAuthed(hostname, sid)) return;
    const sesh = await refreshSession(hostname);
    setSession(sesh);
  }

  async function fetchData() {
    const res: GetClientsResponse = await JSONRequest(`${hostname}/content/interface?req_type=clients&sid=${sid}`, AuthedGetOptions);
    if (res.data && !isInvalidSidResponse(res.data)) {
      const clientItems = res.data.clients.client;
      setItems(clientItems);
      setSections(clientItems.map(x => ({
        data: [x],
        key: uuidv4()
      })));
    } else await refreshSesh();
  }

  useEffect(() => {
    if (notAuthed(hostname, sid)) return;
    fetchData();
  }, [hostname, sid]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  // used to generate keys for items in the sectionlist and nested flatlist
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // converts type GerberaClient to a type suitable for use in the FlatList
  // discards the 'ip' and 'host' key-value pairs along the way
  function GCToFlatListItem(gc: GerberaClient): { key: string, [x: string]: string }[] {
    return Object.entries(gc)
      .filter(
        ([key, value]) => 
          key != 'ip' && key != 'host'
      ).map(
        ([key, value]) => 
          ({ key: uuidv4(), [key]: value })
      );
  }

  return (
    <SectionList<GerberaClient>
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      contentContainerStyle={main.inset}
      ListEmptyComponent={() => (
        <Subheading style={[main.marginTop, main.textAlignCenter]}>No Clients Found</Subheading>
      )}
      renderSectionHeader={({ section }) => {
        const clientInfo = section.data[0];
        const { userAgent, name } = clientInfo;
        const title = clientInfoExtractor(userAgent, name);
        return (
          <View style={main.clientHeaderAlignment}>
            <Avatar.Text size={32} label={title[0]} />
            <View style={main.clientTitle}>
              <Title>{title}</Title>
              <Subheading style={main.shMarginLeft}>{clientInfo.ip}</Subheading>
            </View>
          </View>
        );
      }}
      renderSectionFooter={() => (
        <Divider style={main.bigDivider}/>
      )}
      sections={sections}
      renderItem={({ item }) => (
        <FlatList
          style={{width: width}}
          scrollEnabled={false}
          numColumns={3}
          data={GCToFlatListItem(item)}
          key={`${item.ip}`}
          renderItem={({item}) => {
            const {key, ...data} = item;
            const k = Object.keys(data)[0];
            const v = Object.values(data)[0];
            return (
              <View style={[main.clientMetadataSpacing, {width: colWidth}]} key={key}>
                <ClientMetadataTitle>{cleanUpTitle(k)}</ClientMetadataTitle>
                <Paragraph>{v}</Paragraph>
              </View>
            );
          }}
        />
      )}
    />
  );
};