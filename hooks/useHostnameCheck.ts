import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

export default function useHostnameCheck(): { checkedHostname: boolean, hasHostname: boolean } {
  const [checkedHostname, setCheckedHostname] = useState(false);
  const [hasHostname, setHasHostname] = useState(false);

  useEffect(() => {
    async function checkHostname(): Promise<void> {
      const hostname = await SecureStore.getItemAsync('hostname');
      setHasHostname(hostname ? true : false);
      setCheckedHostname(true);
    }

    checkHostname();
  }, []);

  return { checkedHostname, hasHostname };
}