import React from "react";
import { ListIcon, ListItem, ListItemProps } from "./Themed";

export type FolderItemProps = Omit<ListItemProps, 'left'>;

// we allow props.right to be passed in so that in the DatabaseScreen
// folders can have their own action menu (in filesystem there's no need)
export default function FolderItem(props: FolderItemProps) {
  return (
    <ListItem
      left={() => <ListIcon icon='folder'/>}
      right={
        props.right 
          ? props.right
          : () => <ListIcon icon='chevron-right'/>
      }
      {...props}
    />
  );
}