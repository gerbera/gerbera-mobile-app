import { SessionInfo } from "../types";
import { getSid } from "../utils/API";

export default async function refreshSession(hostname: string): Promise<SessionInfo> {
  const sid = await getSid(hostname);
  return { hostname, sid };
}