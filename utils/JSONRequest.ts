import { FetchResult } from "react-native";

export type JSONResponse = {
  data?: any,
  error?: boolean
}

export default async function JSONRequest(url : string, options : RequestInit): Promise<JSONResponse> {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const resJson = await res.json();
      return { data: resJson };
    } else {
      return { data: undefined };
    }
  } catch (error) {
    return { error: true };
  }
}