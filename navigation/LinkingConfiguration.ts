import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Database: {
        screens: {
          DatabaseScreen: 'database'
        }
      },
      FileSystem: {
        screens: {
          FileSystemScreen: 'filesystem'
        }
      },
      Clients: {
        screens: {
          ClientsScreen: 'clients'
        }
      },
      ConnectionSettings: {
        ConnectionSettingsScreen: 'connectionsettings'
      }
    }
  },
};
