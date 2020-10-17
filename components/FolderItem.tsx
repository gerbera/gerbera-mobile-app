import React from "react";
import { ListIcon, ListItem, ListItemProps } from "./Themed";

export type FolderItemProps = Omit<ListItemProps, 'left' | 'right'>;

export default function FolderItem(props: FolderItemProps) {
  return (
    <ListItem
      left={() => <ListIcon icon='folder'/>}
      right={() => <ListIcon icon='chevron-right'/>}
      {...props}
    />
  );
}