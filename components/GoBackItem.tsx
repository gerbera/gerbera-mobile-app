import * as React from "react";
import { ListIcon, ListItem, ListItemProps } from "./Themed";

export type GoBackItemProps = Omit<ListItemProps, 'title' | 'left'>;

export default function GoBackItem(props: GoBackItemProps) {
  return (
    <ListItem
      title='go back'
      left={() => <ListIcon icon='arrow-left-thick'/>}
      {...props}
    />
  );
}