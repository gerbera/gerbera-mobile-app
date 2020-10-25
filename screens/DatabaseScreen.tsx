import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import Filesize from 'filesize';

import { ActivityIndicator, ListIcon, Paragraph, ListItem, RefreshControl } from '../components/Themed';
import { Button, Dialog, Snackbar, Subheading, TextInput, TouchableRipple } from 'react-native-paper';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useLayoutEffect, useState } from 'react';
import main from '../styles/main';
import { DeleteItemResponse, EditItemPropertiesResponse, GerberaContainer, GerberaItem,
  GetContainersResponse, GetItemPropertiesResponse, GetItemsResponse, isInvalidSidResponse,
  ResourceData, ScheduledNotifParams, SessionInfo, isItem
} from '../types';
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
import { DbActionMenu } from '../components/ActionMenu';

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

  // refreshControl state vars
  const [refreshing, setRefreshing] = useState(false);

  // menu actions state vars
  const dlPrefix = 'gerbdl_';
  const dlErrorPrefix = 'gerberr_';
  const dlFinishedPrefix = 'gerbfn_';
  const [menuVisible, setMenuVisible] = useState(-1);

  // show item properties state vars
  const [propertiesDialogVisible, setPropertiesDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [chosenItemId, setChosenItemId] = useState(0);
  const [chosenItemTitle, setChosenItemTitle] = useState('');
  const [chosenIsContainer, setChosenIsContainer] = useState(false);
  const [chosenItemFullPath, setChosenItemFullPath] = useState('');
  const [chosenItemMimeType, setChosenItemMimeType] = useState('');
  const [chosenItemBitRate, setChosenItemBitRate] = useState('');
  const [chosenItemDuration, setChosenItemDuration] = useState('');
  const [chosenItemResolution, setChosenItemResolution] = useState('');
  const [chosenItemDescription, setChosenItemDescription] = useState('');
  const [chosenItemSize, setChosenItemSize] = useState('');

  // snackbar state vars
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackSuccess, setSnackSuccess] = useState(true);
  const snackbarDuration = 4000;

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
  async function getContainerContents(): Promise<void> {
    const containersRes: GetContainersResponse = await JSONRequest(`${hostname}/content/interface?req_type=containers&sid=${sid}&parent_id=${parentId}`, AuthedGetOptions);
    const itemsRes: GetItemsResponse = await JSONRequest(`${hostname}/content/interface?req_type=items&sid=${sid}&parent_id=${parentId}`, AuthedGetOptions);
    if (containersRes.data && !isInvalidSidResponse(containersRes.data)) {
      setContainers(containersRes.data.containers.container);
    } else await refreshSesh();
    if (itemsRes.data && !isInvalidSidResponse(itemsRes.data)) {
      setItems(itemsRes.data.items.item);
    } else await refreshSesh();
  }
  useEffect(() => {
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
  async function downloadFile(objId: string, objTitle: string): Promise<void> {
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
    async function getItemProperties(): Promise<void> {
      const res: GetItemPropertiesResponse = await JSONRequest(`${hostname}/content/interface?req_type=edit_load&sid=${sid}&object_id=${chosenItemId}`, AuthedGetOptions);
      if (res.data && !isInvalidSidResponse(res.data)) {
        setChosenItemFullPath(res.data.item.location.value);
        setChosenItemMimeType(res.data.item["mime-type"].value);
        setChosenItemDescription(res.data.item.description.value);
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
    if (chosenIsContainer || chosenItemId == 0) return;
    getItemProperties();
  }, [chosenItemId]);

  // despite the name this can work with containers also
  async function editItemProperties(): Promise<void> {
    const itemOnlyUrlParams = `&description=${encodeURIComponent(chosenItemDescription)}&mime-type=${chosenItemMimeType}`;
    const baseUrl = `${hostname}/content/interface?req_type=edit_save&sid=${sid}&object_id=${chosenItemId}&title=${encodeURIComponent(chosenItemTitle)}`;
    const url = chosenIsContainer ? baseUrl : `${baseUrl}${itemOnlyUrlParams}`;
    const res: EditItemPropertiesResponse = await JSONRequest(url, AuthedGetOptions);
    if (res.data && !isInvalidSidResponse(res.data)) {
      // if user changed the item/container title, then we refresh the container contents, so the changed title appears
      // we have to do it this way because filter over a union type in typescript doesn't fly
      const oldTitle = chosenIsContainer
        ? containers.filter(x => x.id == chosenItemId)[0].title
        : items.filter(x => x.id == chosenItemId)[0].title;
      if (chosenItemTitle != oldTitle) {
        await getContainerContents();
      }
      clearItemProperties();
      setSnackSuccess(true);
    } else {
      setSnackSuccess(false);
    }
    setSnackbarVisible(true);
  }

  async function deleteItem(objId: string): Promise<void> {
    // all=0 is always included as a param, I just don't mess with it
    const res: DeleteItemResponse = await JSONRequest(`${hostname}/content/interface?req_type=remove&sid=${sid}&object_id=${objId}&all=0`, AuthedGetOptions);
    if (res.data && !isInvalidSidResponse(res.data)) {
      await getContainerContents(); // refresh the container to show new item disappear
      setSnackSuccess(true);
    } else {
      setSnackSuccess(false);
    }
    setSnackbarVisible(true);
  }

  async function onRefresh() {
    setRefreshing(true);
    await getContainerContents();
    setRefreshing(false);
  }

  // opens the dialog specified in second arg with info from item (first arg) from an action menu
  const openDialog = (i: GerberaItem | GerberaContainer, setDialogVisible: (value: React.SetStateAction<boolean>) => void): void => {
    setChosenIsContainer(!isItem(i));
    setChosenItemId(i.id);
    setChosenItemTitle(i.title);
    setMenuVisible(-1);
    setDialogVisible(true);
  };

  const clearItemProperties = (): void => {
    setChosenItemTitle('');
    setChosenItemId(0);
    setChosenIsContainer(false);
    setChosenItemDescription('');
    setChosenItemFullPath('');
    setChosenItemMimeType('');
    setChosenItemBitRate('');
    setChosenItemDuration('');
    setChosenItemResolution('');
    setChosenItemSize('');
  };

  const openMenu = (i: GerberaItem | GerberaContainer): void => {
    // order matters here, we set the menuvisible first so the UI is snappy
    // the other two go later because they trigger fetches to the server
    // which we only run once the user sees the menu open
    setChosenIsContainer(!isItem(i));
    setMenuVisible(i.id);
    setChosenItemId(i.id);
    setChosenItemTitle(i.title);
  }

  return (
    <View style={main.fullHeight}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
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
                  {/* TODO: make openDialog work with containers for edit/properties */}
                  {containers.length > 0
                    && containers.map((c, idx) => (
                      <FolderItem
                        key={idx}
                        title={c.title}
                        right={() =>
                          <DbActionMenu
                            visible={menuVisible == c.id}
                            onDismiss={() => setMenuVisible(-1)}
                            onPress={() => openMenu(c)}
                            editAction={() => {openDialog(c, setEditDialogVisible)}}
                            deleteAction={async () => await deleteItem(c.id.toString())}
                          />
                        }
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
                          <DbActionMenu
                            visible={menuVisible == i.id}
                            onDismiss={() => setMenuVisible(-1)}
                            onPress={() => openMenu(i)}
                            propertiesAction={() => openDialog(i, setPropertiesDialogVisible)}
                            downloadAction={async () => await downloadFile(i.id.toString(), i.title)}
                            editAction={() => openDialog(i, setEditDialogVisible)}
                            deleteAction={async () => await deleteItem(i.id.toString())}
                          />
                        }
                      />
                    ))
                  }

              </List.Section>
            </View>
        }
      </ScrollView>

      {/* properties dialog */}
      <Dialog visible={propertiesDialogVisible}
        onDismiss={() => {
          clearItemProperties();
          setPropertiesDialogVisible(false);
        }}
      >
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
          <Button
            onPress={() => {
              clearItemProperties();
              setPropertiesDialogVisible(false);
            }}
          >
            Done
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* edit item properties dialog */}
      <Dialog visible={editDialogVisible}
        onDismiss={() => {
          clearItemProperties();
          setEditDialogVisible(false);
        }}
      >
        <Dialog.Title>{`Edit Item`}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            mode='outlined'
            label='Title'
            placeholder={chosenItemTitle}
            value={chosenItemTitle}
            onChangeText={title => setChosenItemTitle(title)}
            style={main.fullWidth}
          />
          {/* if edititem is being called on a container, then we don't show the description field at all */}
          {
            !chosenIsContainer &&
              <TextInput
                mode='outlined'
                label='Description'
                placeholder={chosenItemDescription}
                value={chosenItemDescription}
                onChangeText={description => setChosenItemDescription(description)}
                style={main.fullWidth}
              />
          }
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={() => {
              clearItemProperties();
              setEditDialogVisible(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onPress={async () => {
              await editItemProperties(); // clearItemProperties called inside
              setEditDialogVisible(false);
            }}
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* snackbar which shows success / failure after any post to db */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={snackbarDuration}
      >
        {
          snackSuccess
            ? 'Successfully completed operation'
            : 'Failed to complete operation'
        }
      </Snackbar>
    </View>
  )
};