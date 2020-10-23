import React from "react";
import { Menu, TouchableRipple } from 'react-native-paper';
import pick from "../utils/Pick";
import { ListIcon } from './Themed';

type ActionMenuProps = {
  visible: boolean
  onDismiss: () => void
  onPress: () => void
  children?: React.ReactNode
}

export function ActionMenu(props: ActionMenuProps) {
  const {onPress, children, ...otherProps} = props;
  return (
    <Menu
      anchor={
        <TouchableRipple onPress={onPress}>
          <ListIcon icon='dots-vertical'/>
        </TouchableRipple>
      }
      {...otherProps}
    >
      {children}
    </Menu>
  );
}

type DbActionMenuProps = ActionMenuProps & {
  propertiesAction?: () => void
  downloadAction?: () => void
  editAction: () => void
  deleteAction: () => void      
}
  
export function DbActionMenu(props: DbActionMenuProps) {
  const AMProps = pick(props, ['visible', 'onDismiss', 'onPress']);
  const menuItems = [
    <Menu.Item key='edt' title='Edit' onPress={props.editAction}/>,
    <Menu.Item key='del' title='Delete' onPress={props.deleteAction}/>
  ];

  // if downloadAction/propertiesAction prop are passed in, we add it to menuitems
  if (props.downloadAction) {
    menuItems.unshift(
      <Menu.Item key='dl' title='Download' onPress={props.downloadAction}/>
    );
  }
  if (props.propertiesAction) {
    menuItems.unshift(
      <Menu.Item key='props' title='Properties' onPress={props.propertiesAction}/>
    );
  }

  return (
    <ActionMenu {...AMProps}>
      {menuItems}
    </ActionMenu>
  );
}