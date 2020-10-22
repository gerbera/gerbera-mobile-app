import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import Filesize from 'filesize';

import { ActivityIndicator, ListIcon, Paragraph, ListItem } from '../components/Themed';
import { Button, Dialog, Subheading, TouchableRipple } from 'react-native-paper';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useLayoutEffect, useState } from 'react';
import main from '../styles/main';
import { GerberaContainer, GerberaItem, GetContainersResponse, GetItemPropertiesResponse, GetItemsResponse, isInvalidSidResponse, ResourceData, ScheduledNotifParams, SessionInfo } from '../types';
import sessionEffect from '../auth/sessionEffect';
import JSONRequest from '../utils/JSONRequest';
import { AuthedGetOptions } from '../constants/Options';
import refreshSession from '../auth/refreshSession';
import { ScrollView } from 'react-native-gesture-handler';
import { List, Menu } from 'react-native-paper';
import GoBackItem from '../components/GoBackItem';
import FolderItem from '../components/FolderItem';
import getIconForFileType from '../constants/FileExtIcons';
import { AndroidNotificationPriority } from 'expo-notifications';
import Ids from '../constants/Ids';

export default function DatabaseScreen() {
  const navigation = useNavigation();
 
  // auth state vars
  const emptySession: SessionInfo = {hostname: '', sid: ''};
  const [{hostname, sid}, setSession] = useState(emptySession);
  const notAuthed: () => boolean = () => {
    return hostname == emptySession.hostname && sid == emptySession.sid;
  };

  // container (directory) state vars
  const emptyParentIdStack: number[] = [];
  const [parentIdStack, setParentIdStack] = useState(emptyParentIdStack);
  const [parentId, setParentId] = useState(0);
  const noContainers: GerberaContainer[] = [];
  const [containers, setContainers] = useState(noContainers);

  /// item (file) state vars
  const noItems: GerberaItem[] = [];
  const [items, setItems] = useState(noItems);

  const [loading, setLoading] = useState(false);

  // menu actions state vars
  const dlPrefix = 'gerbdl_';
  const dlErrorPrefix = 'gerberr_';
  const dlFinishedPrefix = 'gerbfn_';
  const [menuVisible, setMenuVisible] = useState(-1);

  // show item properties state vars
  const [dialogVisible, setDialogVisible] = useState(false);
  const [chosenItemId, setChosenItemId] = useState(0);
  const [chosenItemTitle, setChosenItemTitle] = useState('');
  const [chosenItemFullPath, setChosenItemFullPath] = useState('');
  const [chosenItemMimeType, setChosenItemMimeType] = useState('');
  const [chosenItemBitRate, setChosenItemBitRate] = useState('');
  const [chosenItemDuration, setChosenItemDuration] = useState('');
  const [chosenItemResolution, setChosenItemResolution] = useState('');
  const [chosenItemSize, setChosenItemSize] = useState('');

  // adds the hamburger menu icon to the header
  useEffect(() => {
    navigation.setOptions({
      showHeader: true,
      headerLeft: (props: StackHeaderLeftButtonProps) => (<MenuIcon/>)
    });
  });

  // ensures we are in a valid session
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

  // ls the container we are currently in (container is db version of dir)
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

  // helper function for crafting notifications in downloadFile function below
  const getScheduledNotifParams = (category: 'start' | 'finish' | 'error', subtitle: string,
    objId: string, objTitle: string
  ): ScheduledNotifParams => {

    let prefix = '';
    let sticky = false;
    switch (category) {
      case 'start':
        prefix = dlPrefix;
        sticky = true;
        break;
      case 'finish':
        prefix = dlFinishedPrefix;
        sticky = false;
        break;
      case 'error':
        prefix = dlErrorPrefix;
        sticky = false;
        break;
      default:
        break;
    }

    const params: ScheduledNotifParams = {
      identifier: `${prefix}${objId}`,
      content: {
        title: objTitle,
        body: subtitle,
        vibrate: [250],
        priority: AndroidNotificationPriority.HIGH,
        sticky,
      },
      trigger: {
        channelId: Ids.loadingChannelId
      }
    };
    return params;
  }

  // downloads the specified file into the user's "Download" folder/album on the device
  async function downloadFile(objId: string, objTitle: string) {
    // get permission to download the file to the device
    const perm = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (perm.status != 'granted') {
      return;
    }

    // notify the user that download is beginning
    const scheduleNotifNowParams = getScheduledNotifParams('start', 'Downloading...', objId, objTitle);
    await Notifications.scheduleNotificationAsync(scheduleNotifNowParams);

    // download the file
    const uri = `${hostname}/content/media/object_id/${objId}/res_id/0`;
    const fileUri = `${FileSystem.documentDirectory}${objTitle}`;
    // note below: documentDirectory ends with a trailing slash
    const downloadedFile = await FileSystem.downloadAsync(uri, fileUri);

    // handle if download failed (dismiss loading notification from earlier and show one that says download failed)
    if (downloadedFile.status != 200) {
      await Notifications.dismissNotificationAsync(scheduleNotifNowParams.identifier);
      const scheduleNotifErrorParams = getScheduledNotifParams('error', 'Failed to download', objId, objTitle);
      await Notifications.scheduleNotificationAsync(scheduleNotifErrorParams);
      return;
    }

    // move the file to the Download folder on the device
    // we use the MediaLibrary to create a media asset,
    // then try to get the album on the device named "Download"
    // which corresponds to the Download folder on Android
    // then we save the file there.
    try {
      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
      const album = await MediaLibrary.getAlbumAsync('Download');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch (e) {
      // here handle the same way we handled failure up above
      await Notifications.dismissNotificationAsync(scheduleNotifNowParams.identifier);
      const scheduleNotifErrorParams = getScheduledNotifParams('error', 'Failed to download', objId, objTitle);
      await Notifications.scheduleNotificationAsync(scheduleNotifErrorParams);
      return;
    }

    // notify the user that the download is complete (and dismiss the loading notification from earlier)
    await Notifications.dismissNotificationAsync(scheduleNotifNowParams.identifier);
    const scheduleNotifFinishedParams = getScheduledNotifParams('finish', 'Completed!', objId, objTitle);
    await Notifications.scheduleNotificationAsync(scheduleNotifFinishedParams);
  }

  const pickResValue = (resources: ResourceData[], name: string): string => {
    return resources.filter(x => x.resname == name).map(x => x.resvalue).join('');
  };

  // load the properties of the chosen item
  useEffect(() => {
    async function getItemProperties() {
      const res: GetItemPropertiesResponse = await JSONRequest(`${hostname}/content/interface?req_type=edit_load&sid=${sid}&object_id=${chosenItemId}`, AuthedGetOptions);
      if (res.data && !isInvalidSidResponse(res.data)) {
        setChosenItemFullPath(res.data.item.location.value);
        setChosenItemMimeType(res.data.item["mime-type"].value);
        const resources = res.data.item.resources.resources;
        setChosenItemBitRate(pickResValue(resources, ' bitrate'));
        setChosenItemDuration(pickResValue(resources, ' duration'));
        setChosenItemResolution(pickResValue(resources, ' resolution'));
        // below converts the bytes value (as string) to a human readable size string
        // 226761083 => 216.26 MB
        setChosenItemSize(Filesize(parseInt(pickResValue(resources, ' size'))));
      }
    }

    if (notAuthed()) return;
    getItemProperties();
  }, [chosenItemId]);

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
                            <Menu.Item title='Properties' onPress={() => {
                                setMenuVisible(-1);
                                setDialogVisible(true);
                                setChosenItemId(i.id);
                                setChosenItemTitle(i.title);
                              }}
                            />
                            <Menu.Item title='Download' onPress={async () => await downloadFile(i.id.toString(), i.title)}/>
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
      <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
        <Dialog.Title>{chosenItemTitle}</Dialog.Title>
        <Dialog.Content>
          <Subheading>File Path</Subheading>
          <Paragraph>{chosenItemFullPath}</Paragraph>
          <Subheading>Mime-Type</Subheading>
          <Paragraph>{chosenItemMimeType}</Paragraph>
          <Subheading>Bit Rate</Subheading>
          <Paragraph>{chosenItemBitRate}</Paragraph>
          <Subheading>Duration</Subheading>
          <Paragraph>{chosenItemDuration}</Paragraph>
          <Subheading>Resolution</Subheading>
          <Paragraph>{chosenItemResolution}</Paragraph>
          <Subheading>Size</Subheading>
          <Paragraph>{chosenItemSize}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogVisible(false)}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  )
};