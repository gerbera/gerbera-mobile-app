import * as React from 'react';
import { View as DefaultView } from 'react-native';
import {
  Button as PaperButton,
  ActivityIndicator as PaperActivityIndicator,
  List as PaperList,
  TouchableRipple,
  Paragraph as PaperParagraph
} from 'react-native-paper';
import { Feather as DefaultFeather } from '@expo/vector-icons';

import useColorScheme from '../hooks/useColorScheme';
import { combineThemes } from '../hooks/combineThemes';
import { useEffect, useState } from 'react';
import useComponentSize from '../hooks/useComponentSize';

export function useThemeColor(
  colorName: keyof ReactNativePaper.ThemeColors
): string {
  const colorScheme = useColorScheme();
  const theme = combineThemes(colorScheme);
  return theme.colors[colorName];
}

type DefaultIconProps = {
  name: string;
  size: number;
  style: object | [object];
}

export type IconProps =  DefaultIconProps;
export type ButtonProps =  React.ComponentProps<typeof PaperButton>;
export type ActivityIndicatorProps =  React.ComponentProps<typeof PaperActivityIndicator>;


export function BorderedView(props: DefaultView['props']) {
  const { style, ...otherProps } = props;
  const borderColor = useThemeColor('text');
  return <DefaultView style={[{ borderColor }, style]} {...otherProps} />;
}

export function Feather(props: IconProps) {
  const { name, size, style } = props;
  const color = useThemeColor('icon');

  return <DefaultFeather name={name} size={size} color={color} style={style}/>
}

export type ListItemProps = React.ComponentProps<typeof PaperList.Item>;

export function ListItem(props: ListItemProps) {
  const { onPress, ...otherProps } = props;
  return (
    <TouchableRipple onPress={onPress}>
      <PaperList.Item {...otherProps}/>
    </TouchableRipple>
  );
}

export function ListIcon(props: React.ComponentProps<typeof PaperList.Icon>) {
  const color = useThemeColor('icon');
  return <PaperList.Icon color={color} {...props}/>;
}

export function ActivityIndicator(props: ActivityIndicatorProps) {
  const color = useThemeColor('icon');
  return <PaperActivityIndicator color={color} {...props}/>;
}

export function Paragraph(props: React.ComponentProps<typeof PaperParagraph>) {
  const color = useThemeColor('accenttext');
  const {style, children, ...otherProps} = props;
  return (
    <PaperParagraph style={[style, {color}]} {...otherProps}>
      {children}
    </PaperParagraph>
  );
}

// Uses lots of inspo from here: https://humble.dev/creating-a-nice-loading-button-with-react-hooks
export function Button(props: ButtonProps) {
  const [size, onLayout] = useComponentSize();
  const [showLoading, setShowLoading] = useState(false);
  const {width, height}: {width: undefined | number, height: undefined | number} = size;
  const { loading, ...otherProps } = props;
  const color = useThemeColor('text');

  useEffect(() => {
    if (loading)
      setShowLoading(true);

    if (!loading && showLoading) {
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 400);

      return () => {
        clearTimeout(timeout); 
      };
    }

  }, [loading, showLoading]);

  return (
    <PaperButton
      onLayout={onLayout}
      color={color}
      style={
        size.width && size.height
        ? {
          width: size.width,
          height: size.height
        }
        : {}
      }
      loading={showLoading}
      {...otherProps}
    >
      {showLoading ? "Loading" : otherProps.children}
    </PaperButton>
  );
}
