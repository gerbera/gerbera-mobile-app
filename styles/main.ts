import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  flexstart: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  infoRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: "flex-start",
    alignItems: 'center',
    borderWidth: 1,
    flexWrap: 'wrap'
  },
  rowSpacer: {
    flex: 1
  },
  thinBorder: {
    borderWidth: 1
  },
  inputWrapper: {
    width: '80%'
  },
  inputSpacer: {
    minHeight: 20
  },
  input: {
    width: '100%'
  },
  marginBottom: {
    marginBottom: 35
  }
});