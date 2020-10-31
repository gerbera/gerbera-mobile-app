import { SessionInfo } from "../types";

export const emptySession: SessionInfo = {hostname: '', sid: ''};

export function notAuthed(hostname: string, sid: string): boolean {
  return hostname == emptySession.hostname && sid == emptySession.sid;
}