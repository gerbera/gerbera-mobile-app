import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { GetOptions, SecureStoreOptions } from "../constants/Options";
import { GetSidResponse } from "../types";
import JSONRequest from "../utils/JSONRequest";

export default function useHostnameCheck(): { checkedHostname: boolean, hasHostname: boolean } {
  const [checkedHostname, setCheckedHostname] = useState(false);
  const [hasHostname, setHasHostname] = useState(false);

  useEffect(() => {
    async function checkHostname(): Promise<void> {
      const hostname = await SecureStore.getItemAsync('hostname');
      const res: GetSidResponse = await JSONRequest(`${hostname}/content/interface?req_type=auth&action=get_sid`, GetOptions);
      if (res.data && res.data.logged_in && res.data.sid) {
        SecureStore.setItemAsync('sid', res.data.sid, SecureStoreOptions);
        setHasHostname(true);
        setCheckedHostname(true);
      } else {
        setHasHostname(false);
        setCheckedHostname(false);
      }
    }

    checkHostname();
  }, []);

  return { checkedHostname, hasHostname };
}