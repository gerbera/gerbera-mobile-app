import * as React from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';
import {
  TextInput as PaperTextInput,
  Button as PaperButton,
  ActivityIndicator as PaperActivityIndicator,
  Title as PaperTitle,
  Headline as PaperHeadline
} from 'react-native-paper';
import { Feather as DefaultFeather } from '@expo/vector-icons';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { useEffect, useState } from 'react';
import useComponentSize from '../hooks/useComponentSize';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// corresponds to the theme colors from react-native-paper
// https://callstack.github.io/react-native-paper/theming.html
export function useRnpTheme() {
  return {
    colors: {
      background: useThemeColor({}, 'background'),
      text: useThemeColor({}, 'text'),
      primary: useThemeColor({}, 'orange'),
      placeholder: useThemeColor({}, 'subtext')  
    }
  };
};

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

type DefaultIconProps = {
  name: string;
  size: number;
  style: object | [object];
}

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type IconProps = ThemeProps & DefaultIconProps;
export type TextInputProps = ThemeProps & React.ComponentProps<typeof PaperTextInput>;
export type ButtonProps = ThemeProps & React.ComponentProps<typeof PaperButton>;
export type ActivityIndicatorProps = ThemeProps & {delay: number} & React.ComponentProps<typeof PaperActivityIndicator>;

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function BorderedView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'subtext')

  return <DefaultView style={[{ backgroundColor, borderColor }, style]} {...otherProps} />;
}

export function Feather(props: IconProps) {
  const { lightColor, darkColor, name, size, style } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultFeather name={name} size={size} color={color} style={style}/>
}

export function TextInput(props: TextInputProps) {
  const theme = useRnpTheme();
  return <PaperTextInput theme={theme} {...props}/>;
}

export function Title(props: React.ComponentProps<typeof PaperTitle>) {
  const color = useThemeColor({}, 'text');
  return <PaperTitle style={{ color }} {...props}/>;
}

export function Headline(props: React.ComponentProps<typeof PaperHeadline>) {
  const color = useThemeColor({}, 'text');
  return <PaperHeadline style={{ color }} {...props}/>;
}

// Uses lots of inspo from here: https://humble.dev/creating-a-nice-loading-button-with-react-hooks
export function Button(props: ButtonProps) {
  const [size, onLayout] = useComponentSize();
  const [showLoading, setShowLoading] = useState(false);
  const {width, height}: {width: undefined | number, height: undefined | number} = size;
  const { lightColor, darkColor, loading, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

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
