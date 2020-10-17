import { GetOptions, SecureStoreOptions } from "../constants/Options";
import { GetSidResponse } from "../types";
import JSONRequest from "./JSONRequest";
import * as SecureStore from 'expo-secure-store';

export async function getSid(hostname: string): Promise<string> {
  const res: GetSidResponse = await JSONRequest(`${hostname}/content/interface?req_type=auth&action=get_sid`, GetOptions);
  if (res.data && res.data.logged_in && res.data.sid) {
    await SecureStore.setItemAsync('sid', res.data.sid, SecureStoreOptions);
    return res.data.sid;
  } else {
    return '';
  }
}