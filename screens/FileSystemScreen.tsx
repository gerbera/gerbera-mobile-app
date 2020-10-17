import * as React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';

import { ActivityIndicator, ListIcon, ListItem } from '../components/Themed';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useLayoutEffect, useState } from 'react';
import main from '../styles/main';
import { AddFileToDbResponse, GerberaDirectory, GerberaFile, GetDirectoriesResponse, GetFilesResponse, isInvalidSidResponse, SessionInfo } from '../types';
import JSONRequest from '../utils/JSONRequest';
import { AuthedGetOptions } from '../constants/Options';
import { ScrollView } from 'react-native';
import { List, Snackbar, TouchableRipple } from 'react-native-paper';
import getIconForFileType from '../constants/FileExtIcons';
import sessionEffect from '../auth/sessionEffect';
import refreshSession from '../auth/refreshSession';
import GoBackItem from '../components/GoBackItem';
import FolderItem from '../components/FolderItem';

export default function FileSystemScreen() {
  const navigation = useNavigation();
  const emptySession: SessionInfo = {hostname: '', sid: ''};
  const [{hostname, sid}, setSession] = useState(emptySession);
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
  const snackBarDuration = 4000;
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

  // this turns the loading animation off when we get a new set of dirs/files
  useEffect(() => {
    setLoading(false);
  }, [dirs]);

  // ls for current directory
  useEffect(() => {
    async function getDirContents() {
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
  }, [parentId, hostname, sid]);

  // adds a file from file system to the database
  useEffect(() => {
    async function addToDb(id: string) {
      const res: AddFileToDbResponse = await JSONRequest(`${hostname}/content/interface?req_type=add&sid=${sid}&object_id=${id}`, AuthedGetOptions);

      if (res.data && !isInvalidSidResponse(res.data)) {
        
        // show the snackbar
        setSnackBarVisible(true);
        setFileToAddId('0'); // unset the file to add (avoid duplicate additions)
        
        // unset the snackbar's visibility (prevent it showing again if app refreshes)
        const timeout = setTimeout(() => {
          setSnackBarVisible(false);
        }, snackBarDuration);
        return () => {
          clearTimeout(timeout);
        };

      } else await refreshSesh();
    }

    if (notAuthed()) return;
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
                {dirs.length > 0
                  && dirs.map((d, idx) => (
                    <FolderItem
                      key={idx}
                      title={d.title}
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
        duration={snackBarDuration}
      >
        Added file to the database
      </Snackbar>
    </View>
  )
};