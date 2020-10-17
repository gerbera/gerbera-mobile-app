import * as SecureStore from 'expo-secure-store';
export const SecureStoreOptions = { keychainAccessible: SecureStore.ALWAYS };
export const GetOptions: RequestInit = {
  "headers": {
    "Accept": "*/*",
    "Cache-Control": "no-cache, must-revalidate",
    "Pragma": "no-cache"
  },
  "method": "GET",
  "mode": "cors"
};

export const AuthedGetOptions: RequestInit = {
  ...GetOptions,
  "credentials": "include"
};