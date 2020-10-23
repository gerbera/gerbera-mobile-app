import * as React from 'react';
import { View } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';

import { ActivityIndicator, Button as LoadingButton, ListIcon, ListItem } from '../components/Themed';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useLayoutEffect, useState } from 'react';
import main from '../styles/main';
import { AddFileToDbResponse, EditAutoscanResponse, GerberaDirectory, GerberaFile, GetAutoscanResponse, GetDirectoriesResponse, GetFilesResponse, isInvalidSidResponse, SessionInfo } from '../types';
import JSONRequest from '../utils/JSONRequest';
import { AuthedGetOptions } from '../constants/Options';
import { ScrollView } from 'react-native';
import { List, Snackbar, TouchableRipple, Portal, FAB, Dialog, RadioButton, Subheading, TextInput, Button, Checkbox } from 'react-native-paper';
import getIconForFileType from '../constants/FileExtIcons';
import sessionEffect from '../auth/sessionEffect';
import refreshSession from '../auth/refreshSession';
import GoBackItem from '../components/GoBackItem';
import FolderItem from '../components/FolderItem';

export default function FileSystemScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const emptySession: SessionInfo = {hostname: '', sid: ''};
  const [{hostname, sid}, setSession] = useState(emptySession);
  const emptyParentDirStack: GerberaDirectory[] = [];
  const [parentDirStack, setParentDirStack] = useState(emptyParentDirStack);
  const rootDir: GerberaDirectory = {id: '0', child_count: false, title: ''};
  const [currDir, setCurrDir] = useState(rootDir);
  const [fullPath, setFullPath] = useState('');
  const noDirs: GerberaDirectory[] = [];
  const [dirs, setDirs] = useState(noDirs);
  const noFiles: GerberaFile[] = [];
  const [files, setFiles] = useState(noFiles);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const snackbarDuration = 4000;
  const [fileToAddId, setFileToAddId] = useState('0');
  const [fabOpen, setFabOpen] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [autoscanMode, setAutoscanMode] = useState('none');
  const [seconds, setSeconds] = useState('0');
  const [recursive, setRecursive] = useState(false);
  const [inclHidden, setInclHidden] = useState(false);
  const notAuthed: () => boolean = () => {
    return hostname == emptySession.hostname && sid == emptySession.sid;
  };
  
  useEffect(() => {
    navigation.setOptions({
      headerLeft: (props: StackHeaderLeftButtonProps) => (<MenuIcon/>)
    });
  });

  // loads server connection information (hostname and session id)
  // needs to run before everything else, so this is useLayoutEffect
  useLayoutEffect(sessionEffect(setSession), []);

  // refreshes server id, could be abstracted away probably
  const refreshSesh = async () => {
    if (notAuthed()) return;
    const sesh = await refreshSession(hostname);
    setSession(sesh);
  }

  // updates the fullPath to reflect the new directory that was just added
  useEffect(() => {
    // remove the first elem of parentDirStack since it's the root directory
    // (and thus an empty string which we'll replace with a leading '/' char)
    const dirStackNoRoot = parentDirStack.filter(x => x.title != '');
    // concat all the titles of the parent dirs together slashes need to be added manually
    const parentFullPath = dirStackNoRoot.reduce((baseStr, dir) => baseStr.concat('/', dir.title), '');

    // add current directory to the end
    setFullPath(parentFullPath.concat('/', currDir.title));
  }, [parentDirStack]);

  // this turns the loading animation off when we get a new set of dirs/files
  useEffect(() => {
    setLoading(false);
  }, [dirs]);

  // ls for current directory
  useEffect(() => {
    async function getDirContents() {
      const parentId: string = currDir.id;
      const dirRes: GetDirectoriesResponse = await JSONRequest(`${hostname}/content/interface?req_type=directories&sid=${sid}&parent_id=${parentId}`, AuthedGetOptions);
      const fileRes: GetFilesResponse = await JSONRequest(`${hostname}/content/interface?req_type=files&sid=${sid}&parent_id=${parentId}`, AuthedGetOptions);
      if (dirRes.data && !isInvalidSidResponse(dirRes.data)) {
        setDirs(dirRes.data.containers.container);
      } else await refreshSesh();
      if (fileRes.data && !isInvalidSidResponse(fileRes.data)) {
        setFiles(fileRes.data.files.file);
      } else await refreshSesh();
    }

    if (notAuthed()) return;
    getDirContents();
  }, [currDir, hostname, sid]);

  // adds a file from file system to the database
  useEffect(() => {
    async function addToDb(id: string) {
      const res: AddFileToDbResponse = await JSONRequest(`${hostname}/content/interface?req_type=add&sid=${sid}&object_id=${id}`, AuthedGetOptions);

      if (res.data && !isInvalidSidResponse(res.data)) {
        
        // show the snackbar
        setSnackbarVisible(true);
        setFileToAddId('0'); // unset the file to add (avoid duplicate additions)
        
        // unset the snackbar's visibility (prevent it showing again if app refreshes)
        const timeout = setTimeout(() => {
          setSnackbarVisible(false);
        }, snackbarDuration);
        return () => {
          clearTimeout(timeout);
        };

      } else await refreshSesh();
    }

    if (notAuthed()) return;
    if (fileToAddId == '0') return;
    addToDb(fileToAddId);
  }, [fileToAddId, hostname, sid]);

  // edits / adds the autoscan info for the current directory
  async function loadAutoscanInfo(id: string) {
    if (notAuthed()) return;
    const res: GetAutoscanResponse = await JSONRequest(`${hostname}/content/interface?req_type=autoscan&action=as_edit_load&sid=${sid}&object_id=${id}&from_fs=true`, AuthedGetOptions);
    if (res.data && !isInvalidSidResponse(res.data)) {
      setAutoscanMode(res.data.autoscan.scan_mode);
      setSeconds(res.data.autoscan.interval.toString());
      setRecursive(res.data.autoscan.recursive == 1 ? true : false);
      setRecursive(res.data.autoscan.hidden == 1 ? true : false);
    } else await refreshSesh();
  }

  async function postAutoscanInfo(id: string) {
    if (notAuthed()) return;

    // recursive and inclHidden are sent as URL param values (1 for true, 0 for false)
    const recursiveBit = recursive ? '1' : '0';
    const inclHiddenBit = inclHidden ? '1' : '0';

    const res: EditAutoscanResponse = await JSONRequest(`${hostname}/content/interface?req_type=autoscan&action=as_edit_save&sid=${sid}&object_id=${id}&from_fs=true&scan_mode=${autoscanMode}&recursive=${recursiveBit}&hidden=${inclHiddenBit}&interval=${seconds}`, AuthedGetOptions);
    if (!res.data || isInvalidSidResponse(res.data))
      refreshSesh();
  }

  return (
    <View style={main.fullHeight}>
      <ScrollView>
        { loading
          ? <ActivityIndicator style={main.marginTop}/>
          : <View style={main.flexstart}>
              <List.Section style={main.fullWidth}>

                {/* back button */}
                {currDir.id != '0'
                  ? <GoBackItem
                      key={currDir.id}
                      onPress={() => {
                        // get the last parentId, remove it from the parentIdStack
                        // and setParentId with the last parentId
                        setLoading(true);
                        const lastDir = parentDirStack.slice(-1)[0];
                        setParentDirStack(parentDirStack.filter(x => x.id != lastDir.id));
                        setCurrDir(lastDir);
                      }}
                    />
                  : null
                }

                {/* directories */}
                {dirs.length > 0
                  && dirs.map((d, idx) => (
                    <FolderItem
                      key={idx}
                      title={d.title}
                      onPress={() => {
                        // add the current parentId to the parentIdStack
                        // and make the new parentId this directory's id
                        setLoading(true);
                        setParentDirStack([ ...parentDirStack, currDir]);
                        setCurrDir(d);
                      }}
                    />
                  ))
                }

                {/* files */}
                {files.length > 0
                  && files.map((f, idx) => (
                    <ListItem
                      key={idx}
                      title={f.filename}
                      left={() => <ListIcon icon={getIconForFileType(f.filename)}/>}
                      right={() =>
                        <TouchableRipple onPress={() => setFileToAddId(f.id)}>
                          <ListIcon icon='plus'/>
                        </TouchableRipple>
                      }
                    />
                  ))
                }

              </List.Section>
            </View>
        }
      </ScrollView>

      {/* all the below elements have to be outside the scrollview or they don't show up on screen well */}

      {/* snackbar which shows success when a file is added to the database */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={snackbarDuration}
      >
        Added file to the database
      </Snackbar>
      {/* floating action button */}
      <Portal>
        <FAB.Group
          visible={!loading && !dialogVisible && isFocused}
          open={fabOpen}
          icon={fabOpen ? 'window-close' : 'plus'}
          onStateChange={({ open }) => setFabOpen(open)}
          actions={[
            { 
              icon: 'folder-plus-outline', label: 'Add All Items',
              onPress: () => setFileToAddId(currDir.id)
            },
            { 
              icon: 'history', label: 'Add Autoscan Item',
              onPress: async () => {
                await loadAutoscanInfo(currDir.id);
                setDialogVisible(true);
              }
            }
          ]}
          style={{marginRight: 10, marginBottom: 7}}
        />
      </Portal>

      {/* add autoscan item dialog */}
      <Dialog visible={dialogVisible}>
        <Dialog.Title>{`Add Autoscan for ${fullPath}`}</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group onValueChange={(value) => setAutoscanMode(value)} value={autoscanMode}>
            <Subheading>Autoscan Mode</Subheading>
            <RadioButton.Item label='none' value='none'></RadioButton.Item>
            <RadioButton.Item label='timed' value='timed'></RadioButton.Item>
            <RadioButton.Item label='inotify' value='inotify'></RadioButton.Item>
          </RadioButton.Group>
          <Subheading>Scan Options</Subheading>
          <Checkbox.Item
            label='Recursive'
            disabled={autoscanMode == 'none'}
            onPress={() => setRecursive(!recursive)} status={recursive ? 'checked' : 'unchecked'}
          />
          <Checkbox.Item
            label='Include hidden files/directories'
            disabled={autoscanMode == 'none'}
            onPress={() => setInclHidden(!inclHidden)} status={inclHidden ? 'checked' : 'unchecked'}
          />
          <TextInput 
            mode='outlined'
            label='Scan Interval (in seconds)'
            placeholder='0'
            disabled={autoscanMode != 'timed'}
            value={seconds}
            onChangeText={seconds => setSeconds(seconds)}
            style={main.fullWidth}
          />
        </Dialog.Content>
        <Dialog.Actions>
        <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
        <LoadingButton
          onPress={async () => {
            await postAutoscanInfo(currDir.id);
            setDialogVisible(false);
          }}
        >
          Save
        </LoadingButton>
        </Dialog.Actions>
      </Dialog>
    </View>
  )
};