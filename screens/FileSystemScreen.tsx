import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';

import { ActivityIndicator, ListIcon, ListItem, Text, View } from '../components/Themed';
import MenuIcon from '../components/MenuIcon';
import { useEffect, useState } from 'react';
import main from '../styles/main';
import { GerberaDirectory, GerberaFile, GetDirectoriesResponse, GetDirectoriesSuccessResponse, GetFilesResponse } from '../types';
import JSONRequest from '../utils/JSONRequest';
import { GetOptions } from '../constants/Options';
import { ScrollView } from 'react-native';
import { List } from 'react-native-paper';
import getIconForFileType from '../constants/FileExtIcons';

export default function FileSystemScreen() {
  const navigation = useNavigation();
  const emptyParentIdStack: string[] = [];
  const [parentIdStack, setParentIdStack] = useState(emptyParentIdStack);
  const [parentId, setParentId] = useState('0');
  const noDirs: GerberaDirectory[] = [];
  const [dirs, setDirs] = useState(noDirs);
  const noFiles: GerberaFile[] = [];
  const [files, setFiles] = useState(noFiles);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    navigation.setOptions({
      headerLeft: (props: StackHeaderLeftButtonProps) => (<MenuIcon/>)
    });
  });

  useEffect(() => {
    setLoading(false);
  }, [dirs]);

  // TODO: Handle errors when fetching data
  useEffect(() => {
    async function fetchData() {
      const hostname = await SecureStore.getItemAsync('hostname');
      const sid = await SecureStore.getItemAsync('sid');
      const dirRes: GetDirectoriesResponse = await JSONRequest(`${hostname}/content/interface?req_type=directories&sid=${sid}&parent_id=${parentId}`, {
        "credentials": "include",
        ...GetOptions
      });
      const fileRes: GetFilesResponse = await JSONRequest(`${hostname}/content/interface?req_type=files&sid=${sid}&parent_id=${parentId}`, {
        "credentials": "include",
        ...GetOptions
      });
      if (dirRes.data) {
        setDirs(dirRes.data.containers.container);
      }
      if (fileRes.data) {
        setFiles(fileRes.data.files.file);
      }
    }
    fetchData();
  }, [parentId]);

  return (
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
                  />
                ))
              }
            </List.Section>
          </View>
      }
    </ScrollView>
  )
};