import { SessionInfo } from "../types";
import * as SecureStore from 'expo-secure-store';

const emptyInfo: SessionInfo = { hostname: '', sid: '' };

async function loadSession(): Promise<SessionInfo> {
  const hostname: string | null = await SecureStore.getItemAsync('hostname');
  if (!hostname)
    return emptyInfo; 
  const sid: string | null = await SecureStore.getItemAsync('sid');
  if (!sid)
    return emptyInfo;
  return { hostname, sid };
}

export default function sessionEffect(callback: (value: React.SetStateAction<SessionInfo>) => void) {
  return () => {
    async function initSession() {
      const sesh: SessionInfo = await loadSession();
      callback(sesh);
    }
    initSession();
  };
}