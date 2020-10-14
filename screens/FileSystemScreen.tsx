import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';

import { ActivityIndicator, ListIcon, ListItem, View, Snackbar, TouchableRipple } from '../components/Themed';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useLayoutEffect, useState } from 'react';
import main from '../styles/main';
import { AddFileToDbResponse, GerberaDirectory, GerberaFile, GetDirectoriesResponse, GetFilesResponse, isInvalidSidResponse, SessionInfo } from '../types';
import JSONRequest from '../utils/JSONRequest';
import { GetOptions } from '../constants/Options';
import { ScrollView } from 'react-native';
import { List } from 'react-native-paper';
import getIconForFileType from '../constants/FileExtIcons';
import sessionEffect from '../auth/sessionEffect';
import refreshSession from '../auth/refreshSession';

export default function FileSystemScreen() {
  const navigation = useNavigation();
  const emptyInfo: SessionInfo = {hostname: '', sid: ''};
  const [{hostname, sid}, setSession] = useState(emptyInfo);
  const emptyParentIdStack: string[] = [];
  const [parentIdStack, setParentIdStack] = useState(emptyParentIdStack);
  const [parentId, setParentId] = useState('0');
  const noDirs: GerberaDirectory[] = [];
  const [dirs, setDirs] = useState(noDirs);
  const noFiles: GerberaFile[] = [];
  const [files, setFiles] = useState(noFiles);
  const [loading, setLoading] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [fileToAddId, setFileToAddId] = useState('0');
  
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
    if (hostname == '') return;
    const sesh = await refreshSession(hostname);
    setSession(sesh);
  }

  // this turns the loading animation off when we get a new set of dirs/files
  useEffect(() => {
    setLoading(false);
  }, [dirs]);

  // ls for current directory
  useEffect(() => {
    async function getDirContents() {
      const dirRes: GetDirectoriesResponse = await JSONRequest(`${hostname}/content/interface?req_type=directories&sid=${sid}&parent_id=${parentId}`, {
        "credentials": "include",
        ...GetOptions
      });
      const fileRes: GetFilesResponse = await JSONRequest(`${hostname}/content/interface?req_type=files&sid=${sid}&parent_id=${parentId}`, {
        "credentials": "include",
        ...GetOptions
      });
      if (dirRes.data && !isInvalidSidResponse(dirRes.data)) {
        setDirs(dirRes.data.containers.container);
      } else await refreshSesh();
      if (fileRes.data && !isInvalidSidResponse(fileRes.data)) {
        setFiles(fileRes.data.files.file);
      } else await refreshSesh();
    }

    if (hostname == '') return;
    getDirContents();
  }, [parentId, hostname, sid]);

  // adds a file from file system to the database
  useEffect(() => {
    async function addToDb(id: string) {
      const res: AddFileToDbResponse = await JSONRequest(`${hostname}/content/interface?req_type=add&sid=${sid}&object_id=${id}`, {
        "credentials": "include",
        ...GetOptions
      });

      if (res.data && !isInvalidSidResponse(res.data)) {
        setSnackBarVisible(true);
      } else await refreshSesh();
    }

    if (fileToAddId == '0') return;
    addToDb(fileToAddId);
  }, [fileToAddId, hostname, sid]);

  return (
    <View>
      <ScrollView>
        { loading
          ? <ActivityIndicator style={main.marginTop}/>
          : <View style={main.flexstart}>
              <List.Section style={main.fullWidth}>
                {/* back button */}
                {parentId != '0'
                  ? <ListItem
                      key={parentId}
                      title='go back'
                      left={() => <ListIcon icon='arrow-left-thick'/>}
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
                {dirs.length > 0
                  && dirs.map((d, idx) => (
                    <ListItem
                      key={idx}
                      title={d.title}
                      left={() => <ListIcon icon='folder'/>}
                      right={() => <ListIcon icon='chevron-right'/>}
                      onPress={() => {
                        // add the current parentId to the parentIdStack
                        // and make the new parentId this directory's id
                        setLoading(true);
                        setParentIdStack([ ...parentIdStack, parentId ]);
                        setParentId(d.id);
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
      <Snackbar
        visible={snackBarVisible}
        onDismiss={() => setSnackBarVisible(false)}
      >
        Added file to the database
      </Snackbar>
    </View>
  )
};