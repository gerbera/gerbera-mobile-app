import { BackHandler } from "react-native";

export default function handleBackPress(condition: boolean, callback: () => void): () => () => void {
  return () => {
    const onBackPress = () => {
      // remember 0 is what we initialize the parentId state var as
      // so this is equivalent to being in a container/dir with no parent
      if (condition) {
        callback();
        return true;
      } else {
        return false;
      }
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }
}
