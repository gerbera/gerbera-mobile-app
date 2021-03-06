import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import * as React from 'react';
import { Image } from 'react-native';

import DatabaseScreen from '../screens/DatabaseScreen';
import FileSystemScreen from '../screens/FileSystemScreen';
import ClientsScreen from '../screens/ClientsScreen';
import { DrawerParamList, DatabaseParamList, FileSystemParamList, ClientsParamList, InitialRoute, ConnectionSettingsParamList } from '../types';
import main from '../styles/main';
import InputHostnameScreen from '../screens/InputHostnameScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator({ initialRoute }: { initialRoute: InitialRoute }) {
  return (
    <Drawer.Navigator initialRouteName={initialRoute} drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen
        name="Database"
        component={DatabaseNavigator}/>
      <Drawer.Screen
        name="File System"
        component={FileSystemNavigator}
      />
      <Drawer.Screen
        name="Clients"
        component={ClientsNavigator}
      />
      <Drawer.Screen
        name="Connection Settings"
        component={ConnectionSettingsNavigator}
      />
    </Drawer.Navigator>
  );
}

// adds the header image to the top
function DrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <Image
        resizeMode='contain'
        style={[main.fullWidth, {height: 140}]}
        source={require('../assets/images/gerbera_header.png')}
      />
      <DrawerItemList {...props}/>
    </DrawerContentScrollView>
  )
}

const DatabaseStack = createStackNavigator<DatabaseParamList>();

function DatabaseNavigator() {
  return (
    <DatabaseStack.Navigator>
      <DatabaseStack.Screen
        name="Database"
        component={DatabaseScreen}
      />
    </DatabaseStack.Navigator>
  )
}

const FileSystemStack = createStackNavigator<FileSystemParamList>();

function FileSystemNavigator() {
  return (
    <FileSystemStack.Navigator>
      <FileSystemStack.Screen
        name="File System"
        component={FileSystemScreen}
      />
    </FileSystemStack.Navigator>
  )
}

const ClientsStack = createStackNavigator<ClientsParamList>();

function ClientsNavigator() {
  return (
    <ClientsStack.Navigator>
      <ClientsStack.Screen
        name="Clients"
        component={ClientsScreen}
      />
    </ClientsStack.Navigator>
  )
}

const ConnectionSettingsStack = createStackNavigator<ConnectionSettingsParamList>();

function ConnectionSettingsNavigator() {
  return (
    <ConnectionSettingsStack.Navigator>
      <ConnectionSettingsStack.Screen
        name="Connection Settings"
        component={InputHostnameScreen}
      />
    </ConnectionSettingsStack.Navigator>
  )
}
