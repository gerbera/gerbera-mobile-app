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

export interface GetSidResponse extends JSONResponse {
  data?: GetSidSuccessResponse
  error?: boolean
}

export interface GetClientsResponse extends JSONResponse {
  data?: GetClientsSuccessResponse
  error?: boolean
}

export interface GetDirectoriesResponse extends JSONResponse {
  data?: GetDirectoriesSuccessResponse
  error?: boolean
}

export interface GetFilesResponse extends JSONResponse {
  data?: GetFilesSuccessResponse
  error?: boolean
}