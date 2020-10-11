import { useCallback, useState } from "react";

export default function useComponentSize(): [size: { width: undefined | number, height: undefined | number }, onLayout: (event: any) => void] {
  const [size, setSize] = useState({ width: undefined, height: undefined });
  const onLayout = useCallback(event => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);
  
  return [size, onLayout];
};