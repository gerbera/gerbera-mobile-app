import { AndroidNotificationPriority, ChannelAwareTriggerInput, NotificationContentInput, NotificationRequestInput } from "expo-notifications";
import { GestureResponderEvent } from "react-native";
import { JSONResponse } from "./utils/JSONRequest";

export enum InitialRoute {
  noHostname = "Connection Settings",
  hostname = "Database"
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
  "Connection Settings": undefined
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

export type ConnectionSettingsParamList = {
  "Connection Settings": undefined
}

export type onPressFunc = (event: GestureResponderEvent) => void

export interface ScheduledNotifParams extends NotificationRequestInput {
  identifier: string,
  content: {
    title: string,
    body: string,
    vibrate: number[],
    priority: AndroidNotificationPriority,
    sticky: boolean
  },
  trigger: ChannelAwareTriggerInput
};

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

// many of these numbers (except interval) are boolean bits (0|1)
export interface GetAutoscanSuccessResponse {
  autoscan: {
    from_fs: number
    object_id: string
    scan_mode: string
    recursive: number
    hidden: number
    interval: number
    persistent: number
  }
  success: boolean
}

export interface EditAutoScanSuccessResponse {
  success: boolean
}

export interface Property {
  value: string
  editable: boolean
}

// horrible, but some of the values returned in the JSON response
// have leading spaces...
export interface ResourceData {
  resname: '----RESOURCE----' | 'handlerType' | ' bitrate' | " duration" |
    " nrAudioChannels" | " protocolInfo" | " resolution" | " sampleFrequency" |
    " size" | "-4cc"
  resvalue: string
  editable: boolean
}

export interface GetItemPropertiesSuccessResponse {
  item: {
    object_id: number
    title: Property
    class: Property
    obj_type: string
    description: Property
    location: Property
    "mime-type": Property
    metadata: {
      metadata: object[]
    }
    auxdata: {
      auxdata: object[]
    }
    resources: {
      resources: ResourceData[]
    }
    update_ids: {
      pending: boolean
    }
  }
  success: boolean
}

export interface EditItemPropertiesSuccessResponse {
  success: boolean
}

export interface DeleteItemSuccessResponse {
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
  data: GetDirectoriesSuccessResponse | GetFilesSuccessResponse |
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

export interface GetAutoscanResponse extends JSONResponse {
  data?: GetAutoscanSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface EditAutoscanResponse extends JSONResponse {
  data?: EditAutoScanSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface GetItemPropertiesResponse extends JSONResponse {
  data?: GetItemPropertiesSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface EditItemPropertiesResponse extends JSONResponse {
  data?: EditItemPropertiesSuccessResponse | InvalidSidResponse
  error?: boolean
}

export interface DeleteItemResponse extends JSONResponse {
  data?: DeleteItemSuccessResponse | InvalidSidResponse
  error?: boolean
}
