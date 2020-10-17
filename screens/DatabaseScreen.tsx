import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';

import { ActivityIndicator, ListIcon, ListItem } from '../components/Themed';
import { TouchableRipple } from 'react-native-paper';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useLayoutEffect, useState } from 'react';
import main from '../styles/main';
import { GerberaContainer, GerberaItem, GetContainersResponse, GetItemsResponse, isInvalidSidResponse, SessionInfo } from '../types';
import sessionEffect from '../auth/sessionEffect';
import JSONRequest from '../utils/JSONRequest';
import { AuthedGetOptions } from '../constants/Options';
import refreshSession from '../auth/refreshSession';
import { ScrollView } from 'react-native-gesture-handler';
import { List, Menu } from 'react-native-paper';
import GoBackItem from '../components/GoBackItem';
import FolderItem from '../components/FolderItem';
import getIconForFileType from '../constants/FileExtIcons';

export default function DatabaseScreen() {
  const navigation = useNavigation();
  const emptySession: SessionInfo = {hostname: '', sid: ''};
  const [{hostname, sid}, setSession] = useState(emptySession);
  const emptyParentIdStack: number[] = [];
  const [parentIdStack, setParentIdStack] = useState(emptyParentIdStack);
  const [parentId, setParentId] = useState(0);
  const noContainers: GerberaContainer[] = [];
  const [containers, setContainers] = useState(noContainers);
  const noItems: GerberaItem[] = [];
  const [items, setItems] = useState(noItems);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(-1);
  const notAuthed: () => boolean = () => {
    return hostname == emptySession.hostname && sid == emptySession.sid;
  };

  useEffect(() => {
    navigation.setOptions({
      showHeader: true,
      headerLeft: (props: StackHeaderLeftButtonProps) => (<MenuIcon/>)
    });
  });

  useLayoutEffect(sessionEffect(setSession), []);

  // refreshes server id, could be abstracted away probably
  const refreshSesh = async () => {
    if (notAuthed()) return;
    const sesh = await refreshSession(hostname);
    setSession(sesh);
  }

  // this turns the loading animation off when we get a new set of dirs/files
  useEffect(() => {
    setLoading(false);
  }, [containers]);

  useEffect(() => {
    async function getContainerContents() {
      const containersRes: GetContainersResponse = await JSONRequest(`${hostname}/content/interface?req_type=containers&sid=${sid}&parent_id=${parentId}`, AuthedGetOptions);
      const itemsRes: GetItemsResponse = await JSONRequest(`${hostname}/content/interface?req_type=items&sid=${sid}&parent_id=${parentId}`, AuthedGetOptions);
      if (containersRes.data && !isInvalidSidResponse(containersRes.data)) {
        setContainers(containersRes.data.containers.container);
      } else await refreshSesh();
      if (itemsRes.data && !isInvalidSidResponse(itemsRes.data)) {
        setItems(itemsRes.data.items.item);
      } else await refreshSesh();
    }

    if (notAuthed()) return;
    getContainerContents();
  }, [parentId, hostname, sid]);

  return (
    <View>
      <ScrollView>
        { loading
          ? <ActivityIndicator style={main.marginTop}/>
          : <View style={main.flexstart}>
              <List.Section style={main.fullWidth}>
                
                {/* back button */}
                {parentId != 0
                  ? <GoBackItem
                      key={parentId}
                      onPress={() => {
                        // get the last parentId, remove it from the parentIdStack
                        // and setParentId with the last parentId
                        setLoading(true);
                        const lastParentId = parentIdStack.slice(-1)[0];
                        setParentIdStack(parentIdStack.filter(x => x != lastParentId));
                        setParentId(lastParentId);
                      }}
                    />
                  : null
                }

                  {/* directories */}
                  {containers.length > 0
                    && containers.map((c, idx) => (
                      <FolderItem
                        key={idx}
                        title={c.title}
                        onPress={() => {
                          // add the current parentId to the parentIdStack
                          // and make the new parentId this directory's id
                          setLoading(true);
                          setParentIdStack([ ...parentIdStack, parentId ]);
                          setParentId(c.id);
                        }}
                      />
                    ))
                  }

                  {/* files */}
                  {items.length > 0
                    && items.map((i, idx) => (
                      <ListItem
                        key={idx}
                        title={i.title}
                        left={() => <ListIcon icon={getIconForFileType(i.title)}/>}
                        right={() => 
                          <Menu
                            style={{alignSelf: 'flex-end', backgroundColor: '#e5e5e5'}}
                            visible={menuVisible == i.id}
                            onDismiss={() => setMenuVisible(-1)}
                            anchor={
                              <TouchableRipple
                                onPress={() => setMenuVisible(i.id)}
                              >
                                <ListIcon icon='dots-vertical'/>
                              </TouchableRipple>
                            }
                          >
                            <Menu.Item title='Properties'/>
                            <Menu.Item title='Download'/>
                            <Menu.Item title='Edit'/>
                            <Menu.Item title='Delete'/>
                          </Menu>
                        }
                      />
                    ))
                  }

              </List.Section>
            </View>
        }
      </ScrollView>
    </View>
  )
};