import { GestureResponderEvent } from "react-native";
import { JSONResponse } from "./utils/JSONRequest";

export enum InitialRoute {
  noHostname = "InputHostname",
  hostname = "Root"
}

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
  InputHostname: undefined;
};

export type BottomTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type TabOneParamList = {
  TabOneScreen: undefined;
};

export type DrawerParamList = {
  Database: undefined;
  "File System": undefined;
  Clients: undefined;  
};

export type DatabaseParamList = {
  Database: undefined;
};

export type FileSystemParamList = {
  "File System": undefined;
};

export type ClientsParamList = {
  Clients: undefined;
};

export type onPressFunc = (event: GestureResponderEvent) => void;

export interface GetSidSuccessResponse {
  sid_was_valid: boolean;
  sid: string;
  logged_in: boolean;
  success: boolean;
};

export interface GetSidResponse extends JSONResponse {
  data?: GetSidSuccessResponse;
  error?: boolean;
};