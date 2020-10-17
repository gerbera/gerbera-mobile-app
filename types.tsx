import { GestureResponderEvent } from "react-native";
import { JSONResponse } from "./utils/JSONRequest";

export enum InitialRoute {
  noHostname = "InputHostname",
  hostname = "Root"
}

export type RootStackParamList = {
  Root: undefined
  NotFound: undefined
  InputHostname: undefined
}

export type BottomTabParamList = {
  TabOne: undefined
  TabTwo: undefined
}

export type TabOneParamList = {
  TabOneScreen: undefined
}

export type DrawerParamList = {
  Database: undefined
  "File System": undefined
  Clients: undefined  
}

export type DatabaseParamList = {
  Database: undefined
}

export type FileSystemParamList = {
  "File System": undefined
}

export type ClientsParamList = {
  Clients: undefined
}

export type onPressFunc = (event: GestureResponderEvent) => void

export type SessionInfo = {
  hostname: string,
  sid: string
}

export interface GetSidSuccessResponse {
  sid_was_valid: boolean
  sid: string
  logged_in: boolean
  success: boolean
}

export type GerberaClient = {
  ip: string
  host: string
  time: string
  last: string
  userAgent: string
  name: string
  match: string
  flags: string
  matchType: string
  clientType: string
}

export interface GetClientsSuccessResponse {
  clients: {
    client: GerberaClient[]
  }
  success: boolean
}

export interface GerberaDirectory {
  id: string
  child_count: boolean
  title: string
}

export interface GetDirectoriesSuccessResponse {
  containers: {
    parent_id: string
    select_it: number
    type: ('filesystem')
    container: GerberaDirectory[]
  }
  success: boolean
}

export interface GerberaFile {
  id: string
  filename: string
}

export interface GetFilesSuccessResponse {
  files: {
    parent_id: string
    location: string
    file: GerberaFile[]
  }
  update_ids: {
    pending: boolean
  }
  success: boolean
}

export interface AddFileToDbSuccessResponse {
  success: boolean
}

export interface GerberaContainer {
  id: number,
  child_count: number,
  autoscan_type: string,
  autoscan_mode: string,
  title: string
}

export interface GetContainersSuccessResponse {
  containers: {
    parent_id: number
    type: string
    select_it: number
    container: GerberaContainer[]
  }
  success: boolean
}

export interface GerberaItem {
  id: number
  title: string
  res: string
}

export interface GetItemsSuccessResponse {
  items: {
    parent_id: number
    location: string
    virtual: boolean
    start: number
    total_matches: number
    autoscan_mode: string
    autoscan_type: string
    protect_container: false
    protect_items: false
    item: GerberaItem[]
  }
  update_ids: {
    pending: boolean
  }
  success: boolean
}

export interface InvalidSidResponse {
  error: {
    code: string,
    text: 'invalid session id'
  }
  success: ('false')
}

export function isInvalidSidResponse(
  data: GetDirectoriesSuccessResponse| GetFilesSuccessResponse |
  AddFileToDbSuccessResponse | InvalidSidResponse
): data is InvalidSidResponse {
  return (data as InvalidSidResponse).error !== undefined;
}

export interface GetSidResponse extends JSONResponse {
  data?: GetSidSuccessResponse
  error?: boolean
}

export interface GetClientsResponse extends JSONResponse {
  data?: GetClientsSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface GetDirectoriesResponse extends JSONResponse {
  data?: GetDirectoriesSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface GetFilesResponse extends JSONResponse {
  data?: GetFilesSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface AddFileToDbResponse extends JSONResponse {
  data?: AddFileToDbSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface GetContainersResponse extends JSONResponse {
  data?: GetContainersSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface GetItemsResponse extends JSONResponse {
  data?: GetItemsSuccessResponse | InvalidSidResponse
  error?: boolean
}